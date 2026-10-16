import { useState, useEffect, useRef } from 'react';
import {
    getMyAppointments,
    getPortalDoctors,
    getPortalAppointmentTypes,
    getPortalSlots,
    getPortalRescheduleSlots,
    bookMyAppointment,
    rescheduleMyAppointment,
    cancelMyAppointment,
} from '../../api/portalService';
import './MyAppointments.css';

const MAX_DAYS_AHEAD = 90; 

function apiError(err, fallback) {
    const data = err?.response?.data;
    if (!data) return err?.response ? fallback : 'Could not reach the server. Please try again.';
    if (typeof data === 'string') return data;
    if (data.errors && typeof data.errors === 'object') return Object.values(data.errors).flat().join(' ');
    return data.message || data.title || fallback;
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
}

function formatTime(slot) {
    const [h, m] = slot.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function slotStart(a) {
    const [h, m] = a.timeSlot.split(':').map(Number);
    const d = new Date(a.appointmentDate);
    d.setHours(h, m, 0, 0);
    return d;
}

// Can still be changed: not cancelled/completed, and hasn't started yet
function isUpcoming(a) {
    return a.statusName !== 'Cancelled' && a.statusName !== 'Completed' && slotStart(a) > new Date();
}

// "YYYY-MM-DD" in the user's local time zone
function localDate(daysFromToday = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toLocaleDateString('en-CA');
}

/* ---------- slot picker (shared by Book and Reschedule) ---------- */

function SlotPicker({ ready, loading, error, slots, selected, onSelect }) {
    if (!ready) return <div className="pa-slots-hint">Select a date to see available times.</div>;
    if (loading) return <div className="pa-slots-hint">Loading available times...</div>;
    if (error) return <div className="pa-slots-hint">{error}</div>;
    if (slots.every(s => !s.available)) {
        return <div className="pa-slots-hint">No times available on this date. Try another day.</div>;
    }

    return (
        <div className="pa-slots">
            {slots.map(s => (
                <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    data-selected={selected === s.time}
                    onClick={() => onSelect(s.time)}
                    className="pa-slot-btn"
                >
                    {formatTime(s.time)}
                </button>
            ))}
        </div>
    );
}

/* Loads slots for whatever (doctor/appointment, date) is currently chosen, ignoring stale responses */
function useSlots(fetchSlots) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const requestId = useRef(0);

    async function load(...args) {
        const id = ++requestId.current;
        setSlots([]);
        setError('');

        if (args.some(a => !a)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await fetchSlots(...args);
            if (id === requestId.current) setSlots(data);
        } catch {
            if (id === requestId.current) setError('Could not load available times.');
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }

    return { slots, loading, error, load };
}

/* ---------- Book modal ---------- */

function BookModal({ onClose, onBooked }) {
    const [doctors, setDoctors] = useState([]);
    const [types, setTypes] = useState([]);
    const [loadError, setLoadError] = useState('');

    const [form, setForm] = useState({ doctorId: '', appointmentTypeId: '', date: '', time: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { slots, loading, error, load } = useSlots(getPortalSlots);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [d, t] = await Promise.allSettled([getPortalDoctors(), getPortalAppointmentTypes()]);
            if (cancelled) return;
            if (d.status === 'fulfilled') setDoctors(d.value);
            if (t.status === 'fulfilled') setTypes(t.value);
            if (d.status === 'rejected' || t.status === 'rejected') {
                setLoadError('Could not load doctors or appointment types. Please close and try again.');
            }
        })();
        return () => { cancelled = true; };
    }, []);

    function set(field, value) {
        const resetsSlot = field === 'doctorId' || field === 'date';
        setForm(f => ({ ...f, [field]: value, ...(resetsSlot ? { time: '' } : {}) }));
        setErrors(e => ({ ...e, [field]: '', submit: '' }));

        if (resetsSlot) {
            const next = { ...form, [field]: value };
            load(next.doctorId, next.date);
        }
    }

    function validate() {
        const e = {};
        if (!form.doctorId) e.doctorId = 'Please select a doctor';
        if (!form.appointmentTypeId) e.appointmentTypeId = 'Please select a visit type';
        if (!form.date) e.date = 'Please select a date';
        if (!form.time) e.time = 'Please select a time';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            const created = await bookMyAppointment({
                doctorId: Number(form.doctorId),
                appointmentTypeId: Number(form.appointmentTypeId),
                appointmentDate: form.date,
                timeSlot: form.time,
            });
            onBooked(created);
        } catch (err) {
            setErrors({ submit: apiError(err, 'Failed to book the appointment. Please try again.') });
            // the time may have just been taken by someone else - refresh the list
            setForm(f => ({ ...f, time: '' }));
            load(form.doctorId, form.date);
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="pa-modal-overlay" onClick={onClose} />
            <div className="pa-modal" role="dialog" aria-modal="true" aria-label="Book appointment">
                <div className="pa-modal-header">
                    <div className="pa-modal-title">Book an Appointment</div>
                    <button type="button" className="pa-modal-close" onClick={onClose} aria-label="Close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="pa-modal-body">
                    {(loadError || errors.submit) && (
                        <div className="pa-error-banner">{loadError || errors.submit}</div>
                    )}

                    <div className="pa-field">
                        <label>Doctor <span className="pa-required">*</span></label>
                        <select
                            className="pa-input"
                            data-error={!!errors.doctorId}
                            value={form.doctorId}
                            onChange={e => set('doctorId', e.target.value)}
                        >
                            <option value="">Select a doctor</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                            ))}
                        </select>
                        {errors.doctorId && <span className="pa-field-error">{errors.doctorId}</span>}
                    </div>

                    <div className="pa-modal-grid-2">
                        <div className="pa-field">
                            <label>Visit type <span className="pa-required">*</span></label>
                            <select
                                className="pa-input"
                                data-error={!!errors.appointmentTypeId}
                                value={form.appointmentTypeId}
                                onChange={e => set('appointmentTypeId', e.target.value)}
                            >
                                <option value="">Select type</option>
                                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {errors.appointmentTypeId && <span className="pa-field-error">{errors.appointmentTypeId}</span>}
                        </div>

                        <div className="pa-field">
                            <label>Date <span className="pa-required">*</span></label>
                            <input
                                type="date"
                                className="pa-input"
                                data-error={!!errors.date}
                                min={localDate(0)}
                                max={localDate(MAX_DAYS_AHEAD)}
                                value={form.date}
                                onChange={e => set('date', e.target.value)}
                            />
                            {errors.date && <span className="pa-field-error">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>Available times <span className="pa-required">*</span></label>
                        <SlotPicker
                            ready={!!form.doctorId && !!form.date}
                            loading={loading}
                            error={error}
                            slots={slots}
                            selected={form.time}
                            onSelect={t => set('time', t)}
                        />
                        {errors.time && <span className="pa-field-error">{errors.time}</span>}
                    </div>

                    <div className="pa-note">
                        <i className="ti ti-info-circle" /> Your appointment starts as <b>Pending</b> until the clinic confirms it.
                    </div>

                    <div className="pa-modal-actions">
                        <button type="button" className="pa-btn-cancel" onClick={onClose} disabled={submitting}>Close</button>
                        <button type="button" className="pa-btn-submit" onClick={submit} disabled={submitting || !!loadError}>
                            {submitting
                                ? <><i className="ti ti-loader-2 pa-spinner" /> Booking...</>
                                : <><i className="ti ti-calendar-plus" /> Book Appointment</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ---------- Reschedule modal ---------- */

function RescheduleModal({ appointment, onClose, onRescheduled }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { slots, loading, error: slotsError, load } = useSlots(
        (_id, d) => getPortalRescheduleSlots(appointment.id, d)
    );

    function changeDate(value) {
        setDate(value);
        setTime('');
        setError('');
        load(appointment.id, value);
    }

    async function submit() {
        if (!date || !time) { setError('Please pick a new date and time.'); return; }

        setSubmitting(true);
        try {
            const updated = await rescheduleMyAppointment(appointment.id, date, time);
            onRescheduled(updated);
        } catch (err) {
            setError(apiError(err, 'Failed to reschedule. Please try again.'));
            setTime('');
            load(appointment.id, date);
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="pa-modal-overlay" onClick={onClose} />
            <div className="pa-modal" role="dialog" aria-modal="true" aria-label="Reschedule appointment">
                <div className="pa-modal-header">
                    <div className="pa-modal-title">Reschedule Appointment</div>
                    <button type="button" className="pa-modal-close" onClick={onClose} aria-label="Close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="pa-modal-body">
                    {error && <div className="pa-error-banner">{error}</div>}

                    <div className="pa-current">
                        <div className="pa-current-label">Current appointment</div>
                        <div className="pa-current-value">
                            {appointment.doctorName} - {formatDate(appointment.appointmentDate)} at {formatTime(appointment.timeSlot)}
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>New date <span className="pa-required">*</span></label>
                        <input
                            type="date"
                            className="pa-input"
                            min={localDate(0)}
                            max={localDate(MAX_DAYS_AHEAD)}
                            value={date}
                            onChange={e => changeDate(e.target.value)}
                        />
                    </div>

                    <div className="pa-field">
                        <label>New time <span className="pa-required">*</span></label>
                        <SlotPicker
                            ready={!!date}
                            loading={loading}
                            error={slotsError}
                            slots={slots}
                            selected={time}
                            onSelect={setTime}
                        />
                    </div>

                    <div className="pa-note">
                        <i className="ti ti-info-circle" /> After rescheduling, the clinic needs to confirm the new time again.
                    </div>

                    <div className="pa-modal-actions">
                        <button type="button" className="pa-btn-cancel" onClick={onClose} disabled={submitting}>Close</button>
                        <button type="button" className="pa-btn-submit" onClick={submit} disabled={submitting}>
                            {submitting
                                ? <><i className="ti ti-loader-2 pa-spinner" /> Saving...</>
                                : <><i className="ti ti-calendar-time" /> Confirm New Time</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ---------- Cancel confirmation ---------- */

function CancelModal({ appointment, onClose, onCancelled }) {
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function confirm() {
        setSubmitting(true);
        try {
            const updated = await cancelMyAppointment(appointment.id);
            onCancelled(updated);
        } catch (err) {
            setError(apiError(err, 'Failed to cancel. Please try again.'));
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="pa-modal-overlay" onClick={onClose} />
            <div className="pa-modal pa-modal-small" role="dialog" aria-modal="true" aria-label="Cancel appointment">
                <div className="pa-modal-header">
                    <div className="pa-modal-title">Cancel appointment?</div>
                    <button type="button" className="pa-modal-close" onClick={onClose} aria-label="Close">
                        <i className="ti ti-x" />
                    </button>
                </div>
                <div className="pa-modal-body">
                    {error && <div className="pa-error-banner">{error}</div>}
                    <p className="pa-confirm-text">
                        Your appointment with <b>{appointment.doctorName}</b> on{' '}
                        <b>{formatDate(appointment.appointmentDate)}</b> at <b>{formatTime(appointment.timeSlot)}</b> will be
                        cancelled and the time will be released for other patients.
                    </p>
                    <div className="pa-modal-actions">
                        <button type="button" className="pa-btn-cancel" onClick={onClose} disabled={submitting}>Keep it</button>
                        <button type="button" className="pa-btn-danger" onClick={confirm} disabled={submitting}>
                            {submitting ? 'Cancelling...' : 'Yes, cancel it'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ---------- Page ---------- */

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('upcoming');
    const [modal, setModal] = useState(null); // { type: 'book' | 'reschedule' | 'cancel', appointment? }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getMyAppointments();
                if (!cancelled) setAppointments(data);
            } catch (err) {
                if (!cancelled) setError(apiError(err, 'Could not load your appointments.'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Swap one appointment for its updated version (reschedule / cancel)
    function replaceAppointment(updated) {
        setAppointments(list => list.map(a => (a.id === updated.id ? updated : a)));
        setModal(null);
    }

    function handleBooked(created) {
        setAppointments(list => [created, ...list]);
        setTab('upcoming');
        setModal(null);
    }

    const upcoming = appointments
        .filter(isUpcoming)
        .sort((a, b) => slotStart(a) - slotStart(b));
    const history = appointments.filter(a => !isUpcoming(a)); // already newest-first from the API
    const shown = tab === 'upcoming' ? upcoming : history;

    return (
        <div className="pa-page">
            <div className="pa-header">
                <div>
                    <h1 className="pa-title">My Appointments</h1>
                    <p className="pa-subtitle">Book, change or cancel your visits.</p>
                </div>
                <button type="button" className="pa-create-btn" onClick={() => setModal({ type: 'book' })}>
                    <i className="ti ti-calendar-plus" /> Book Appointment
                </button>
            </div>

            {error && <div className="pa-error-banner">{error}</div>}

            <div className="pa-tabs">
                <button type="button" className="pa-tab" data-active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
                    Upcoming ({upcoming.length})
                </button>
                <button type="button" className="pa-tab" data-active={tab === 'history'} onClick={() => setTab('history')}>
                    History ({history.length})
                </button>
            </div>

            {loading ? (
                <div className="pa-empty">Loading your appointments...</div>
            ) : shown.length === 0 ? (
                <div className="pa-empty">
                    <i className="ti ti-calendar-off" />
                    {tab === 'upcoming' ? 'No upcoming appointments. Book one to get started.' : 'No past or cancelled appointments yet.'}
                </div>
            ) : (
                <div className="pa-list">
                    {shown.map(a => (
                        <div key={a.id} className="pa-card">
                            <div className="pa-card-date">
                                <div className="pa-card-day">{new Date(a.appointmentDate).getDate()}</div>
                                <div className="pa-card-month">
                                    {new Date(a.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                            </div>

                            <div className="pa-card-info">
                                <div className="pa-card-doctor">{a.doctorName}</div>
                                <div className="pa-card-meta">
                                    {a.doctorSpecialty} - {a.appointmentTypeName}
                                </div>
                                <div className="pa-card-meta">
                                    <i className="ti ti-clock" /> {formatDate(a.appointmentDate)} at {formatTime(a.timeSlot)}
                                </div>
                            </div>

                            <div className="pa-card-side">
                                <span className="pa-status-badge" data-status={a.statusName}>{a.statusName}</span>
                                {isUpcoming(a) && (
                                    <div className="pa-card-actions">
                                        <button type="button" className="pa-action-btn" onClick={() => setModal({ type: 'reschedule', appointment: a })}>
                                            <i className="ti ti-calendar-time" /> Reschedule
                                        </button>
                                        <button type="button" className="pa-action-btn" data-tone="danger" onClick={() => setModal({ type: 'cancel', appointment: a })}>
                                            <i className="ti ti-x" /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal?.type === 'book' && (
                <BookModal onClose={() => setModal(null)} onBooked={handleBooked} />
            )}
            {modal?.type === 'reschedule' && (
                <RescheduleModal
                    appointment={modal.appointment}
                    onClose={() => setModal(null)}
                    onRescheduled={replaceAppointment}
                />
            )}
            {modal?.type === 'cancel' && (
                <CancelModal
                    appointment={modal.appointment}
                    onClose={() => setModal(null)}
                    onCancelled={replaceAppointment}
                />
            )}
        </div>
    );
}
