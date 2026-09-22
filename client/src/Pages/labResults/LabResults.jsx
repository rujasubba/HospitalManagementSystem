import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors } from '../../api/doctorService';
import { getAllPatients } from '../../api/patientService';
import { getAllLabResults, createLabResult } from '../../api/labResultService';
import './LabResults.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name) {
    return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Field({ label, required, error, children }) {
    return (
        <div className="lab-field">
            <label>
                {label}{required && <span className="required"> *</span>}
            </label>
            {children}
            {error && (
                <span className="lab-field-error">
                    <i className="ti ti-alert-circle" />{error}
                </span>
            )}
        </div>
    );
}

function CreateLabResultModal({ onClose, onCreate, doctors, patients }) {
    const today = new Date().toISOString().split('T')[0];
    const empty = {
        patientId: '', doctorId: '', testName: '', resultValue: '',
        referenceRange: '', status: 'Normal', testDate: today,
    };
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
    }

    function validate() {
        const e = {};
        if (!form.patientId) e.patientId = 'Please select a patient';
        if (!form.doctorId) e.doctorId = 'Please select the doctor';
        if (!form.testName.trim()) e.testName = 'Test name is required';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            await onCreate({
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                testName: form.testName.trim(),
                resultValue: form.resultValue.trim(),
                referenceRange: form.referenceRange.trim(),
                status: form.status,
                testDate: form.testDate,
            });
            onClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data || 'Couldnot save result. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={onClose} className="lab-modal-overlay" />
            <div className="lab-modal">
                <div className="lab-modal-header">
                    <div className="lab-modal-title">New Lab Result</div>
                    <button onClick={onClose} className="lab-modal-close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="lab-modal-body">

                    {errors.submit && (
                        <div className="lab-error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <div className="lab-modal-grid-2">
                        <Field label="Patient" required error={errors.patientId}>
                            <select
                                value={form.patientId}
                                onChange={e => set('patientId', e.target.value)}
                                className="lab-input"
                                data-error={!!errors.patientId}
                            >
                                <option value="">Select patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                            </select>
                        </Field>

                        <Field label="Ordering Doctor" required error={errors.doctorId}>
                            <select
                                value={form.doctorId}
                                onChange={e => set('doctorId', e.target.value)}
                                className="lab-input"
                                data-error={!!errors.doctorId}
                            >
                                <option value="">Select doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Test Name" required error={errors.testName}>
                        <input
                            type="text"
                            placeholder="e.g. Hemoglobin"
                            value={form.testName}
                            onChange={e => set('testName', e.target.value)}
                            className="lab-input"
                            data-error={!!errors.testName}
                        />
                    </Field>

                    <div className="lab-modal-grid-2">
                        <Field label="Result Value">
                            <input
                                type="text"
                                placeholder="e.g. 13.5 g/dL"
                                value={form.resultValue}
                                onChange={e => set('resultValue', e.target.value)}
                                className="lab-input"
                            />
                        </Field>
                        <Field label="Reference Range">
                            <input
                                type="text"
                                placeholder="e.g. 12.0 - 15.5 g/dL"
                                value={form.referenceRange}
                                onChange={e => set('referenceRange', e.target.value)}
                                className="lab-input"
                            />
                        </Field>
                    </div>

                    <div className="lab-modal-grid-2">
                        <Field label="Status" required>
                            <select
                                value={form.status}
                                onChange={e => set('status', e.target.value)}
                                className="lab-input"
                            >
                                <option value="Normal">Normal</option>
                                <option value="Abnormal">Abnormal</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </Field>
                        <Field label="Test Date" required>
                            <input
                                type="date"
                                value={form.testDate}
                                max={today}
                                onChange={e => set('testDate', e.target.value)}
                                className="lab-input"
                            />
                        </Field>
                    </div>

                    <div className="lab-modal-actions">
                        <button onClick={onClose} disabled={submitting} className="lab-btn-cancel">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="lab-btn-submit"
                        >
                            <i className="ti ti-flask" />
                            {submitting ? 'Saving...' : 'Save Result'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function LabResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [resRes, docRes, patRes] = await Promise.allSettled([
                getAllLabResults(),
                getAllDoctors(),
                getAllPatients(),
            ]);

            if (resRes.status === 'fulfilled') setResults(resRes.value);
            if (docRes.status === 'fulfilled') setDoctors(docRes.value);
            if (patRes.status === 'fulfilled') setPatients(patRes.value);

            const failed = [resRes, docRes, patRes].filter(r => r.status === 'rejected');
            if (failed.length) {
                setLoadError(`Failed to load: ${failed.length} of 3 data sources unavailable.`);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const filtered = results.filter(r => {
        const q = search.toLowerCase();
        const matchSearch =
            r.patientName?.toLowerCase().includes(q) ||
            r.doctorName?.toLowerCase().includes(q) ||
            r.testName?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    async function handleCreate(payload) {
        const created = await createLabResult(payload);
        setResults(prev => [created, ...prev]);
    }

    const counts = {
        total: results.length,
        normal: results.filter(r => r.status === 'Normal').length,
        abnormal: results.filter(r => r.status === 'Abnormal').length,
        critical: results.filter(r => r.status === 'Critical').length,
    };

    if (loading) {
        return <div className="lab-loading">Loading lab results...</div>;
    }

    const filterOptions = ['All', 'Normal', 'Abnormal', 'Critical'];

    return (
        <div className="lab-page">

            <div className="lab-header">
                <div>
                    <h2 className="lab-title">Lab Results</h2>
                    <p className="lab-subtitle">
                        {counts.total} total · {counts.critical} critical
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="lab-create-btn">
                    <i className="ti ti-flask" />
                    New Result
                </button>
            </div>

            {loadError && (
                <div className="lab-error-banner">
                    {loadError}
                </div>
            )}

            <div className="lab-stats">
                {[
                    { label: 'Total Results', value: counts.total, icon: 'flask', tone: 'green' },
                    { label: 'Normal', value: counts.normal, icon: 'circle-check', tone: 'green' },
                    { label: 'Abnormal', value: counts.abnormal, icon: 'alert-circle', tone: 'amber' },
                    { label: 'Critical', value: counts.critical, icon: 'alert-triangle', tone: 'red' },
                ].map(({ label, value, icon, tone }) => (
                    <div key={label} className="lab-stat-card">
                        <div className="lab-stat-icon" data-tone={tone}>
                            <i className={`ti ti-${icon}`} />
                        </div>
                        <div>
                            <div className="lab-stat-value">{value}</div>
                            <div className="lab-stat-label">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="lab-toolbar">
                <div className="lab-search">
                    <i className="ti ti-search" />
                    <input
                        type="text"
                        placeholder="Search patient, doctor or test..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="lab-filters">
                    {filterOptions.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="lab-filter-btn"
                            data-active={statusFilter === s}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="lab-table-wrap">
                <table className="lab-table">
                    <thead>
                        <tr>
                            {['S.N', 'Patient', 'Doctor', 'Test', 'Result', 'Date', 'Status', 'Action'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((r, i) => (
                            <tr key={r.id}>
                                <td className="lab-row-index">{i + 1}</td>

                                <td>
                                    <div className="lab-patient-cell">
                                        <div className="lab-avatar">
                                            {initials(r.patientName)}
                                        </div>
                                        <span className="lab-patient-name">{r.patientName}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="lab-doctor-cell">
                                        <i className="ti ti-stethoscope" />
                                        <span>{r.doctorName}</span>
                                    </div>
                                </td>

                                <td className="lab-test-name">{r.testName}</td>

                                <td className="lab-result-value">{r.resultValue || '—'}</td>

                                <td>
                                    <div className="lab-date-cell">
                                        <i className="ti ti-calendar" />
                                        <span>{formatDate(r.testDate)}</span>
                                    </div>
                                </td>

                                <td>
                                    <span className="lab-status-badge" data-status={r.status}>
                                        {r.status}
                                    </span>
                                </td>

                                <td>
                                    <button onClick={() => navigate(`/lab-results/${r.id}`)} className="lab-view-btn">
                                        View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="lab-empty-row">
                                    <i className="ti ti-flask-off" />
                                    No lab results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreateLabResultModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                    doctors={doctors}
                    patients={patients}
                />
            )}
        </div>
    );
}