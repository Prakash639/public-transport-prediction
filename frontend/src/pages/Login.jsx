import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'driver') {
                navigate('/driver/dashboard');
            } else {
                navigate('/passenger/search');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="card glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your credentials to access the platform</p>
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
                        <label className="input-label">🔒 Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Sign In
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};


export default Login;
