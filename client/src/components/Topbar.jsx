import { useState } from 'react';

function getTodayLabel() {
    return new Date().toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

const NOTIFICATIONS = [];

const PAGE_TITLES = {
    '/': 'Dashboard',
    '/patients': 'Patients',
    '/appointments': 'Appointments',
    '/doctors': 'Doctors',
    '/records': 'Medical Records',
    '/pharmacy': 'Pharmacy',
    '/lab': 'Lab Results',
    '/billing': 'Billing',
    '/reports': 'Reports',
    '/settings': 'Settings',
};

export default function Topbar({ pathname = '/' }) {
    const [search, setSearch] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const title = PAGE_TITLES[pathname] ?? 'Dashboard';
    const unreadCount = NOTIFICATIONS.length;

    return (
        <header style={{
            position: 'relative',
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            gap: 16,
            zIndex: 100,
        }}>

            <h1 style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                margin: 0,
                flex: 1,
            }}>
                {title}
            </h1>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <i className="ti ti-search" style={{
                    position: 'absolute',
                    left: 10,
                    fontSize: 15,
                    color: 'var(--color-text-tertiary)',
                    pointerEvents: 'none',
                }} />
                <input
                    type="text"
                    placeholder="Search patients, doctors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '6px 12px 6px 32px',
                        fontSize: 13,
                        color: 'var(--color-text-primary)',
                        width: 220,
                        outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        style={{
                            position: 'absolute',
                            right: 8,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-tertiary)',
                            fontSize: 14,
                            padding: 0,
                            display: 'flex',
                        }}
                    >
                        <i className="ti ti-x" />
                    </button>
                )}
            </div>

            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                {getTodayLabel()}
            </span>

            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        background: notifOpen ? 'var(--color-bg-secondary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        fontSize: 18,
                        position: 'relative',
                    }}
                    aria-label="Notifications"
                >
                    <i className="ti ti-bell" />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 7,
                            height: 7,
                            background: '#E24B4A',
                            borderRadius: '50%',
                            border: '1.5px solid var(--color-bg)',
                        }} />
                    )}
                </button>

                {notifOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 42,
                        right: 0,
                        width: 300,
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        zIndex: 200,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                Notifications
                            </span>
                            <span style={{
                                fontSize: 11,
                                background: '#E1F5EE',
                                color: '#0F6E56',
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontWeight: 500,
                            }}>
                                {unreadCount} new
                            </span>
                        </div>
                        {NOTIFICATIONS.map(n => (
                            <div key={n.id} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--color-border)',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <i className={`ti ti-${n.icon}`} style={{ fontSize: 16, color: n.color, marginTop: 1 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{n.text}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{n.time}</div>
                                </div>
                            </div>
                        ))}
                        <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: 12, color: '#1D9E75', cursor: 'pointer' }}>View all notifications</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: '#E1F5EE',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0F6E56',
                        cursor: 'pointer',
                    }}
                    aria-label="Profile menu"
                >
                    RS
                </button>

                {profileOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 42,
                        right: 0,
                        width: 200,
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        zIndex: 200,
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}> Ruja Subba</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Admin</div>
                        </div>
                        {[
                            { icon: 'user', label: 'My Profile' },
                            { icon: 'settings', label: 'Settings' },
                        ].map(({ icon, label }) => (
                            <div key={label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 16px',
                                    fontSize: 13,
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--color-border)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <i className={`ti ti-${icon}`} style={{ fontSize: 16 }} />
                                {label}
                            </div>
                        ))}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 16px',
                                fontSize: 13,
                                color: '#A32D2D',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-danger)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <i className="ti ti-logout" style={{ fontSize: 16 }} />
                            Sign out
                        </div>
                    </div>
                )}
            </div>

            {(notifOpen || profileOpen) && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
                />
            )}
        </header>
    );
}
