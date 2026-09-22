import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../../api/doctorService';

function makeInitials(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
}

function statusStyle(s) {
    if (s === 'On Duty') return { background: '#E1F5EE', color: '#0F6E52' };
    if (s === 'Off Duty') return { background: '#F0EFEA', color: '#6B6B68' };
    if (s === 'On Leave') return { background: '#FEF7E6', color: '#875000' };
    return {};
}

function formatApptDate(d) {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByPatient(appointments) {
    const map = new Map();
    for (const a of appointments) {
        if (!map.has(a.patientId)) {
            map.set(a.patientId, { patientId: a.patientId, patientName: a.patientName, appointments: [] });
        }
        map.get(a.patientId).appointments.push(a);
    }
    return Array.from(map.values()).sort((a, b) => a.patientName.localeCompare(b.patientName));
}

export default function DoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError('');
            try {
                const data = await getDoctorById(id);
                if (!cancelled) setDoctor(data);
            } catch (err) {
                if (!cancelled) setError('Could not load this doctor.');
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
                Loading doctor...
                <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div style={{ padding: 24 }}>
                <div style={{
                    background: '#FEF0F0', border: '1px solid #FCCACA',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#B03030', fontSize: 13,
                }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 20, flexShrink: 0 }} />
                    <div>{error || 'Doctor not found.'}</div>
                    <button onClick={() => navigate('/doctors')} style={{
                        marginLeft: 'auto', padding: '6px 14px', background: '#B03030',
                        color: '#fff', border: 'none', borderRadius: 7,
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Back to Doctors
                    </button>
                </div>
            </div>
        );
    }

    const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    const confirmedPatients = groupByPatient(doctor.confirmedAppointments ?? []);

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate('/doctors')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
                    padding: '8px 14px', fontSize: 13, fontWeight: 500,
                    color: '#6b6b68', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
                </button>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111210', margin: 0 }}>Doctor Profile</h1>
            </div>

            <div style={{
                maxWidth: 560,
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1A9E75 0%, #0F6E52 100%)',
                    padding: '28px 24px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff',
                    }}>
                        {makeInitials(doctor.firstName, doctor.lastName)}
                    </div>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{fullName}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>{doctor.specialty}</div>
                    </div>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, alignSelf: 'flex-start', ...statusStyle(doctor.status) }}>
                        {doctor.status}
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            { icon: 'phone', label: 'Phone', value: doctor.phone },
                            { icon: 'mail', label: 'Email', value: doctor.email },
                            { icon: 'users', label: 'Patients (Confirmed)', value: doctor.confirmedPatientsCount },
                            {
                                icon: 'calendar', label: 'Joined',
                                value: doctor.createdAt
                                    ? new Date(doctor.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—',
                            },
                        ].map(({ icon, label, value }) => (
                            <div key={label} style={{ background: '#f7f7f5', borderRadius: 10, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                    <i className={`ti ti-${icon}`} style={{ fontSize: 14, color: '#1A9E75' }} />
                                    <span style={{ fontSize: 11, color: '#a0a09d', fontWeight: 500 }}>{label}</span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111210' }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{
                            flex: 1, padding: '10px 0', background: '#1A9E75',
                            color: '#fff', border: 'none', borderRadius: 9,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                            <i className="ti ti-calendar-plus" /> Book Appointment
                        </button>
                        <button style={{
                            flex: 1, padding: '10px 0', background: 'transparent',
                            color: '#6b6b68', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 9,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                            <i className="ti ti-edit" /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div style={{
                maxWidth: 560,
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                    fontSize: 15, fontWeight: 600, color: '#111210',
                }}>
                    Patients with Confirmed Appointments
                </div>

                {confirmedPatients.length === 0 && (
                    <div style={{ padding: 20, fontSize: 12.5, color: '#a0a09d' }}>
                        No confirmed appointments yet.
                    </div>
                )}

                {confirmedPatients.length > 0 && (
                    <div>
                        {confirmedPatients.map(({ patientId, patientName, appointments }) => {
                            const next = appointments
                                .slice()
                                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
                            const [first, ...rest] = patientName.split(' ');
                            return (
                                <div
                                    key={patientId}
                                    onClick={() => navigate(`/patients/${patientId}`)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 24px', cursor: 'pointer',
                                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                        background: '#E1F5EE', color: '#0F6E52',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12.5, fontWeight: 700,
                                    }}>
                                        {makeInitials(first, rest[0])}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#111210' }}>
                                            {patientName}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: '#a0a09d', marginTop: 2 }}>
                                            Next: {formatApptDate(next.appointmentDate)} · {next.timeSlot}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: 10.5, fontWeight: 600, padding: '3px 9px',
                                        borderRadius: 20, background: '#E1F5EE', color: '#0F6E52',
                                        flexShrink: 0,
                                    }}>
                                        {appointments.length} confirmed
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}