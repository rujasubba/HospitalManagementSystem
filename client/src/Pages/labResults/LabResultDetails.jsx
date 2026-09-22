import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLabResultById,
    updateLabResult,
    deleteLabResult,
} from "../../api/labResultService";
import "./LabResultDetails.css";

function formatDate(d) {
    return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default function LabResultDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        testName: "", resultValue: "", referenceRange: "", status: "Normal", testDate: "",
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchResult = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLabResultById(id);
            setResult(data);
            setForm({
                testName: data.testName,
                resultValue: data.resultValue,
                referenceRange: data.referenceRange,
                status: data.status,
                testDate: new Date(data.testDate).toISOString().split("T")[0],
            });
        } catch (err) {
            console.error("Failed to load lab result:", err);
            setError("Couldn't load this result. It may have been removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResult();
    }, [id]);

    const handleSave = async () => {
        if (!form.testName.trim()) {
            setError("Test name is required.");
            return;
        }
        setActionLoading(true);
        try {
            await updateLabResult(id, form);
            setEditing(false);
            await fetchResult();
        } catch (err) {
            console.error("Failed to update lab result:", err.response?.data ?? err);
            setError("Couldn't save changes. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await deleteLabResult(id);
            navigate("/lab-results");
        } catch (err) {
            console.error("Failed to delete lab result:", err.response?.data ?? err);
            setError("Couldn't delete this result. Please try again.");
            setShowDeleteConfirm(false);
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="lab-details-page">
                <p className="lab-details-loading">Loading result…</p>
            </div>
        );
    }

    if (error && !result) {
        return (
            <div className="lab-details-page">
                <p className="lab-details-error">{error}</p>
                <button className="lab-btn lab-btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    if (!result) return null;

    const statusClass = result.status.toLowerCase();

    return (
        <div className="lab-details-page">
            <button className="lab-back-link" onClick={() => navigate(-1)}>
                ← Back to lab results
            </button>

            <div className="lab-details-card">
                <div className="lab-details-header">
                    <div>
                        <h1>{result.testName}</h1>
                        <span className={`lab-status-badge status-${statusClass}`}>
                            {result.status}
                        </span>
                    </div>
                </div>

                {error && <p className="lab-details-error">{error}</p>}

                {!editing ? (
                    <div className="lab-details-grid">
                        <div className="lab-details-field">
                            <span className="field-label">Patient</span>
                            <span className="field-value">{result.patientName}</span>
                        </div>

                        <div className="lab-details-field">
                            <span className="field-label">Ordering Doctor</span>
                            <span className="field-value">{result.doctorName}</span>
                        </div>

                        <div className="lab-details-field">
                            <span className="field-label">Result Value</span>
                            <span className="field-value">{result.resultValue || "—"}</span>
                        </div>

                        <div className="lab-details-field">
                            <span className="field-label">Reference Range</span>
                            <span className="field-value">{result.referenceRange || "—"}</span>
                        </div>

                        <div className="lab-details-field">
                            <span className="field-label">Test Date</span>
                            <span className="field-value">{formatDate(result.testDate)}</span>
                        </div>

                        <div className="lab-details-field">
                            <span className="field-label">Specialty</span>
                            <span className="field-value">{result.doctorSpecialty || "—"}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="lab-edit-field">
                            <label>Test Name</label>
                            <input
                                type="text"
                                className="lab-edit-input"
                                value={form.testName}
                                onChange={(e) => setForm((f) => ({ ...f, testName: e.target.value }))}
                            />
                        </div>

                        <div className="lab-edit-grid-2">
                            <div className="lab-edit-field">
                                <label>Result Value</label>
                                <input
                                    type="text"
                                    className="lab-edit-input"
                                    value={form.resultValue}
                                    onChange={(e) => setForm((f) => ({ ...f, resultValue: e.target.value }))}
                                />
                            </div>
                            <div className="lab-edit-field">
                                <label>Reference Range</label>
                                <input
                                    type="text"
                                    className="lab-edit-input"
                                    value={form.referenceRange}
                                    onChange={(e) => setForm((f) => ({ ...f, referenceRange: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="lab-edit-grid-2">
                            <div className="lab-edit-field">
                                <label>Status</label>
                                <select
                                    className="lab-edit-input"
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Abnormal">Abnormal</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="lab-edit-field">
                                <label>Test Date</label>
                                <input
                                    type="date"
                                    className="lab-edit-input"
                                    value={form.testDate}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setForm((f) => ({ ...f, testDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="lab-details-actions">
                {!editing ? (
                    <>
                        <button className="lab-btn lab-btn-edit" onClick={() => setEditing(true)} disabled={actionLoading}>
                            Edit Result
                        </button>
                        <button
                            className="lab-btn lab-btn-delete"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={actionLoading}
                        >
                            Delete Result
                        </button>
                    </>
                ) : (
                    <>
                        <button className="lab-btn lab-btn-secondary" onClick={() => setEditing(false)} disabled={actionLoading}>
                            Cancel
                        </button>
                        <button className="lab-btn lab-btn-edit" onClick={handleSave} disabled={actionLoading}>
                            {actionLoading ? "Saving…" : "Save Changes"}
                        </button>
                    </>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="lab-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="lab-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete this result?</h2>
                        <p>This will permanently remove this lab result. This can't be undone.</p>
                        <div className="lab-modal-actions">
                            <button
                                className="lab-btn lab-btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button className="lab-btn lab-btn-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? "Deleting…" : "Yes, Delete It"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
