import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getAppointmentById,
    updateAppointmentStatus,
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

    const fetchAppointment = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAppointmentById(id);
            setAppointment(res.data);
        } catch (err) {
            console.error("Failed to load appointment:", err);
            setError("It may have been removed.");
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
                        <p>This can't be undone.</p>
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
        </div>
    );
}
