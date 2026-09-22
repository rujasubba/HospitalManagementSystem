
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, createDoctor } from '../../api/doctorService';

const SPECIALTIES_LIST = [
    'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics',
    'General Medicine', 'Dermatology', 'Pulmonology', 'Oncology',
    'Urology', 'Endocrinology', 'Gastroenterology',
];
const FILTER_SPECIALTIES = ['All', ...SPECIALTIES_LIST];
const FILTER_STATUSES = ['All', 'On Duty', 'Off Duty', 'On Leave'];

function makeInitials(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
}

const PALETTES = [
    { ibg: '#E1F5EE', ic: '#0F6E52' },
    { ibg: '#EEF4FD', ic: '#1A5FA8' },
    { ibg: '#FEF7E6', ic: '#875000' },
    { ibg: '#EEEDFE', ic: '#5B41BC' },
    { ibg: '#FEF0F0', ic: '#B03030' },
];
function palette(id) { return PALETTES[id % PALETTES.length]; }

function statusStyle(s) {
    if (s === 'On Duty') return { background: '#E1F5EE', color: '#0F6E52' };
    if (s === 'Off Duty') return { background: '#F0EFEA', color: '#6B6B68' };
    if (s === 'On Leave') return { background: '#FEF7E6', color: '#875000' };
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

function AddDoctorModal({ onClose, onAdded }) {
    const empty = {
        firstName: '',
        lastName: '',
        specialty: '',
        phone: '',
        email: '',
        status: 'On Duty',
        patientCount: 0,
    };
    const [form, setForm] = useState(empty);
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
        if (!form.firstName.trim()) e.firstName = 'First name is required';
        if (!form.lastName.trim()) e.lastName = 'Last name is required';
        if (!form.specialty) e.specialty = 'Please select a specialty';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            const newDoctor = await createDoctor({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                specialty: form.specialty,
                phone: form.phone.trim(),
                email: form.email.trim(),
                status: form.status,
                patientCount: Number(form.patientCount) || 0,
            });
            onAdded(newDoctor);
            onClose();
        } catch (err) {
            setApiError(
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                'Failed to add doctor. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />

            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
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
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#111210' }}>Add New Doctor</div>
                        <div style={{ fontSize: 12.5, color: '#6b6b68', marginTop: 3 }}>
                            Fill in the details to register a new doctor
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
                            borderRadius: 8, padding: '10px 14px',
                            fontSize: 13, color: '#B03030',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} />
                            {apiError}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="First Name" required error={errors.firstName}>
                            <input type="text" placeholder="e.g. Emily"
                                value={form.firstName} onChange={e => set('firstName', e.target.value)}
                                style={iStyle(errors.firstName)} />
                        </Field>
                        <Field label="Last Name" required error={errors.lastName}>
                            <input type="text" placeholder="e.g. Chen"
                                value={form.lastName} onChange={e => set('lastName', e.target.value)}
                                style={iStyle(errors.lastName)} />
                        </Field>
                    </div>

                    <Field label="Specialty" required error={errors.specialty}>
                        <select value={form.specialty} onChange={e => set('specialty', e.target.value)}
                            style={iStyle(errors.specialty)}>
                            <option value="">Select specialty</option>
                            {SPECIALTIES_LIST.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Phone" required error={errors.phone}>
                            <input type="text" placeholder="+1 555-0100"
                                value={form.phone} onChange={e => set('phone', e.target.value)}
                                style={iStyle(errors.phone)} />
                        </Field>
                        <Field label="Email" required error={errors.email}>
                            <input type="email" placeholder="doctor@allcare.com"
                                value={form.email} onChange={e => set('email', e.target.value)}
                                style={iStyle(errors.email)} />
                        </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Status">
                            <select value={form.status} onChange={e => set('status', e.target.value)}
                                style={iStyle()}>
                                <option>On Duty</option>
                                <option>Off Duty</option>
                                <option>On Leave</option>
                            </select>
                        </Field>
                        <Field label="Current Patient Count">
                            <input type="number" min="0" placeholder="0"
                                value={form.patientCount} onChange={e => set('patientCount', e.target.value)}
                                style={iStyle()} />
                        </Field>
                    </div>

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
                                : <><i className="ti ti-user-plus" style={{ fontSize: 16 }} /> Add Doctor</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
export default function Doctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('All');
    const [status, setStatus] = useState('All');
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        loadDoctors();
    }, []);

    async function loadDoctors() {
        setLoading(true);
        setFetchError('');
        try {
            const data = await getAllDoctors();
            setDoctors(data);
        } catch (err) {
            setFetchError('Could not load doctors');
        } finally {
            setLoading(false);
        }
    }

    function handleAdded(newDoctor) {
        setDoctors(prev => [...prev, newDoctor]);
    }

    const filtered = doctors.filter(d => {
        const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
        const matchSearch = fullName.includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase());
        const matchSpecialty = specialty === 'All' || d.specialty === specialty;
        const matchStatus = status === 'All' || d.status === status;
        return matchSearch && matchSpecialty && matchStatus;
    });

    const onDutyCount = doctors.filter(d => d.status === 'On Duty').length;
    const offDutyCount = doctors.filter(d => d.status === 'Off Duty').length;
    const onLeaveCount = doctors.filter(d => d.status === 'On Leave').length;

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111210', margin: 0, marginBottom: 4 }}>Doctors</h2>
                    <p style={{ fontSize: 13, color: '#6b6b68', margin: 0 }}>
                        {doctors.length} doctors registered · {onDutyCount} on duty today
                    </p>
                </div>
                <button onClick={() => setShowAdd(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: '#1A9E75', color: '#fff', border: 'none',
                    borderRadius: 9, padding: '10px 18px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <i className="ti ti-plus" style={{ fontSize: 16 }} /> Add Doctor
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { label: 'Total Doctors', value: doctors.length, icon: 'stethoscope', color: '#1A9E75', bg: '#E1F5EE' },
                    { label: 'On Duty', value: onDutyCount, icon: 'user-check', color: '#1A9E75', bg: '#E1F5EE' },
                    { label: 'Off Duty', value: offDutyCount, icon: 'user-minus', color: '#6B6B68', bg: '#F0EFEA' },
                    { label: 'On Leave', value: onLeaveCount, icon: 'user-off', color: '#875000', bg: '#FEF7E6' },
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
                    <input type="text" placeholder="Search by name or specialty..."
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
                <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={{
                    padding: '8px 12px', background: '#f7f7f5',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
                    fontSize: 13, color: '#111210', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    {FILTER_SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{
                    padding: '8px 12px', background: '#f7f7f5',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
                    fontSize: 13, color: '#111210', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    {FILTER_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <span style={{ fontSize: 12, color: '#a0a09d', marginLeft: 'auto' }}>
                    Showing {filtered.length} of {doctors.length}
                </span>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: 60, color: '#6b6b68' }}>
                    <i className="ti ti-loader-2" style={{ fontSize: 32, display: 'block', marginBottom: 10, animation: 'spin 1s linear infinite' }} />
                    Loading doctors...
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
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Failed to load doctors</div>
                        <div>{fetchError}</div>
                    </div>
                    <button onClick={loadDoctors} style={{
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
                                {['S.N', 'Doctor', 'Specialty', 'Phone', 'Email', 'Patients', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{
                                        padding: '11px 18px', textAlign: 'left',
                                        fontSize: 11, fontWeight: 600, color: '#a0a09d',
                                        textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((d, i) => {
                                const { ibg, ic } = palette(d.id);
                                const fullName = `Dr. ${d.firstName} ${d.lastName}`;
                                return (
                                    <tr key={d.id} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
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
                                                    {makeInitials(d.firstName, d.lastName)}
                                                </div>
                                                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111210' }}>{fullName}</div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <i className="ti ti-stethoscope" style={{ fontSize: 14, color: '#a0a09d' }} />
                                                <span style={{ fontSize: 13, color: '#6b6b68' }}>{d.specialty}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <i className="ti ti-phone" style={{ fontSize: 13, color: '#a0a09d' }} />
                                                <span style={{ fontSize: 13, color: '#6b6b68' }}>{d.phone}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <i className="ti ti-mail" style={{ fontSize: 13, color: '#a0a09d' }} />
                                                <span style={{ fontSize: 13, color: '#6b6b68' }}>{d.email}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: '#111210' }}>
                                            {d.patientCount}
                                        </td>

                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                fontSize: 11.5, fontWeight: 600,
                                                padding: '4px 10px', borderRadius: 20,
                                                ...statusStyle(d.status),
                                            }}>
                                                {d.status}
                                            </span>
                                        </td>

                                        <td style={{ padding: '14px 18px' }}>
                                            <button onClick={() => navigate(`/doctors/${d.id}`)} style={{
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
                                        No doctors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && <AddDoctorModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}

            <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}