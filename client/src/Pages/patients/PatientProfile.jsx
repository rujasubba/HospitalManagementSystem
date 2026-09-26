import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById } from '../../api/patientService';

function makeInitials(fullName) {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function formatApptDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_COLORS = {
    Confirmed: { bg: '#E3F8E9', text: '#1A7F37' },
    Pending: { bg: '#FFF4E0', text: '#B7791F' },
    Cancelled: { bg: '#FDECEA', text: '#C0392B' },
};

function HeartRateChart() {
    const thisWeek = [88, 72, 95, 68, 82, 78, 90, 74, 86, 70, 93, 80, 78, 85];
    const lastWeek = [75, 80, 65, 90, 72, 84, 70, 88, 76, 82, 68, 95, 74, 80];
    const W = 340, H = 120;
    const minY = 30, maxY = 165;
    const toX = (i) => (i / (thisWeek.length - 1)) * (W - 20) + 10;
    const toY = (v) => H - ((v - minY) / (maxY - minY)) * (H - 20) - 10;
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
        <div style={{ overflowX: 'hidden' }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
                {[40, 80, 120, 160].map(v => (
                    <g key={v}>
                        <line x1={10} y1={toY(v)} x2={W - 10} y2={toY(v)} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="3 3" />
                        <text x={4} y={toY(v) + 4} fontSize={8} fill="var(--text-tertiary)">{v}</text>
                    </g>
                ))}
                {lastWeek.map((v, i) => (<circle key={i} cx={toX(i)} cy={toY(v)} r={3.5} fill="#A8D8D0" opacity={0.7} />))}
                {thisWeek.map((v, i) => (<circle key={i} cx={toX(i)} cy={toY(v)} r={4} fill="#1A9E75" />))}
                {days.map((d, i) => (
                    <text key={i} x={toX(Math.round(i * (thisWeek.length - 1) / 6))} y={H - 1} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">{d}</text>
                ))}
            </svg>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[{ color: '#1A9E75', label: 'This week' }, { color: '#A8D8D0', label: 'Last week' }].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', ...style }}>
            {children}
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            {children}
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <i className={`ti ti-${icon}`} style={{ fontSize: 15, color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
            <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
            </div>
        </div>
    );
}
function ScheduledAppointments({ appointments, onView }) {
    return (
        <Card>
            <SectionTitle>Scheduled Appointments</SectionTitle>

            {appointments.length === 0 && (
                <div style={{ padding: 20, fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                    No confirmed or pending appointments.
                </div>
            )}

            {appointments.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                    {appointments.map((a) => {
                        const colors = STATUS_COLORS[a.statusName] ?? { bg: '#F2F2F2', text: '#555' };
                        return (
                            <div
                                key={a.id}
                                onClick={() => onView(a.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 20px', cursor: 'pointer',
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                                    background: 'var(--bg-secondary)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <i className="ti ti-calendar-event" style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {a.doctorName}
                                        {a.appointmentTypeName ? ` · ${a.appointmentTypeName}` : ''}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                        {formatApptDate(a.appointmentDate)} · {a.timeSlot}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 10.5, fontWeight: 600, padding: '3px 9px',
                                    borderRadius: 20, background: colors.bg, color: colors.text,
                                    flexShrink: 0,
                                }}>
                                    {a.statusName}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
const TREATMENTS = [
    { name: 'Angiography', date: '22 October 2024', doctor: 'Dr. Prashant', done: true, active: false },
    { name: 'Beta-Blockers', date: '14 December 2024', doctor: 'Dr. Prashant', done: true, active: false },
    { name: 'ACE inhibitors', date: '24 December 2024', doctor: 'Dr. Prashant', done: true, active: false },
    { name: 'Open Heart Surgery', date: '28 December 2024', doctor: 'Dr. Prashant', done: false, active: true },
];

const CONDITIONS = [
    { icon: 'activity', label: 'Hypertension', desc: 'High blood pressure requires regular monitoring' },
    { icon: 'wind', label: 'Asthma', desc: 'Airway inflammation and narrowing.' },
    { icon: 'kidney', label: 'Chronic Kidney Disease', desc: 'Loss of kidney function over time if not treated.' },
];

const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1A9E75', color: '#fff', border: 'none',
    borderRadius: 8, padding: '8px 15px', fontSize: 13,
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
};

export default function PatientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
 

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError('');
            try {
                const data = await getPatientById(id);
                if (!cancelled) setPatient(data);
            } catch (err) {
                if (!cancelled) setError('Could not load this patient.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: 'center', color: '#6b6b68' }}>
                <i className="ti ti-loader-2" style={{ fontSize: 32, display: 'block', marginBottom: 10, animation: 'spin 1s linear infinite' }} />
                Loading patient...
                <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div style={{ padding: 24 }}>
                <div style={{
                    background: '#FEF0F0', border: '1px solid #FCCACA',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#B03030', fontSize: 13,
                }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 20, flexShrink: 0 }} />
                    <div>{error || 'Patient not found.'}</div>
                    <button onClick={() => navigate('/patients')} style={{
                        marginLeft: 'auto', padding: '6px 14px', background: '#B03030',
                        color: '#fff', border: 'none', borderRadius: 7,
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    const dob = patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div style={{ minHeight: '100%', background: 'var(--bg)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/patients')} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '8px 14px', fontSize: 13, fontWeight: 500,
                        color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
                    </button>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Patient</h1>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btnPrimary}>
                        <i className="ti ti-plus" style={{ fontSize: 14 }} /> New Appointment
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr minmax(0, 300px)', gap: 16, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <SectionTitle>Patient Information</SectionTitle>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <div style={{ width: 100, height: 120, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #d0ede5 0%, #a8d8ce 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#1A9E75', fontWeight: 600 }}>
                                            {makeInitials(patient.fullName)}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{patient.fullName}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', flex: 1 }}>
                                    <InfoRow icon="gender-bigender" label="Gender" value={patient.gender || '—'} />
                                    <InfoRow icon="phone" label="Phone Number" value={patient.phone || '—'} />
                                    <InfoRow icon="id" label="Age" value={`${patient.age} y.o`} />
                                    <InfoRow icon="mail" label="Email" value={patient.email || '—'} />
                                    <InfoRow icon="calendar" label="Date of Birth" value={dob} />
                                    <InfoRow icon="map-pin" label="Address" value={patient.address || '—'} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle>Medical History</SectionTitle>
                        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                            {CONDITIONS.map(({ icon, label, desc }) => (
                                <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg)' }}>
                                    <i className={`ti ti-${icon}`} style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }} />
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <ScheduledAppointments
                        appointments={patient.appointments ?? []}
                        onView={(apptId) => navigate(`/appointments/${apptId}`)}
                    />

                    <Card>
                        <SectionTitle>Treatement Plan</SectionTitle>
                        <div style={{ padding: '8px 0' }}>
                            {TREATMENTS.map((a, i) => (
                                <div key={i}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderLeft: a.active ? '3px solid var(--brand)' : '3px solid transparent', background: a.active ? 'var(--brand-light)' : 'transparent' }}
                                >
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: a.done ? 'var(--brand)' : a.active ? 'transparent' : 'var(--border)', border: a.active ? '2px dashed var(--brand)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {a.done && <i className="ti ti-check" style={{ fontSize: 13, color: '#fff' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: a.active ? 600 : 500, color: a.active ? 'var(--brand-dark)' : 'var(--text-primary)' }}>{a.name}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{a.date} · {a.doctor}</div>
                                    </div>
                                    {a.active && (
                                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--brand)', color: '#fff' }}>Upcoming</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ padding: '16px 20px 6px' }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Heart Rate</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>Heart rate is in a stable and healthy state this week.</div>
                            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                                {[{ label: 'Average', value: '78' }, { label: 'Minimum', value: '41' }, { label: 'Maximum', value: '90' }].map(({ label, value }) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                                            <span style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace" }}>{value}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>bpm</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ height: 12 }} />
                    </Card>
                </div>
            </div>
        </div>
    );
}
