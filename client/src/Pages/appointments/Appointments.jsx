
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors } from '../../api/doctorService';
import { getAllPatients } from '../../api/patientService';
import { getAllAppointmentTypes } from '../../api/appointmentTypeService';
import { getAllAppointmentStatuses } from '../../api/appointmentStatusService';
import { getAllAppointments, createAppointment } from '../../api/appointmemntService';
import './Appointments.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Field({ label, required, error, children }) {
    return (
        <div className="appt-field">
            <label>
                {label}{required && <span className="required"> *</span>}
            </label>
            {children}
            {error && (
                <span className="appt-field-error">
                    <i className="ti ti-alert-circle" />{error}
                </span>
            )}
        </div>
    );
}

function BookModal({ onClose, onBook, doctors, patients, appointmentTypes }) {
    const empty = { patientId: '', doctorId: '', appointmentTypeId: '', date: '', time: '', notes: '' };
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
    }

    const selectedDoctor = doctors.find(d => String(d.id) === String(form.doctorId));

    function validate() {
        const e = {};
        if (!form.patientId) e.patientId = 'Please select a patient';
        if (!form.doctorId) e.doctorId = 'Please select a doctor';
        if (!form.appointmentTypeId) e.appointmentTypeId = 'Please select appointment type';
        if (!form.date) e.date = 'Please select a date';
        if (!form.time) e.time = 'Please select a time';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            await onBook({
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                appointmentTypeId: Number(form.appointmentTypeId),
                appointmentDate: form.date,
                timeSlot: form.time,
                notes: form.notes || null,
            });
            onClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data || 'Failed to book appointment. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={onClose} className="appt-modal-overlay" />
            <div className="appt-modal">
                <div className="appt-modal-header">
                    <div className="appt-modal-title">Book Appointment</div>
                    <button onClick={onClose} className="appt-modal-close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="appt-modal-body">

                    {errors.submit && (
                        <div className="appt-error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <Field label="Patient" required error={errors.patientId}>
                        <select
                            value={form.patientId}
                            onChange={e => set('patientId', e.target.value)}
                            className="appt-input"
                            data-error={!!errors.patientId}
                        >
                            <option value="">Select patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                        </select>
                    </Field>

                    <div className="appt-modal-grid-2">
                        <Field label="Doctor" required error={errors.doctorId}>
                            <select
                                value={form.doctorId}
                                onChange={e => set('doctorId', e.target.value)}
                                className="appt-input"
                                data-error={!!errors.doctorId}
                            >
                                <option value="">Select doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Department">
                            <input
                                type="text"
                                disabled
                                value={selectedDoctor?.specialty || ''}
                                placeholder="Auto-filled from doctor"
                                className="appt-input"
                            />
                        </Field>
                    </div>

                    <Field label="Appointment Type" required error={errors.appointmentTypeId}>
                        <select
                            value={form.appointmentTypeId}
                            onChange={e => set('appointmentTypeId', e.target.value)}
                            className="appt-input"
                            data-error={!!errors.appointmentTypeId}
                        >
                            <option value="">Select type</option>
                            {appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </Field>

                    <div className="appt-modal-grid-2">
                        <Field label="Date" required error={errors.date}>
                            <input
                                type="date"
                                value={form.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => set('date', e.target.value)}
                                className="appt-input"
                                data-error={!!errors.date}
                            />
                        </Field>
                        <Field label="Time" required error={errors.time}>
                            <input
                                type="time"
                                value={form.time}
                                step="60"
                                onChange={e => set('time', e.target.value)}
                                className="appt-input"
                                data-error={!!errors.time}
                            />
                        </Field>
                    </div>

                    <Field label="Notes (optional)">
                        <textarea
                            placeholder="Any notes or reason for visit..."
                            value={form.notes}
                            rows={3}
                            onChange={e => set('notes', e.target.value)}
                            className="appt-input textarea"
                        />
                    </Field>

                    <div className="appt-modal-actions">
                        <button onClick={onClose} disabled={submitting} className="appt-btn-cancel">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="appt-btn-submit"
                            data-submitting={submitting}
                        >
                            <i className="ti ti-calendar-plus" />
                            {submitting ? 'Booking...' : 'Book Appointment'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
export default function Appointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [apptRes, docRes, patRes, typeRes, statusRes] = await Promise.allSettled([
                getAllAppointments(),
                getAllDoctors(),
                getAllPatients(),
                getAllAppointmentTypes(),
                getAllAppointmentStatuses(),
            ]);

            if (apptRes.status === 'fulfilled') setAppointments(apptRes.value);
            if (docRes.status === 'fulfilled') setDoctors(docRes.value);
            if (patRes.status === 'fulfilled') setPatients(patRes.value);
            if (typeRes.status === 'fulfilled') setAppointmentTypes(typeRes.value);
            if (statusRes.status === 'fulfilled') setStatuses(statusRes.value);

            const failed = [apptRes, docRes, patRes, typeRes, statusRes].filter(r => r.status === 'rejected');
            if (failed.length) {
                setLoadError(`Failed to load: ${failed.length} of 5 data sources unavailable.`);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const filtered = appointments.filter(a => {
        const q = search.toLowerCase();
        const matchSearch =
            a.patient?.fullName?.toLowerCase().includes(q) ||
            `${a.doctor?.firstName} ${a.doctor?.lastName}`.toLowerCase().includes(q) ||
            a.appointmentType?.name?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || a.appointmentStatus?.name === statusFilter;
        return matchSearch && matchStatus;
    });

    async function handleBook(payload) {
        const created = await createAppointment(payload);
        setAppointments(prev => [created, ...prev]);
    }

    const counts = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.appointmentStatus?.name === 'Confirmed').length,
        pending: appointments.filter(a => a.appointmentStatus?.name === 'Pending').length,
        cancelled: appointments.filter(a => a.appointmentStatus?.name === 'Cancelled').length,
    };

    if (loading) {
        return <div className="appt-loading">Loading appointments...</div>;
    }

    const filterOptions = ['All', ...statuses.map(s => s.name)];

    return (
        <div className="appt-page">

            <div className="appt-header">
                <div>
                    <h2 className="appt-title">Appointments</h2>
                    <p className="appt-subtitle">
                        {counts.total} total · {counts.pending} pending approval
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="appt-book-btn">
                    <i className="ti ti-calendar-plus" />
                    Book Appointment
                </button>
            </div>

            {loadError && (
                <div className="appt-error-banner">
                    {loadError}
                </div>
            )}

            <div className="appt-stats">
                {[
                    { label: 'Total Appointments', value: counts.total, icon: 'calendar', tone: 'green' },
                    { label: 'Confirmed', value: counts.confirmed, icon: 'calendar-check', tone: 'green' },
                    { label: 'Pending', value: counts.pending, icon: 'clock', tone: 'amber' },
                    { label: 'Cancelled', value: counts.cancelled, icon: 'calendar-x', tone: 'red' },
                ].map(({ label, value, icon, tone }) => (
                    <div key={label} className="appt-stat-card">
                        <div className="appt-stat-icon" data-tone={tone}>
                            <i className={`ti ti-${icon}`} />
                        </div>
                        <div>
                            <div className="appt-stat-value">{value}</div>
                            <div className="appt-stat-label">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="appt-toolbar">
                <div className="appt-search">
                    <i className="ti ti-search" />
                    <input
                        type="text"
                        placeholder="Search patient, doctor or type..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="appt-filters">
                    {filterOptions.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="appt-filter-btn"
                            data-active={statusFilter === s}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="appt-table-wrap">
                <table className="appt-table">
                    <thead>
                        <tr>
                            {['S.N', 'Patient', 'Doctor', 'Department', 'Type', 'Date', 'Time', 'Status', 'Action'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((a, i) => (
                            <tr key={a.id}>
                                <td className="appt-row-index">{i + 1}</td>

                                <td>
                                    <div className="appt-patient-cell">
                                        <div className="appt-avatar">
                                            {initials(a.patient?.fullName || '')}
                                        </div>
                                        <span className="appt-patient-name">{a.patient?.fullName}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="appt-doctor-cell">
                                        <i className="ti ti-stethoscope" />
                                        <span>Dr. {a.doctor?.firstName} {a.doctor?.lastName}</span>
                                    </div>
                                </td>

                                <td className="appt-department-cell">{a.doctor?.specialty}</td>

                                <td>
                                    <span className="appt-type-badge">{a.appointmentType?.name}</span>
                                </td>

                                <td>
                                    <div className="appt-date-cell">
                                        <i className="ti ti-calendar" />
                                        <span>{formatDate(a.appointmentDate)}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="appt-time-cell">
                                        <i className="ti ti-clock" />
                                        <span>{a.timeSlot}</span>
                                    </div>
                                </td>

                                <td>
                                    <span className="appt-status-badge" data-status={a.appointmentStatus?.name}>
                                        {a.appointmentStatus?.name}
                                    </span>
                                </td>

                                <td style={{ padding: '14px 18px' }}>
                                    <button onClick={() => navigate(`/appointments/${a.id}`)} style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        background: '#F0F9F5', border: '1px solid #C5E8D9',
                                        borderRadius: 7, padding: '6px 14px',
                                        fontSize: 12.5, fontWeight: 500,
                                        color: '#0F6E52', cursor: 'pointer', fontFamily: 'inherit',
                                    }}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="appt-empty-row">
                                    <i className="ti ti-calendar-off" />
                                    No appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <BookModal
                    onClose={() => setShowModal(false)}
                    onBook={handleBook}
                    doctors={doctors}
                    patients={patients}
                    appointmentTypes={appointmentTypes}
                />
            )}
        </div>
    );
}
