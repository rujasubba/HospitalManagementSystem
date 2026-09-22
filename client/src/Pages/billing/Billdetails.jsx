import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBillById, updateBillStatus } from "../../api/billService";
import "./BillDetails.css";

function formatDate(d) {
    return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
function formatCurrency(n) {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n || 0);
}

export default function BillDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPaidModal, setShowPaidModal] = useState(false);
    const [paidMethod, setPaidMethod] = useState("Cash");

    const fetchBill = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBillById(id);
            setBill(data);
            setPaidMethod(data.paymentMethod || "Cash");
        } catch (err) {
            console.error("Failed to load bill:", err);
            setError("Couldn't load this bill. It may have been removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, setState here is intentional
        fetchBill();
    }, [id]);

    const applyStatus = async (status, method = null) => {
        setActionLoading(true);
        try {
            await updateBillStatus(id, status, method);
            setShowPaidModal(false);
            await fetchBill();
        } catch (err) {
            console.error("Failed to update bill status:", err.response?.data ?? err);
            setError("Couldn't update the bill. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bill-details-page">
                <p className="bill-details-loading">Loading bill…</p>
            </div>
        );
    }

    if (error && !bill) {
        return (
            <div className="bill-details-page">
                <p className="bill-details-error">{error}</p>
                <button className="bill-btn bill-btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    if (!bill) return null;

    const statusClass = bill.paymentStatus.toLowerCase();

    return (
        <div className="bill-details-page">
            <button className="bill-back-link" onClick={() => navigate(-1)}>
                ← Back to billing
            </button>

            <div className="bill-details-card">
                <div className="bill-details-header">
                    <div>
                        <h1>Bill #{bill.id}</h1>
                        <span className={`bill-status-badge status-${statusClass}`}>
                            {bill.paymentStatus}
                        </span>
                    </div>
                </div>

                {error && <p className="bill-details-error">{error}</p>}

                <div className="bill-details-grid">
                    <div className="bill-details-field">
                        <span className="field-label">Patient</span>
                        <span className="field-value">{bill.patientName}</span>
                    </div>

                    <div className="bill-details-field">
                        <span className="field-label">Doctor</span>
                        <span className="field-value">{bill.doctorName}</span>
                    </div>

                    <div className="bill-details-field">
                        <span className="field-label">Appointment Date</span>
                        <span className="field-value">{formatDate(bill.appointmentDate)}</span>
                    </div>

                    <div className="bill-details-field">
                        <span className="field-label">Payment Method</span>
                        <span className="field-value">{bill.paymentMethod || "—"}</span>
                    </div>

                    <div className="bill-details-field">
                        <span className="field-label">Created</span>
                        <span className="field-value">{formatDate(bill.createdAt)}</span>
                    </div>

                    {bill.paidAt && (
                        <div className="bill-details-field">
                            <span className="field-label">Paid On</span>
                            <span className="field-value">{formatDate(bill.paidAt)}</span>
                        </div>
                    )}
                </div>

                <table className="bill-items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="num">Qty</th>
                            <th className="num">Unit Price</th>
                            <th className="num">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((it) => (
                            <tr key={it.id}>
                                <td>{it.description}</td>
                                <td className="num">{it.quantity}</td>
                                <td className="num">{formatCurrency(it.unitPrice)}</td>
                                <td className="num">{formatCurrency(it.lineTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="bill-total-line">
                    <span className="label">Total</span>
                    <span className="value">{formatCurrency(bill.totalAmount)}</span>
                </div>
            </div>

            <div className="bill-details-actions">
                {bill.paymentStatus !== "Paid" && (
                    <button
                        className="bill-btn bill-btn-paid"
                        onClick={() => setShowPaidModal(true)}
                        disabled={actionLoading}
                    >
                        Mark as Paid
                    </button>
                )}

                {bill.paymentStatus === "Unpaid" && (
                    <button
                        className="bill-btn bill-btn-overdue"
                        onClick={() => applyStatus("Overdue")}
                        disabled={actionLoading}
                    >
                        Mark as Overdue
                    </button>
                )}

                {bill.paymentStatus === "Overdue" && (
                    <button
                        className="bill-btn bill-btn-unpaid"
                        onClick={() => applyStatus("Unpaid")}
                        disabled={actionLoading}
                    >
                        Mark as Unpaid
                    </button>
                )}

                {bill.paymentStatus === "Paid" && (
                    <button
                        className="bill-btn bill-btn-unpaid"
                        onClick={() => applyStatus("Unpaid")}
                        disabled={actionLoading}
                    >
                        Revert to Unpaid
                    </button>
                )}
            </div>

            {showPaidModal && (
                <div className="bill-modal-overlay" onClick={() => setShowPaidModal(false)}>
                    <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Mark this bill as paid?</h2>
                        <p>Choose how the payment was made.</p>
                        <select value={paidMethod} onChange={(e) => setPaidMethod(e.target.value)}>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Insurance">Insurance</option>
                        </select>
                        <div className="bill-modal-actions">
                            <button
                                className="bill-btn bill-btn-secondary"
                                onClick={() => setShowPaidModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="bill-btn bill-btn-paid"
                                onClick={() => applyStatus("Paid", paidMethod)}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Saving…" : "Confirm Paid"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
