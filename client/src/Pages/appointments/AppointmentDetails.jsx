import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getAppointmentById,
    updateAppointmentStatus,
    rescheduleAppointment,
    getSlotsForReschedule,
} from "../../api/appointmemntService";
import { getAllAppointmentStatuses } from "../../api/appointmentStatusService";
import "./AppointmentDetails.css";

const STATUS_CONFIRMED = "Confirmed";
const STATUS_CANCELLED = "Cancelled";

export default function AppointmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    const fetchAppointment = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAppointmentById(id);
            setAppointment(res.data);
        } catch (err) {
            console.error("Failed to load appointment:", err);
            setError("Couldn't load this appointment. It may have been removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointment();
        getAllAppointmentStatuses()
            .then(setStatuses)
            .catch((err) => console.error("Failed to load statuses:", err));
    }, [id]);

    const getStatusId = (name) => statuses.find((s) => s.name === name)?.id;

    const handleConfirm = async () => {
        const statusId = getStatusId(STATUS_CONFIRMED);
        if (!statusId) {
            setError("Couldn't find the 'Confirmed' status. Check AppointmentStatus data.");
            return;
        }
        setActionLoading(true);
        try {
            await updateAppointmentStatus(id, statusId);
            await fetchAppointment();
        } catch (err) {
            console.error("Failed to confirm appointment:", err.response?.data ?? err);
            setError("Couldn't confirm the appointment. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        const statusId = getStatusId(STATUS_CANCELLED);
        if (!statusId) {
            setError("Couldn't find the 'Cancelled' status. Check AppointmentStatus data.");
            return;
        }
        setActionLoading(true);
        try {
            await updateAppointmentStatus(id, statusId);
            setShowCancelConfirm(false);
            await fetchAppointment();
        } catch (err) {
            console.error("Failed to cancel appointment:", err.response?.data ?? err);
            setError("Couldn't cancel the appointment. Please try again.");
            setShowCancelConfirm(false);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="appt-details-page">
                <p className="appt-details-loading">Loading appointment…</p>
            </div>
        );
    }

    if (error && !appointment) {
        return (
            <div className="appt-details-page">
                <p className="appt-details-error">{error}</p>
                <button className="appt-btn appt-btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    if (!appointment) return null;

    const statusName = appointment.appointmentStatus?.name ?? "Unknown";
    const typeName = appointment.appointmentType?.name ?? "—";
    const statusClass = statusName.toLowerCase();
    const doctorName = appointment.doctor
        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        : "—";

    const canConfirm = statusName !== STATUS_CONFIRMED && statusName !== STATUS_CANCELLED;
    const canCancel = statusName !== STATUS_CANCELLED;
    const canReschedule = statusName !== STATUS_CANCELLED;

    return (
        <div className="appt-details-page">
            <button className="appt-back-link" onClick={() => navigate(-1)}>
                ← Back to appointments
            </button>

            <div className="appt-details-card">
                <div className="appt-details-header">
                    <div>
                        <h1>Appointment Details</h1>
                        <span className={`appt-status-badge status-${statusClass}`}>
                            {statusName}
                        </span>
                    </div>
                </div>

                {error && <p className="appt-details-error">{error}</p>}

                <div className="appt-details-grid">
                    <div className="appt-details-field">
                        <span className="field-label">Patient</span>
                        <span className="field-value">{appointment.patient?.fullName}</span>
                    </div>

                    <div className="appt-details-field">
                        <span className="field-label">Doctor</span>
                        <span className="field-value">{doctorName}</span>
                    </div>

                    <div className="appt-details-field">
                        <span className="field-label">Department</span>
                        <span className="field-value">{appointment.doctor?.specialty}</span>
                    </div>

                    <div className="appt-details-field">
                        <span className="field-label">Type</span>
                        <span className="field-value">{typeName}</span>
                    </div>

                    <div className="appt-details-field">
                        <span className="field-label">Date</span>
                        <span className="field-value">
                            {appointment.appointmentDate
                                ? new Date(appointment.appointmentDate).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })
                                : "—"}
                        </span>
                    </div>

                    <div className="appt-details-field">
                        <span className="field-label">Time</span>
                        <span className="field-value">{appointment.timeSlot ?? "—"}</span>
                    </div>

                    {appointment.notes && (
                        <div className="appt-details-field appt-details-field-full">
                            <span className="field-label">Notes</span>
                            <span className="field-value">{appointment.notes}</span>
                        </div>
                    )}
                </div>

                <div className="appt-details-actions">
                    <button
                        className="appt-btn appt-btn-confirm"
                        onClick={handleConfirm}
                        disabled={!canConfirm || actionLoading}
                    >
                        {actionLoading ? "Confirming…" : "Confirm Appointment"}
                    </button>

                    <button
                        className="appt-btn appt-btn-reschedule"
                        onClick={() => setShowRescheduleModal(true)}
                        disabled={!canReschedule || actionLoading}
                    >
                        Reschedule
                    </button>

                    <button
                        className="appt-btn appt-btn-cancel"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={!canCancel || actionLoading}
                    >
                        Cancel Appointment
                    </button>
                </div>
            </div>

            {showCancelConfirm && (
                <div className="appt-modal-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Cancel this appointment?</h2>
                        <p>This will mark the appointment as cancelled. This can't be undone from here.</p>
                        <div className="appt-modal-actions">
                            <button
                                className="appt-btn appt-btn-secondary"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={actionLoading}
                            >
                                Keep Appointment
                            </button>
                            <button
                                className="appt-btn appt-btn-cancel"
                                onClick={handleCancel}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Cancelling…" : "Yes, Cancel It"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRescheduleModal && (
                <RescheduleModal
                    appointmentId={id}
                    currentDate={appointment.appointmentDate}
                    currentTime={appointment.timeSlot}
                    onClose={() => setShowRescheduleModal(false)}
                    onRescheduled={async () => {
                        setShowRescheduleModal(false);
                        await fetchAppointment();
                    }}
                />
            )}
        </div>
    );
}

function RescheduleModal({ appointmentId, currentDate, currentTime, onClose, onRescheduled }) {
    const today = new Date().toLocaleDateString("en-CA"); // local date, not UTC
    const [date, setDate] = useState(new Date(currentDate).toISOString().split("T")[0]);
    const [time, setTime] = useState("");
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const requestId = useRef(0);

    const loadSlots = async (d) => {
        const thisRequest = ++requestId.current;
        setSlots([]);
        setSlotsError("");
        setSlotsLoading(true);
        try {
            const data = await getSlotsForReschedule(appointmentId, d);
            if (thisRequest === requestId.current) setSlots(data);
        } catch (err) {
            if (thisRequest === requestId.current) setSlotsError("Could not load available slots.");
        } finally {
            if (thisRequest === requestId.current) setSlotsLoading(false);
        }
    };

    useEffect(() => {
        loadSlots(date);
    }, []);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setTime("");
        loadSlots(newDate);
    };

    const submit = async () => {
        if (!time) {
            setError("Please select a time slot.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await rescheduleAppointment(appointmentId, { appointmentDate: date, timeSlot: time });
            await onRescheduled();
        } catch (err) {
            setError(err?.response?.data || "Failed to reschedule. Please try again.");
            setTime("");
            loadSlots(date);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="appt-modal-overlay" onClick={onClose}>
            <div className="appt-modal appt-reschedule-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Reschedule Appointment</h2>
                <p>Currently {new Date(currentDate).toLocaleDateString()} at {currentTime}. This will reset the status to Pending.</p>

                {error && <div className="appt-details-error">{error}</div>}

                <div className="appt-reschedule-field">
                    <label>New Date</label>
                    <input
                        type="date"
                        value={date}
                        min={today}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="appt-reschedule-input"
                    />
                </div>

                <div className="appt-reschedule-field">
                    <label>New Time Slot</label>
                    {slotsLoading && <div className="appt-slots-hint">Loading slots...</div>}
                    {!slotsLoading && slotsError && <div className="appt-slots-hint">{slotsError}</div>}
                    {!slotsLoading && !slotsError && slots.every((s) => !s.available) && (
                        <div className="appt-slots-hint">No slots available on this date. Try another day.</div>
                    )}
                    {!slotsLoading && !slotsError && slots.some((s) => s.available) && (
                        <div className="appt-slots">
                            {slots.map((s) => (
                                <button
                                    type="button"
                                    key={s.time}
                                    disabled={!s.available}
                                    data-selected={time === s.time}
                                    onClick={() => setTime(s.time)}
                                    className="appt-slot-btn"
                                >
                                    {s.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="appt-modal-actions">
                    <button className="appt-btn appt-btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button className="appt-btn appt-btn-reschedule" onClick={submit} disabled={submitting}>
                        {submitting ? "Saving…" : "Confirm Reschedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}
