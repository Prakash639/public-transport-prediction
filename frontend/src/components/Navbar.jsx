import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <span className="brand-icon">🚌</span>
                    <span>Smart<span className="brand-accent">Transit</span></span>
                </Link>

                {/* Hamburger Button */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation Links */}
                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {user ? (
                        <>
                            <span className="nav-welcome">
                                Welcome, <strong>{user.name}</strong>
                            </span>
                            <Link
                                to="/dashboard"
                                className="btn btn-nav-outline"
                                onClick={closeMenu}
                            >
                                📊 Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-nav-danger"
                            >
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="btn btn-nav-outline"
                                onClick={closeMenu}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-nav-primary"
                                onClick={closeMenu}
                            >
                                🚀 Join Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
