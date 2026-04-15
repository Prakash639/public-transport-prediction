import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '50%',
                background: 'rgba(249, 115, 22, 0.08)', filter: 'blur(120px)', borderRadius: '50%', zIndex: -1
            }}></div>
            <div style={{
                position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%',
                background: 'rgba(250, 204, 21, 0.08)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1
            }}></div>

            <div className="container" style={{ minHeight: 'calc(100vh - 67px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
                <div className="text-center animate-fade-in" style={{ maxWidth: '850px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        background: 'rgba(249, 115, 22, 0.08)',
                        borderRadius: '100px',
                        color: 'var(--primary)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(249, 115, 22, 0.15)'
                    }}>
                        🚌 AI-Powered Real-Time Connectivity
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #1e293b, #334155)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px',
                        lineHeight: 1.1
                    }}>
                        Navigating the Future of <span style={{
                            background: 'var(--gradient-main)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Urban Transit</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--text-muted)',
                        marginBottom: '3rem',
                        lineHeight: '1.7',
                        fontWeight: '400',
                        maxWidth: '650px',
                        margin: '0 auto 3rem'
                    }}>
                        Experience the gold standard in public transportation management. Predictive insights, seamless integration, and real-time tracking at your fingertips.
                    </p>
                    <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                            🚀 Get Started Free
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                            🔍 View Platform
                        </Link>
                    </div>

                    {/* Stats Section */}
                    <div className="flex justify-center gap-8 hero-stats" style={{ marginTop: '5rem' }}>
                        {[
                            { label: 'Active Users', val: '50k+', icon: '👥' },
                            { label: 'Smart Buses', val: '1,200+', icon: '🚌' },
                            { label: 'Daily Routes', val: '800+', icon: '🛣️' }
                        ].map((s, i) => (
                            <div key={i} className="text-center" style={{
                                padding: '1.25rem 2rem',
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                backdropFilter: 'blur(8px)',
                                minWidth: '140px'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{s.val}</div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
