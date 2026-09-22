import {Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';


export default function MainLayout() {
    const { pathname } = useLocation();

    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--color-bg-tertiary)',
            '--color-bg': '#ffffff',
            '--color-bg-secondary': '#f5f5f3',
            '--color-bg-tertiary': '#f0efea',
            '--color-bg-hover': '#f0f0ee',
            '--color-bg-danger': '#fcebeb',
            '--color-border': 'rgba(0,0,0,0.1)',
            '--color-text-primary': '#1a1a18',
            '--color-text-secondary': '#6b6b68',
            '--color-text-tertiary': '#a0a09d',
            '--color-text-danger': '#a32d2d',
        }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Topbar pathname={pathname} />

                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 0,
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
