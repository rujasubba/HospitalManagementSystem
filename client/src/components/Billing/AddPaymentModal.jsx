import { useState } from "react";

const PAYMENT_METHODS = ["Cash", "Cheque", "Credit Card", "Debit Card", "Net Banking", "Insurance"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"];

const EMPTY_FORM = {
    patientName: "",
    doctorName: "",
    billNo: "",
    billDate: "",
    paymentMethod: "",
    status: "",
    amount: "",
};

export default function AddPaymentModal({ show, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const next = {};
        if (!form.patientName.trim()) next.patientName = "Patient name is required";
        if (!form.billNo.trim()) next.billNo = "Bill number is required";
        if (!form.billDate) next.billDate = "Bill date is required";
        if (!form.paymentMethod) next.paymentMethod = "Select a payment method";
        if (!form.status) next.status = "Select a payment status";
        if (!form.amount || Number(form.amount) <= 0) next.amount = "Enter a valid amount";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ ...form, amount: Number(form.amount) });
        setForm(EMPTY_FORM);
        setErrors({});
    };

    const handleClose = () => {
        setForm(EMPTY_FORM);
        setErrors({});
        onClose();
    };

    return (
        <>
            <div className="modal fade show" style={{ display: "block" }} role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add New Payment</h5>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <div className="form-label">Patient Name</div>
                                    <input
                                        className="form-control"
                                        name="patientName"
                                        value={form.patientName}
                                        onChange={handleChange}
                                        placeholder="Enter Patient Name"
                                    />
                                    {errors.patientName && <span className="text-danger fs-12">{errors.patientName}</span>}
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Doctor Name</div>
                                    <input
                                        className="form-control"
                                        name="doctorName"
                                        value={form.doctorName}
                                        onChange={handleChange}
                                        placeholder="Enter Doctor Name"
                                    />
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Bill No</div>
                                    <input
                                        className="form-control"
                                        name="billNo"
                                        value={form.billNo}
                                        onChange={handleChange}
                                        placeholder="Enter Bill Number"
                                    />
                                    {errors.billNo && <span className="text-danger fs-12">{errors.billNo}</span>}
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Bill Date</div>
                                    <input
                                        className="form-control"
                                        type="date"
                                        name="billDate"
                                        value={form.billDate}
                                        onChange={handleChange}
                                    />
                                    {errors.billDate && <span className="text-danger fs-12">{errors.billDate}</span>}
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Payment Method</div>
                                    <select
                                        className="form-select"
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Payment Method</option>
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    {errors.paymentMethod && <span className="text-danger fs-12">{errors.paymentMethod}</span>}
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Payment Status</div>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Payment Status</option>
                                        {PAYMENT_STATUSES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {errors.status && <span className="text-danger fs-12">{errors.status}</span>}
                                </div>
                                <div className="form-group col-md-6">
                                    <div className="form-label">Amount ($)</div>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        name="amount"
                                        value={form.amount}
                                        onChange={handleChange}
                                        placeholder="Enter Amount"
                                    />
                                    {errors.amount && <span className="text-danger fs-12">{errors.amount}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" type="button" onClick={handleSave}>Save</button>
                            <button className="btn btn-danger" type="button" onClick={handleClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
        </>
    );
}
