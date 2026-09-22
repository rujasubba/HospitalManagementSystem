import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors } from '../../api/doctorService';
import { getAllPatients } from '../../api/patientService';
import { getAllMedicalRecords, createMedicalRecord } from '../../api/Medicalrecordservice ';
import './MedicalRecords.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name) {
    return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Field({ label, required, error, children }) {
    return (
        <div className="record-field">
            <label>
                {label}{required && <span className="required"> *</span>}
            </label>
            {children}
            {error && (
                <span className="record-field-error">
                    <i className="ti ti-alert-circle" />{error}
                </span>
            )}
        </div>
    );
}

function CreateRecordModal({ onClose, onCreate, doctors, patients }) {
    const today = new Date().toISOString().split('T')[0];
    const empty = { patientId: '', doctorId: '', diagnosis: '', prescription: '', notes: '', recordDate: today };
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
        if (!form.doctorId) e.doctorId = 'Please select a doctor';
        if (!form.diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
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
                diagnosis: form.diagnosis.trim(),
                prescription: form.prescription.trim(),
                notes: form.notes.trim(),
                recordDate: form.recordDate,
            });
            onClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data || 'Failed to create record. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={onClose} className="record-modal-overlay" />
            <div className="record-modal">
                <div className="record-modal-header">
                    <div className="record-modal-title">New Medical Record</div>
                    <button onClick={onClose} className="record-modal-close">
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="record-modal-body">

                    {errors.submit && (
                        <div className="record-error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <div className="record-modal-grid-2">
                        <Field label="Patient" required error={errors.patientId}>
                            <select
                                value={form.patientId}
                                onChange={e => set('patientId', e.target.value)}
                                className="record-input"
                                data-error={!!errors.patientId}
                            >
                                <option value="">Select patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                            </select>
                        </Field>

                        <Field label="Doctor" required error={errors.doctorId}>
                            <select
                                value={form.doctorId}
                                onChange={e => set('doctorId', e.target.value)}
                                className="record-input"
                                data-error={!!errors.doctorId}
                            >
                                <option value="">Select doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Record Date" required>
                        <input
                            type="date"
                            value={form.recordDate}
                            max={today}
                            onChange={e => set('recordDate', e.target.value)}
                            className="record-input"
                        />
                    </Field>

                    <Field label="Diagnosis" required error={errors.diagnosis}>
                        <input
                            type="text"
                            placeholder="e.g. HayFever"
                            value={form.diagnosis}
                            onChange={e => set('diagnosis', e.target.value)}
                            className="record-input"
                            data-error={!!errors.diagnosis}
                        />
                    </Field>

                    <Field label="Prescription / Medications">
                        <textarea
                            placeholder="e.g. Tab. Panadol 500mg once daily for 7 days"
                            value={form.prescription}
                            rows={3}
                            onChange={e => set('prescription', e.target.value)}
                            className="record-input textarea"
                        />
                    </Field>

                    <Field label="Doctor's Notes">
                        <textarea
                            placeholder="Any additional notes..."
                            value={form.notes}
                            rows={3}
                            onChange={e => set('notes', e.target.value)}
                            className="record-input textarea"
                        />
                    </Field>

                    <div className="record-modal-actions">
                        <button onClick={onClose} disabled={submitting} className="record-btn-cancel">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="record-btn-submit"
                        >
                            <i className="ti ti-file-plus" />
                            {submitting ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function MedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [recRes, docRes, patRes] = await Promise.allSettled([
                getAllMedicalRecords(),
                getAllDoctors(),
                getAllPatients(),
            ]);

            if (recRes.status === 'fulfilled') setRecords(recRes.value);
            if (docRes.status === 'fulfilled') setDoctors(docRes.value);
            if (patRes.status === 'fulfilled') setPatients(patRes.value);

            const failed = [recRes, docRes, patRes].filter(r => r.status === 'rejected');
            if (failed.length) {
                setLoadError(`Failed to load: ${failed.length} of 3 data sources unavailable.`);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const filtered = records.filter(r => {
        const q = search.toLowerCase();
        return (
            r.patientName?.toLowerCase().includes(q) ||
            r.doctorName?.toLowerCase().includes(q) ||
            r.diagnosis?.toLowerCase().includes(q)
        );
    });

    async function handleCreate(payload) {
        const created = await createMedicalRecord(payload);
        setRecords(prev => [created, ...prev]);
    }

    const now = new Date();
    const thisMonthCount = records.filter(r => {
        const d = new Date(r.recordDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const uniquePatients = new Set(records.map(r => r.patientId)).size;

    if (loading) {
        return <div className="record-loading">Loading medical records...</div>;
    }

    return (
        <div className="record-page">

            <div className="record-header">
                <div>
                    <h2 className="record-title">Medical Records</h2>
                    <p className="record-subtitle">
                        {records.length} total · {uniquePatients} patients covered
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="record-create-btn">
                    <i className="ti ti-file-plus" />
                    New Record
                </button>
            </div>

            {loadError && (
                <div className="record-error-banner">
                    {loadError}
                </div>
            )}

            <div className="record-stats">
                {[
                    { label: 'Total Records', value: records.length, icon: 'file-description', tone: 'green' },
                    { label: 'This Month', value: thisMonthCount, icon: 'calendar', tone: 'amber' },
                    { label: 'Patients Covered', value: uniquePatients, icon: 'users', tone: 'green' },
                ].map(({ label, value, icon, tone }) => (
                    <div key={label} className="record-stat-card">
                        <div className="record-stat-icon" data-tone={tone}>
                            <i className={`ti ti-${icon}`} />
                        </div>
                        <div>
                            <div className="record-stat-value">{value}</div>
                            <div className="record-stat-label">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="record-toolbar">
                <div className="record-search">
                    <i className="ti ti-search" />
                    <input
                        type="text"
                        placeholder="Search patient, doctor or diagnosis..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="record-table-wrap">
                <table className="record-table">
                    <thead>
                        <tr>
                            {['S.N', 'Patient', 'Doctor', 'Diagnosis', 'Date', 'Action'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((r, i) => (
                            <tr key={r.id}>
                                <td className="record-row-index">{i + 1}</td>

                                <td>
                                    <div className="record-patient-cell">
                                        <div className="record-avatar">
                                            {initials(r.patientName)}
                                        </div>
                                        <span className="record-patient-name">{r.patientName}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="record-doctor-cell">
                                        <i className="ti ti-stethoscope" />
                                        <span>{r.doctorName}</span>
                                    </div>
                                </td>

                                <td className="record-diagnosis-cell" title={r.diagnosis}>{r.diagnosis}</td>

                                <td>
                                    <div className="record-date-cell">
                                        <i className="ti ti-calendar" />
                                        <span>{formatDate(r.recordDate)}</span>
                                    </div>
                                </td>

                                <td>
                                    <button onClick={() => navigate(`/medical-records/${r.id}`)} className="record-view-btn">
                                        View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="record-empty-row">
                                    <i className="ti ti-file-off" />
                                    No medical records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreateRecordModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                    doctors={doctors}
                    patients={patients}
                />
            )}
        </div>
    );
}
