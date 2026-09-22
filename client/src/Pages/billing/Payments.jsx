import { useEffect, useMemo, useState } from "react";
import { getPayments, addPayment, deletePayment } from "../../api/paymentService";
import AddPaymentModal from "../../components/Billing/AddPaymentModal";
import "./Payments.css";

const STATUS_OPTIONS = ["All", "Paid", "Pending", "Partial"];

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortConfig, setSortConfig] = useState({ key: "billDate", direction: "desc" });

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getPayments()
            .then((data) => {
                if (!cancelled) setPayments(data);
            })
            .catch(() => {
                if (!cancelled) setError("Couldn't load payments. Please try again.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleAddPayment = async (form) => {
        try {
            const created = await addPayment(form);
            setPayments((prev) => [...prev, created]);
            setShowModal(false);
        } catch {
            setError("Couldn't save the payment. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        const prev = payments;
        setPayments((p) => p.filter((pay) => pay.id !== id)); // optimistic
        try {
            await deletePayment(id);
        } catch {
            setPayments(prev); // rollback on failure
            setError("Couldn't delete the payment. Please try again.");
        }
    };

    const requestSort = (key) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const visiblePayments = useMemo(() => {
        let rows = [...payments];

        if (statusFilter !== "All") {
            rows = rows.filter((p) => p.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            rows = rows.filter(
                (p) =>
                    p.patientName.toLowerCase().includes(q) ||
                    p.doctorName.toLowerCase().includes(q) ||
                    p.billNo.toLowerCase().includes(q)
            );
        }

        rows.sort((a, b) => {
            const { key, direction } = sortConfig;
            const dir = direction === "asc" ? 1 : -1;
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
            return 0;
        });

        return rows;
    }, [payments, search, statusFilter, sortConfig]);

    const sortIndicator = (key) =>
        sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

    return (
        <>
            {/* breadcrumb start */}
            <div className="codex-breadcrumb">
                <div className="container-fluid">
                    <div className="breadcrumb-contain">
                        <div className="left-breadcrumb">
                            <ul className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><h1>Dashboard</h1></li>
                                <li className="breadcrumb-item">Billing</li>
                                <li className="breadcrumb-item active">Payments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* breadcrumb end */}

            <div className="theme-body">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="payments-toolbar">
                                        <input
                                            className="form-control payments-search"
                                            type="text"
                                            placeholder="Search patient, doctor, or bill no..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />

                                        <select
                                            className="form-select payments-status-filter"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>

                                        <button
                                            className="btn btn-primary payments-add-btn"
                                            type="button"
                                            onClick={() => setShowModal(true)}
                                        >
                                            Add New Payment
                                        </button>
                                    </div>

                                    {error && <div className="alert alert-danger">{error}</div>}

                                    {loading ? (
                                        <p>Loading payments...</p>
                                    ) : visiblePayments.length === 0 ? (
                                        <p className="text-light">No payments match your search.</p>
                                    ) : (
                                        <table className="payment-tbl table">
                                            <thead>
                                                <tr>
                                                    <th onClick={() => requestSort("billNo")}>Bill No{sortIndicator("billNo")}</th>
                                                    <th onClick={() => requestSort("patientName")}>Patient Name{sortIndicator("patientName")}</th>
                                                    <th onClick={() => requestSort("doctorName")}>Doctor Name{sortIndicator("doctorName")}</th>
                                                    <th onClick={() => requestSort("billDate")}>Bill Date{sortIndicator("billDate")}</th>
                                                    <th>Payment Method</th>
                                                    <th>Status</th>
                                                    <th onClick={() => requestSort("amount")}>Amount{sortIndicator("amount")}</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visiblePayments.map((p) => (
                                                    <tr key={p.id}>
                                                        <td>{p.billNo}</td>
                                                        <td>{p.patientName}</td>
                                                        <td>{p.doctorName}</td>
                                                        <td>{new Date(p.billDate).toLocaleDateString()}</td>
                                                        <td>{p.paymentMethod}</td>
                                                        <td>
                                                            <span
                                                                className="badge"
                                                                data-status={p.status.toLowerCase()}
                                                            >
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td>${p.amount}</td>
                                                        <td>
                                                            <button
                                                                className="btn-icon text-danger"
                                                                type="button"
                                                                onClick={() => handleDelete(p.id)}
                                                                aria-label={`Delete payment ${p.billNo}`}
                                                            >
                                                                <i className="ti ti-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddPaymentModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddPayment}
            />
        </>
    );
}
