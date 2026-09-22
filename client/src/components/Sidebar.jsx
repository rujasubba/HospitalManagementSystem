import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    {
        section: 'Main',
        items: [
            { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
            { label: 'Patients', icon: 'users', path: '/patients'},
            { label: 'Appointments', icon: 'calendar', path: '/appointments',badgeRed: true },
            { label: 'Doctors', icon: 'stethoscope', path: '/doctors' },
        ],
    },
    {
        section: 'Clinical',
        items: [
            { label: 'Medical Records', icon: 'file-description', path: '/records' },
            { label: 'Pharmacy', icon: 'pill', path: '/pharmacy' },
            { label: 'Lab Results', icon: 'microscope', path: '/lab' },
        ],
    },
    {
        section: 'Admin',
        items: [
            { label: 'Billing', icon: 'report-money', path: '/billing' },
            { label: 'Reports', icon: 'chart-bar', path: '/reports' },
            { label: 'Settings', icon: 'settings', path: '/settings' },
        ],
    },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside style={{
            width: collapsed ? 64 : 220,
            minWidth: collapsed ? 64 : 220,
            background: 'var(--color-bg)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s ease, min-width 0.2s ease',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '20px 16px 16px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    background: '#1D9E75',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 17,
                }}>
                    <i className="ti ti-heart-rate-monitor" />
                </div>

                {!collapsed && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                            AllCare HMS
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Admin Panel</div>
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        fontSize: 16,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: collapsed ? 0 : 'auto',
                    }}
                >
                    <i className={`ti ti-${collapsed ? 'chevron-right' : 'chevron-left'}`} />
                </button>
            </div>

            <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
                {NAV_ITEMS.map(({ section, items }) => (
                    <div key={section}>
                        {!collapsed && (
                            <div style={{
                                fontSize: 10,
                                fontWeight: 500,
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                padding: '10px 8px 6px',
                            }}>
                                {section}
                            </div>
                        )}

                        {items.map(({ label, icon, path, badge, badgeRed }) => {
                            const isActive = location.pathname === path;
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    title={collapsed ? label : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        width: '100%',
                                        padding: collapsed ? '9px 0' : '9px 10px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 13.5,
                                        fontWeight: isActive ? 500 : 400,
                                        color: isActive ? '#0F6E56' : 'var(--color-text-secondary)',
                                        background: isActive ? '#E1F5EE' : 'transparent',
                                        marginBottom: 2,
                                        transition: 'background 0.12s, color 0.12s',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <i className={`ti ti-${icon}`} style={{ fontSize: 18, minWidth: 18 }} />

                                    {!collapsed && (
                                        <>
                                            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                                            {badge && (
                                                <span style={{
                                                    background: badgeRed ? 'var(--color-bg-danger)' : '#E1F5EE',
                                                    color: badgeRed ? 'var(--color-text-danger)' : '#0F6E56',
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    padding: '1px 7px',
                                                    borderRadius: 20,
                                                }}>
                                                    {badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}

                        {!collapsed && <div style={{ height: 4 }} />}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border)' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{
                        width: 30,
                        height: 30,
                        minWidth: 30,
                        borderRadius: '50%',
                        background: '#E1F5EE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0F6E56',
                    }}>
                        DR
                    </div>

                    {!collapsed && (
                        <>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                                    Dr. Prashant Shah
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Cardiologist</div>
                            </div>
                            <i className="ti ti-chevron-right" style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }} />
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
