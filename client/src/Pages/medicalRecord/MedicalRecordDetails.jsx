import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord,
} from "../../api/Medicalrecordservice ";
import "./MedicalRecordDetails.css";

function formatDate(d) {
    return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default function MedicalRecordDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "", recordDate: "" });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchRecord = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMedicalRecordById(id);
            setRecord(data);
            setForm({
                diagnosis: data.diagnosis,
                prescription: data.prescription,
                notes: data.notes,
                recordDate: new Date(data.recordDate).toISOString().split("T")[0],
            });
        } catch (err) {
            console.error("Failed to load medical record:", err);
            setError("Couldn't load this record. It may have been removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecord();
    }, [id]);

    const handleSave = async () => {
        if (!form.diagnosis.trim()) {
            setError("Diagnosis is required.");
            return;
        }
        setActionLoading(true);
        try {
            await updateMedicalRecord(id, form);
            setEditing(false);
            await fetchRecord();
        } catch (err) {
            console.error("Failed to update record:", err.response?.data ?? err);
            setError("Couldn't save changes. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await deleteMedicalRecord(id);
            navigate("/medical-records");
        } catch (err) {
            console.error("Failed to delete record:", err.response?.data ?? err);
            setError("Couldn't delete this record. Please try again.");
            setShowDeleteConfirm(false);
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="record-details-page">
                <p className="record-details-loading">Loading record…</p>
            </div>
        );
    }

    if (error && !record) {
        return (
            <div className="record-details-page">
                <p className="record-details-error">{error}</p>
                <button className="record-btn record-btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    if (!record) return null;

    return (
        <div className="record-details-page">
            <button className="record-back-link" onClick={() => navigate(-1)}>
                ← Back to medical records
            </button>

            <div className="record-details-card">
                <div className="record-details-header">
                    <h1>Medical Record</h1>
                </div>

                {error && <p className="record-details-error">{error}</p>}

                {!editing ? (
                    <>
                        <div className="record-details-grid">
                            <div className="record-details-field">
                                <span className="field-label">Patient</span>
                                <span className="field-value">{record.patientName}</span>
                            </div>

                            <div className="record-details-field">
                                <span className="field-label">Doctor</span>
                                <span className="field-value">{record.doctorName}</span>
                            </div>

                            <div className="record-details-field">
                                <span className="field-label">Specialty</span>
                                <span className="field-value">{record.doctorSpecialty || "—"}</span>
                            </div>

                            <div className="record-details-field">
                                <span className="field-label">Record Date</span>
                                <span className="field-value">{formatDate(record.recordDate)}</span>
                            </div>

                            <div className="record-details-field record-details-field-full">
                                <span className="field-label">Diagnosis</span>
                                <span className="field-value">{record.diagnosis}</span>
                            </div>
                        </div>

                        <div className="record-section">
                            <div className="record-section-label">Prescription / Medications</div>
                            <div className="record-section-value">{record.prescription || "—"}</div>
                        </div>

                        <div className="record-section">
                            <div className="record-section-label">Doctor's Notes</div>
                            <div className="record-section-value">{record.notes || "—"}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="record-edit-field">
                            <label>Record Date</label>
                            <input
                                type="date"
                                className="record-edit-input"
                                value={form.recordDate}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setForm((f) => ({ ...f, recordDate: e.target.value }))}
                            />
                        </div>

                        <div className="record-edit-field">
                            <label>Diagnosis</label>
                            <input
                                type="text"
                                className="record-edit-input"
                                value={form.diagnosis}
                                onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
                            />
                        </div>

                        <div className="record-edit-field">
                            <label>Prescription / Medications</label>
                            <textarea
                                className="record-edit-input textarea"
                                rows={3}
                                value={form.prescription}
                                onChange={(e) => setForm((f) => ({ ...f, prescription: e.target.value }))}
                            />
                        </div>

                        <div className="record-edit-field">
                            <label>Doctor's Notes</label>
                            <textarea
                                className="record-edit-input textarea"
                                rows={3}
                                value={form.notes}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="record-details-actions">
                {!editing ? (
                    <>
                        <button className="record-btn record-btn-edit" onClick={() => setEditing(true)} disabled={actionLoading}>
                            Edit Record
                        </button>
                        <button
                            className="record-btn record-btn-delete"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={actionLoading}
                        >
                            Delete Record
                        </button>
                    </>
                ) : (
                    <>
                        <button className="record-btn record-btn-secondary" onClick={() => setEditing(false)} disabled={actionLoading}>
                            Cancel
                        </button>
                        <button className="record-btn record-btn-edit" onClick={handleSave} disabled={actionLoading}>
                            {actionLoading ? "Saving…" : "Save Changes"}
                        </button>
                    </>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="record-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="record-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete this record?</h2>
                        <p>This will permanently remove this medical record. This can't be undone.</p>
                        <div className="record-modal-actions">
                            <button
                                className="record-btn record-btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button className="record-btn record-btn-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? "Deleting…" : "Yes, Delete It"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}