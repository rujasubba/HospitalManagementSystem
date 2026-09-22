import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients, createPatient } from '../../api/patientService';

const DEPARTMENTS_LIST = [
    'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics',
    'General Medicine', 'Dermatology', 'Pulmonology', 'Oncology',
    'Urology', 'Endocrinology', 'Gastroenterology',
];
const FILTER_DEPARTMENTS = ['All', ...DEPARTMENTS_LIST];
const FILTER_STATUSES = ['All', 'Admitted', 'Outpatient', 'Discharged', 'Critical'];

function makeInitials(fullName) {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

const PALETTES = [
    { ibg: '#E1F5EE', ic: '#0F6E52' },
    { ibg: '#EEF4FD', ic: '#1A5FA8' },
    { ibg: '#FEF7E6', ic: '#875000' },
    { ibg: '#EEEDFE', ic: '#5B41BC' },
    { ibg: '#FEF0F0', ic: '#B03030' },
];
function palette(id) { return PALETTES[(id ?? 0) % PALETTES.length]; }

function statusStyle(s) {
    if (s === 'Admitted') return { background: '#E1F5EE', color: '#0F6E52' };
    if (s === 'Outpatient') return { background: '#EEF4FD', color: '#1A5FA8' };
    if (s === 'Discharged') return { background: '#F0EFEA', color: '#6B6B68' };
    if (s === 'Critical') return { background: '#FEF0F0', color: '#B03030' };
    return {};
}

function iStyle(err) {
    return {
        width: '100%', padding: '9px 12px', boxSizing: 'border-box',
        background: '#f7f7f5',
        border: `1px solid ${err ? '#E24B4A' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 8, fontSize: 13, color: '#111210',
        outline: 'none', fontFamily: 'inherit',
    };
}

function AddPatientModal({ onClose, onAdded }) {
    const [form, setForm] = useState({
        fullName: '', gender: '', age: '', dateOfBirth: '',
        phone: '', email: '', address: '',
        department: '', ward: '', status: 'Admitted',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
        setApiError('');
    }

    function validate() {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!form.gender) e.gender = 'Please select a gender';
        if (!form.age || isNaN(Number(form.age)) || Number(form.age) <= 0) e.age = 'Enter a valid age';
        if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            const newPatient = await createPatient({
                ...form,
                age: Number(form.age),
                dateOfBirth: new Date(form.dateOfBirth).toISOString(),
            });
            onAdded(newPatient);
            onClose();
        } catch (err) {
            setApiError(
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                'Failed to add patient. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 540, maxHeight: '90vh', overflowY: 'auto',
                background: '#fff', borderRadius: 16, zIndex: 400,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
                <div style={{
                    padding: '22px 24px 18px', borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
                }}>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#111210' }}>Add New Patient</div>
                        <div style={{ fontSize: 12.5, color: '#6b6b68', marginTop: 3 }}>
                            Fill in the details to register a new patient
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#f7f7f5', border: 'none', borderRadius: 8,
                        width: 32, height: 32, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#6b6b68',
                    }}>
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {apiError && (
                        <div style={{
                            background: '#FEF0F0', border: '1px solid #FCCACA',
                            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B03030',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} />
                            {apiError}
                        </div>
                    )}

                    <Field label="Full Name" required error={errors.fullName}>
                        <input type="text" placeholder="e.g. John Smith"
                            value={form.fullName} onChange={e => set('fullName', e.target.value)}
                            style={iStyle(errors.fullName)} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Gender" required error={errors.gender}>
                            <select value={form.gender} onChange={e => set('gender', e.target.value)} style={iStyle(errors.gender)}>
                                <option value="">Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </Field>
                        <Field label="Age" required error={errors.age}>
                            <input type="number" min="0" max="150" placeholder="e.g. 35"
                                value={form.age} onChange={e => set('age', e.target.value)}
                                style={iStyle(errors.age)} />
                        </Field>
                    </div>

                    <Field label="Date of Birth" required error={errors.dateOfBirth}>
                        <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                            style={iStyle(errors.dateOfBirth)} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Phone Number">
                            <input type="text" placeholder="e.g. 04XX XXX XXX"
                                value={form.phone} onChange={e => set('phone', e.target.value)} style={iStyle()} />
                        </Field>
                        <Field label="Email">
                            <input type="email" placeholder="e.g. john@email.com"
                                value={form.email} onChange={e => set('email', e.target.value)} style={iStyle()} />
                        </Field>
                    </div>

                    <Field label="Address">
                        <input type="text" placeholder="e.g. 81 Edward Street, Adelaide SA"
                            value={form.address} onChange={e => set('address', e.target.value)} style={iStyle()} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Department">
                            <select value={form.department} onChange={e => set('department', e.target.value)} style={iStyle()}>
                                <option value="">Select department</option>
                                {DEPARTMENTS_LIST.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Ward">
                            <input type="text" placeholder="e.g. Ward A"
                                value={form.ward} onChange={e => set('ward', e.target.value)} style={iStyle()} />
                        </Field>
                    </div>

                    <Field label="Status">
                        <select value={form.status} onChange={e => set('status', e.target.value)} style={iStyle()}>
                            <option>Admitted</option>
                            <option>Outpatient</option>
                            <option>Discharged</option>
                            <option>Critical</option>
                        </select>
                    </Field>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={onClose} style={{
                            flex: 1, padding: '11px 0', background: 'transparent',
                            border: '1px solid rgba(0,0,0,0.1)', borderRadius: 9,
                            fontSize: 13.5, fontWeight: 500, color: '#6b6b68',
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                            Cancel
                        </button>
                        <button onClick={submit} disabled={loading} style={{
                            flex: 2, padding: '11px 0', background: loading ? '#6b9e8a' : '#1A9E75',
                            border: 'none', borderRadius: 9,
                            fontSize: 13.5, fontWeight: 600, color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        }}>
                            {loading
                                ? <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} /> Saving...</>
                                : <><i className="ti ti-user-plus" style={{ fontSize: 16 }} /> Add Patient</>
                            }
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

function Field({ label, required, error, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#111210' }}>
                {label}{required && <span style={{ color: '#E24B4A' }}> *</span>}
            </label>
            {children}
            {error && (
                <span style={{ fontSize: 11.5, color: '#B03030', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{error}
                </span>
            )}
        </div>
    );
}

export default function Patients() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('All');
    const [status, setStatus] = useState('All');
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        loadPatients();
    }, []);

    async function loadPatients() {
        setLoading(true);
        setFetchError('');
        try {
            const data = await getAllPatients();
            setPatients(data);
        } catch (err) {
            setFetchError('Could not load patients');
        } finally {
            setLoading(false);
        }
    }

    function handleAdded(newPatient) {
        setPatients(prev => [...prev, newPatient]);
    }

    const filtered = patients.filter(p => {
        const name = (p.fullName ?? '').toLowerCase();
        const matchSearch = name.includes(search.toLowerCase()) ||
            (p.department ?? '').toLowerCase().includes(search.toLowerCase());
        const matchDept = department === 'All' || p.department === department;
        const matchStatus = status === 'All' || p.status === status;
        return matchSearch && matchDept && matchStatus;
    });

    const admitted = patients.filter(p => p.status === 'Admitted').length;
    const discharged = patients.filter(p => p.status === 'Discharged').length;
    const critical = patients.filter(p => p.status === 'Critical').length;

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111210', margin: 0, marginBottom: 4 }}>Patients</h2>
                    <p style={{ fontSize: 13, color: '#6b6b68', margin: 0 }}>
                        {patients.length} patients registered · {admitted} admitted
                    </p>
                </div>
                <button onClick={() => setShowAdd(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: '#1A9E75', color: '#fff', border: 'none',
                    borderRadius: 9, padding: '10px 18px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <i className="ti ti-plus" style={{ fontSize: 16 }} /> Add Patient
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { label: 'Total Patients', value: patients.length, icon: 'users', color: '#1A9E75', bg: '#E1F5EE' },
                    { label: 'Admitted', value: admitted, icon: 'bed', color: '#1A9E75', bg: '#E1F5EE' },
                    { label: 'Discharged', value: discharged, icon: 'door-exit', color: '#6B6B68', bg: '#F0EFEA' },
                    { label: 'Critical', value: critical, icon: 'alert-triangle', color: '#B03030', bg: '#FEF0F0' },
                ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} style={{
                        background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 14, padding: '18px 20px',
                        display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 11, background: bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <i className={`ti ti-${icon}`} style={{ fontSize: 22, color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#111210', lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: 12.5, color: '#6b6b68', marginTop: 3 }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <i className="ti ti-search" style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 15, color: '#a0a09d', pointerEvents: 'none',
                    }} />
                    <input type="text" placeholder="Search by name or department..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px 8px 34px', boxSizing: 'border-box',
                            background: '#f7f7f5', border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 8, fontSize: 13, color: '#111210',
                            outline: 'none', fontFamily: 'inherit',
                        }}
                        onFocus={e => e.target.style.borderColor = '#1A9E75'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                    />
                </div>
                <select value={department} onChange={e => setDepartment(e.target.value)} style={{
                    padding: '8px 12px', background: '#f7f7f5',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
                    fontSize: 13, color: '#111210', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    {FILTER_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{
                    padding: '8px 12px', background: '#f7f7f5',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
                    fontSize: 13, color: '#111210', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    {FILTER_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <span style={{ fontSize: 12, color: '#a0a09d', marginLeft: 'auto' }}>
                    Showing {filtered.length} of {patients.length}
                </span>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: 60, color: '#6b6b68' }}>
                    <i className="ti ti-loader-2" style={{ fontSize: 32, display: 'block', marginBottom: 10, animation: 'spin 1s linear infinite' }} />
                    Loading patients...
                </div>
            )}

            {!loading && fetchError && (
                <div style={{
                    background: '#FEF0F0', border: '1px solid #FCCACA',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#B03030', fontSize: 13,
                }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 20, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Failed to load patients</div>
                        <div>{fetchError}</div>
                    </div>
                    <button onClick={loadPatients} style={{
                        marginLeft: 'auto', padding: '6px 14px', background: '#B03030',
                        color: '#fff', border: 'none', borderRadius: 7,
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !fetchError && (
                <div style={{
                    background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 14, overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f7f7f5' }}>
                                {['S.N', 'Patient', 'Department', 'Ward', 'Age', 'Phone', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{
                                        padding: '11px 18px', textAlign: 'left',
                                        fontSize: 11, fontWeight: 600, color: '#a0a09d',
                                        textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p, i) => {
                                const { ibg, ic } = palette(p.id);
                                return (
                                    <tr key={p.id} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f7f7f5'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#a0a09d', fontWeight: 500 }}>{i + 1}</td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: '50%',
                                                    background: ibg, color: ic,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {makeInitials(p.fullName)}
                                                </div>
                                                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111210' }}>{p.fullName}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b6b68' }}>{p.department || '—'}</td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b6b68' }}>{p.ward || '—'}</td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#111210', fontWeight: 600 }}>{p.age}</td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b6b68' }}>{p.phone || '—'}</td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                fontSize: 11.5, fontWeight: 600,
                                                padding: '4px 10px', borderRadius: 20,
                                                ...statusStyle(p.status),
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <button onClick={() => navigate(`/patients/${p.id}`)} style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                background: '#F0F9F5', border: '1px solid #C5E8D9',
                                                borderRadius: 7, padding: '6px 14px',
                                                fontSize: 12.5, fontWeight: 500,
                                                color: '#0F6E52', cursor: 'pointer', fontFamily: 'inherit',
                                            }}>
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} style={{ padding: 60, textAlign: 'center', color: '#a0a09d' }}>
                                        <i className="ti ti-search-off" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
            <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}







