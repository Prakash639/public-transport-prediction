import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-card" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            padding: '0.75rem 0'
        }}>
            <div className="container flex justify-between items-center">
                <Link to="/" style={{
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    fontFamily: "'Outfit', sans-serif",
                    background: 'var(--gradient-main)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    SmartTransit
                </Link>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Welcome, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong>
                            </span>
                            <Link to="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Dashboard</Link>
                            <button onClick={handleLogout} className="btn" style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #fee2e2',
                                color: 'var(--danger)',
                                background: '#fef2f2'
                            }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Sign In</Link>
                            <Link to="/register" className="btn btn-primary">Join Now</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};


export default Navbar;
