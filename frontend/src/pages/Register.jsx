import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('passenger');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="card glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Join SmartTransit</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your account to start your journey</p>
                </div>

                {error && (
                    <div style={{
                        color: 'var(--danger)',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        padding: '0.75rem',
                        background: '#fef2f2',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        border: '1px solid #fee2e2'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">👤 Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">📧 Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">🔒 Create Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">🎭 Account Type</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.75rem',
                            marginTop: '0.5rem'
                        }}>
                            {[
                                { value: 'passenger', icon: '👤', label: 'Passenger' },
                                { value: 'driver', icon: '🚗', label: 'Driver' },
                                { value: 'admin', icon: '👨‍💼', label: 'Admin' }
                            ].map(roleOption => (
                                <div
                                    key={roleOption.value}
                                    onClick={() => setRole(roleOption.value)}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        border: `2px solid ${role === roleOption.value ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        background: role === roleOption.value ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                    className="hover-lift"
                                >
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                        {roleOption.icon}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: role === roleOption.value ? 'var(--primary)' : 'var(--text-main)'
                                    }}>
                                        {roleOption.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {role === 'passenger' ? 'Create Account' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in instead</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};


export default Register;
