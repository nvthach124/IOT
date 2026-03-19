import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import thachImg from '/assets/images/thach.png';

/**
 * Layout component - Header + Navigation + Content (Outlet)
 * Thay thế phần header lặp lại trong mỗi HTML file
 */
export default function Layout() {
    return (
        <div className="layout-container">
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '12px 32px',
                    background: 'rgba(23, 25, 28, 0.5)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '80px' }}>
                    <p></p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '8px',
                            background: 'var(--color-primary)',
                            borderRadius: '8px',
                            color: 'white',
                        }}>
                            <span className="material-symbols-outlined" style={{ display: 'block' }}>nest_eco_leaf</span>
                        </div>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            letterSpacing: '-0.025em',
                            color: 'white',
                        }}>
                            IOT<span style={{ color: 'var(--color-primary)' }}>SMARTHOME</span>
                        </h1>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '80px' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive ? 'nav-link-active' : 'nav-link-inactive'
                            }
                        >
                            DashBoard
                        </NavLink>
                        <NavLink
                            to="/data-sensor"
                            className={({ isActive }) =>
                                isActive ? 'nav-link-active' : 'nav-link-inactive'
                            }
                        >
                            Data Sensor
                        </NavLink>
                        <NavLink
                            to="/active-history"
                            className={({ isActive }) =>
                                isActive ? 'nav-link-active' : 'nav-link-inactive'
                            }
                        >
                            Active History
                        </NavLink>
                        <NavLink
                            to="/profile"
                            style={{
                                height: '40px',
                                width: '40px',
                                borderRadius: '9999px',
                                background: 'rgba(52, 167, 173, 0.2)',
                                border: '2px solid var(--color-primary)',
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                display: 'block',
                            }}
                        >
                            <img
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt="User profile picture"
                                src={thachImg}
                            />
                        </NavLink>
                    </nav>
                    <p></p>
                </div>
            </header>

            <Outlet />
        </div>
    );
}
