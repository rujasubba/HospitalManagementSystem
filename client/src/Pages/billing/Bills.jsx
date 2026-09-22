import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAppointments } from '../../api/appointmemntService';
import { getAllBills, createBill } from '../../api/billService';
import './Bills.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatCurrency(n) {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n || 0);
}
function initials(name) {
    return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Field({ label, required, error, children }) {
    return (
        <div className="bill-field">
            <label>
                {label}{required && <span className="required"> *</span>}
            </label>
            {children}
            {error && (
                <span className="bill-field-error">
                    <i className="ti ti-alert-circle" />{error}
                </span>
            )}
        </div>
    );
}

/* ── Create Bill Modal ── */
function CreateBillModal({ onClose, onCreate, unbilledAppointments }) {
    const emptyItem = { description: '', quantity: 1, unitPrice: '' };
    const [appointmentId, setAppointmentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function setItem(index, field, value) {
        setItems(prev => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
        setErrors(e => ({ ...e, items: '' }));
    }
    function addItem() {
        setItems(prev => [...prev, { ...emptyItem }]);
    }
    function removeItem(index) {
        setItems(prev => prev.filter((_, i) => i !== index));
    }

    const total = items.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
        0
    );

    function validate() {
        const e = {};
        if (!appointmentId) e.appointmentId = 'Please select an appointment';
        const validItems = items.filter(it => it.description.trim() && Number(it.unitPrice) > 0);
        if (validItems.length === 0) e.items = 'Add at least one item with a description and price';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            const validItems = items
                .filter(it => it.description.trim() && Number(it.unitPrice) > 0)
                .map(it => ({
                    description: it.description.trim(),
                    quantity: Number(it.quantity) || 1,
                    unitPrice: Number(it.unitPrice),
                }));

            await onCreate({
                appointmentId: Number(appointmentId),
                paymentMethod: paymentMethod || null,
                items: validItems,
            });
            onClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data || 'Failed to create bill. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={onClose} className="bill-modal-overlay" />
            <div className="bill-modal">
                <div className="bill-modal-header">
                    <div className="bill-modal-title">Create Bill</div>
                    <button onClick={onClose} className="bill-modal-close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="bill-modal-body">

                    {errors.submit && (
                        <div className="bill-error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <Field label="Appointment" required error={errors.appointmentId}>
                        <select
                            value={appointmentId}
                            onChange={e => { setAppointmentId(e.target.value); setErrors(err => ({ ...err, appointmentId: '' })); }}
                            className="bill-input"
                            data-error={!!errors.appointmentId}
                        >
                            <option value="">Select appointment</option>
                            {unbilledAppointments.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.patient?.fullName} · Dr. {a.doctor?.firstName} {a.doctor?.lastName} · {formatDate(a.appointmentDate)}
                                </option>
                            ))}
                        </select>
                        {unbilledAppointments.length === 0 && (
                            <span className="bill-field-error">
                                <i className="ti ti-info-circle" />No unbilled appointments available.
                            </span>
                        )}
                    </Field>

                    <Field label="Payment Method (optional)">
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="bill-input"
                        >
                            <option value="">Not set yet</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Insurance">Insurance</option>
                        </select>
                    </Field>

                    <div className="bill-items-section">
                        <div className="bill-items-label">Items{errors.items && <span className="required"> *</span>}</div>

                        {items.map((it, i) => (
                            <div key={i} className="bill-item-row">
                                <input
                                    type="text"
                                    placeholder="e.g. Consultation"
                                    value={it.description}
                                    onChange={e => setItem(i, 'description', e.target.value)}
                                    className="bill-input"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    value={it.quantity}
                                    onChange={e => setItem(i, 'quantity', e.target.value)}
                                    className="bill-input"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Price"
                                    value={it.unitPrice}
                                    onChange={e => setItem(i, 'unitPrice', e.target.value)}
                                    className="bill-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem(i)}
                                    disabled={items.length === 1}
                                    className="bill-item-remove"
                                >
                                    <i className="ti ti-trash" />
                                </button>
                            </div>
                        ))}

                        {errors.items && (
                            <span className="bill-field-error">
                                <i className="ti ti-alert-circle" />{errors.items}
                            </span>
                        )}

                        <button type="button" onClick={addItem} className="bill-add-item-btn">
                            <i className="ti ti-plus" /> Add Item
                        </button>
                    </div>

                    <div className="bill-total-row">
                        <span className="bill-total-label">Total</span>
                        <span className="bill-total-value">{formatCurrency(total)}</span>
                    </div>

                    <div className="bill-modal-actions">
                        <button onClick={onClose} disabled={submitting} className="bill-btn-cancel">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="bill-btn-submit"
                            data-submitting={submitting}
                        >
                            <i className="ti ti-file-invoice" />
                            {submitting ? 'Creating...' : 'Create Bill'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Main Page ── */
export default function Bills() {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [billRes, apptRes] = await Promise.allSettled([
                getAllBills(),
                getAllAppointments(),
            ]);

            if (billRes.status === 'fulfilled') setBills(billRes.value);
            if (apptRes.status === 'fulfilled') setAppointments(apptRes.value);

            const failed = [billRes, apptRes].filter(r => r.status === 'rejected');
            if (failed.length) {
                setLoadError(`Failed to load: ${failed.length} of 2 data sources unavailable.`);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const unbilledAppointments = appointments.filter(
        a => !bills.some(b => b.appointmentId === a.id)
    );

    const filtered = bills.filter(b => {
        const q = search.toLowerCase();
        const matchSearch =
            b.patientName?.toLowerCase().includes(q) ||
            b.doctorName?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || b.paymentStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    async function handleCreate(payload) {
        const created = await createBill(payload);
        setBills(prev => [created, ...prev]);
    }

    const counts = {
        total: bills.length,
        paid: bills.filter(b => b.paymentStatus === 'Paid').length,
        unpaid: bills.filter(b => b.paymentStatus === 'Unpaid').length,
        overdue: bills.filter(b => b.paymentStatus === 'Overdue').length,
    };

    if (loading) {
        return <div className="bill-loading">Loading bills...</div>;
    }

    const filterOptions = ['All', 'Paid', 'Unpaid', 'Overdue'];

    return (
        <div className="bill-page">

            <div className="bill-header">
                <div>
                    <h2 className="bill-title">Billing</h2>
                    <p className="bill-subtitle">
                        {counts.total} total · {counts.unpaid} unpaid
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bill-create-btn"
                    disabled={unbilledAppointments.length === 0}
                    title={unbilledAppointments.length === 0 ? 'No unbilled appointments available' : ''}
                >
                    <i className="ti ti-file-invoice" />
                    Create Bill
                </button>
            </div>

            {loadError && (
                <div className="bill-error-banner">
                    {loadError}
                </div>
            )}

            <div className="bill-stats">
                {[
                    { label: 'Total Bills', value: counts.total, icon: 'file-invoice', tone: 'green' },
                    { label: 'Paid', value: counts.paid, icon: 'circle-check', tone: 'green' },
                    { label: 'Unpaid', value: counts.unpaid, icon: 'clock', tone: 'amber' },
                    { label: 'Overdue', value: counts.overdue, icon: 'alert-triangle', tone: 'red' },
                ].map(({ label, value, icon, tone }) => (
                    <div key={label} className="bill-stat-card">
                        <div className="bill-stat-icon" data-tone={tone}>
                            <i className={`ti ti-${icon}`} />
                        </div>
                        <div>
                            <div className="bill-stat-value">{value}</div>
                            <div className="bill-stat-label">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bill-toolbar">
                <div className="bill-search">
                    <i className="ti ti-search" />
                    <input
                        type="text"
                        placeholder="Search patient or doctor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="bill-filters">
                    {filterOptions.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="bill-filter-btn"
                            data-active={statusFilter === s}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bill-table-wrap">
                <table className="bill-table">
                    <thead>
                        <tr>
                            {['S.N', 'Patient', 'Doctor', 'Appointment Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((b, i) => (
                            <tr key={b.id}>
                                <td className="bill-row-index">{i + 1}</td>

                                <td>
                                    <div className="bill-patient-cell">
                                        <div className="bill-avatar">
                                            {initials(b.patientName)}
                                        </div>
                                        <span className="bill-patient-name">{b.patientName}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="bill-doctor-cell">
                                        <i className="ti ti-stethoscope" />
                                        <span>{b.doctorName}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="bill-date-cell">
                                        <i className="ti ti-calendar" />
                                        <span>{formatDate(b.appointmentDate)}</span>
                                    </div>
                                </td>

                                <td>
                                    <span className="bill-items-badge">{b.items?.length ?? 0} item{b.items?.length === 1 ? '' : 's'}</span>
                                </td>

                                <td className="bill-amount-cell">{formatCurrency(b.totalAmount)}</td>

                                <td>
                                    <span className="bill-status-badge" data-status={b.paymentStatus}>
                                        {b.paymentStatus}
                                    </span>
                                </td>

                                <td>
                                    <button onClick={() => navigate(`/billing/${b.id}`)} className="bill-view-btn">
                                        View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="bill-empty-row">
                                    <i className="ti ti-file-invoice-x" />
                                    No bills found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreateBillModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                    unbilledAppointments={unbilledAppointments}
                />
            )}
        </div>
    );
}
