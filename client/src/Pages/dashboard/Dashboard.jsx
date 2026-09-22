
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../../api/patientService';
import { getAllDoctors } from '../../api/doctorService';

function makeInitialsFromFull(fullName) {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function makeInitialsFromParts(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
}

const PALETTES = [
    { ibg: '#E1F5EE', ic: '#0F6E52' },
    { ibg: '#EEF4FD', ic: '#1A5FA8' },
    { ibg: '#FEF7E6', ic: '#875000' },
    { ibg: '#EEEDFE', ic: '#5B41BC' },
    { ibg: '#FEF0F0', ic: '#B03030' },
];
function palette(id) { return PALETTES[(id ?? 0) % PALETTES.length]; }

function patientStatusStyle(s) {
    if (s === 'Admitted') return { sc: '#0F6E52', sbg: '#E1F5EE' };
    if (s === 'Outpatient') return { sc: '#1A5FA8', sbg: '#EEF4FD' };
    if (s === 'Discharged') return { sc: '#6B6B68', sbg: '#F0EFEA' };
    if (s === 'Critical') return { sc: '#B03030', sbg: '#FEF0F0' };
    return { sc: '#6B6B68', sbg: '#F0EFEA' };
}

function StatCard({ icon, label, value, sub, subUp, color, bg }) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 14,
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <i className={`ti ti-${icon}`} style={{ fontSize: 22, color }} />
                </div>
                <i className="ti ti-dots" style={{ fontSize: 16, color: '#a0a09d', cursor: 'pointer' }} />
            </div>
            <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#111210', lineHeight: 1, marginBottom: 4 }}>
                    {value}
                </div>
                <div style={{ fontSize: 13, color: '#6b6b68' }}>{label}</div>
            </div>
            {sub && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: subUp === true ? '#0F6E52' : subUp === false ? '#b03030' : '#6b6b68',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: 10,
                }}>
                    {subUp === true && <i className="ti ti-trending-up" style={{ fontSize: 14 }} />}
                    {subUp === false && <i className="ti ti-trending-down" style={{ fontSize: 14 }} />}
                    {subUp === null && <i className="ti ti-minus" style={{ fontSize: 14 }} />}
                    {sub}
                </div>
            )}
        </div>
    );
}


function Card({ title, action, children, style = {} }) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 14,
            overflow: 'hidden',
            ...style,
        }}>
            {title && (
                <div style={{
                    padding: '15px 20px 13px',
                    borderBottom: '1px solid rgba(0,0,0,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111210' }}>{title}</span>
                    {action && (
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#1A9E75',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                        }}>
                            {action} <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
                        </button>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

function LoadingRow({ label }) {
    return (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b6b68' }}>
            <i className="ti ti-loader-2" style={{ fontSize: 24, display: 'block', marginBottom: 8, animation: 'spin 1s linear infinite' }} />
            {label}
        </div>
    );
}

function ErrorRow({ label, onRetry }) {
    return (
        <div style={{ padding: 30, textAlign: 'center', color: '#B03030' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 22, display: 'block', marginBottom: 8 }} />
            <div style={{ fontSize: 13, marginBottom: 10 }}>{label}</div>
            <button onClick={onRetry} style={{
                padding: '6px 14px', background: '#B03030', color: '#fff',
                border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
            }}>
                Retry
            </button>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [patientsError, setPatientsError] = useState('');
    const [doctorsError, setDoctorsError] = useState('');

    useEffect(() => {
        loadPatients();
        loadDoctors();
    }, []);

    async function loadPatients() {
        setLoadingPatients(true);
        setPatientsError('');
        try {
            const data = await getAllPatients();
            setPatients(data);
        } catch (err) {
            setPatientsError('Could not load patients');
        } finally {
            setLoadingPatients(false);
        }
    }

    async function loadDoctors() {
        setLoadingDoctors(true);
        setDoctorsError('');
        try {
            const data = await getAllDoctors();
            setDoctors(data);
        } catch (err) {
            setDoctorsError('Could not load doctors');
        } finally {
            setLoadingDoctors(false);
        }
    }

    const onDutyDoctors = doctors.filter(d => d.status === 'On Duty');

    const recentPatients = [...patients]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, 5);

    const dutyList = [...onDutyDoctors]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, 5);

    const STATS = [
        { icon: 'users', label: 'Active Patients', value: patients.length, color: '#1A9E75', bg: '#E1F5EE' },
        { icon: 'stethoscope', label: 'Total Doctors', value: doctors.length, color: '#378ADD', bg: '#EEF4FD' },
        { icon: 'user-check', label: 'Doctors On Duty', value: onDutyDoctors.length, color: '#E09418', bg: '#FEF7E6' },
    ];

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111210', margin: 0, marginBottom: 4 }}>
                        Good morning, Dr. Prashant
                    </h2>
                </div>
            </div>

           
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </div>

           
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <Card title="Recent Patients" action="View all">
                    {loadingPatients && <LoadingRow label="Loading patients..." />}
                    {!loadingPatients && patientsError && <ErrorRow label={patientsError} onRetry={loadPatients} />}
                    {!loadingPatients && !patientsError && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f7f7f5' }}>
                                        {['Patient', 'Age', 'Department', 'Ward', 'Status', ''].map(h => (
                                            <th key={h} style={{
                                                padding: '9px 16px',
                                                textAlign: 'left',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: '#a0a09d',
                                                textTransform: 'uppercase',
                                                letterSpacing: '.05em',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPatients.length > 0 ? recentPatients.map((p, i) => {
                                        const { ibg, ic } = palette(p.id);
                                        const { sc, sbg } = patientStatusStyle(p.status);
                                        return (
                                            <tr key={p.id}
                                                style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f7f7f5'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '11px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: ibg, color: ic,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 11.5, fontWeight: 600, flexShrink: 0,
                                                        }}>
                                                            {makeInitialsFromFull(p.fullName)}
                                                        </div>
                                                        <span style={{ fontSize: 13.5, fontWeight: 500, color: '#111210' }}>{p.fullName}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '11px 16px', fontSize: 13, color: '#6b6b68' }}>{p.age}</td>
                                                <td style={{ padding: '11px 16px', fontSize: 13, color: '#6b6b68' }}>{p.department || '—'}</td>
                                                <td style={{ padding: '11px 16px', fontSize: 13, color: '#6b6b68' }}>{p.ward || '—'}</td>
                                                <td style={{ padding: '11px 16px' }}>
                                                    <span style={{
                                                        fontSize: 11.5, fontWeight: 600, padding: '3px 10px',
                                                        borderRadius: 20, background: sbg, color: sc,
                                                    }}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 16px' }}>
                                                    <button
                                                        onClick={() => navigate(`/patients/${p.id}`)}
                                                        style={{
                                                            background: 'none', border: '1px solid rgba(0,0,0,0.1)',
                                                            borderRadius: 6, padding: '4px 12px',
                                                            fontSize: 12, color: '#6b6b68', cursor: 'pointer', fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#a0a09d', fontSize: 13 }}>
                                                No patients yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <Card title="On-Duty Doctors" action="View all">
                    {loadingDoctors && <LoadingRow label="Loading doctors..." />}
                    {!loadingDoctors && doctorsError && <ErrorRow label={doctorsError} onRetry={loadDoctors} />}
                    {!loadingDoctors && !doctorsError && (
                        <div style={{ padding: '4px 0' }}>
                            {dutyList.length > 0 ? dutyList.map((d) => {
                                const { ibg, ic } = palette(d.id);
                                return (
                                    <div key={d.id}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: 'pointer' }}
                                        onClick={() => navigate(`/doctors/${d.id}`)}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f7f7f5'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            background: ibg, color: ic,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 600, flexShrink: 0,
                                        }}>
                                            {makeInitialsFromParts(d.firstName, d.lastName)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111210' }}>
                                                Dr. {d.firstName} {d.lastName}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6b6b68', marginTop: 1 }}>{d.specialty}</div>
                                        </div>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                            background: '#E1F5EE', color: '#0F6E52',
                                        }}>
                                            {d.status}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: 30, textAlign: 'center', color: '#a0a09d', fontSize: 13 }}>
                                    No doctors on duty right now.
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}

