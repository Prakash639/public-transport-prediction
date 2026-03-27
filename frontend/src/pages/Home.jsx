import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '50%',
                background: 'var(--primary-glow)', filter: 'blur(120px)', borderRadius: '50%', zIndex: -1
            }}></div>
            <div style={{
                position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '40%',
                background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1
            }}></div>

            <div className="container" style={{ minHeight: 'calc(100vh - 74px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
                <div className="text-center animate-fade-in" style={{ maxWidth: '850px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.25rem',
                        background: 'rgba(37, 99, 235, 0.08)',
                        borderRadius: '100px',
                        color: 'var(--primary)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        ✨ AI-Powered Real-Time Connectivity
                    </div>
                    <h1 style={{
                        fontSize: 'max(3.5rem, 5vw)',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #0f172a, #334155)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px'
                    }}>
                        Navigating the Future of <span style={{
                            background: 'var(--gradient-main)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Urban Transit</span>
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        marginBottom: '3rem',
                        lineHeight: '1.6',
                        fontWeight: '400'
                    }}>
                        Experience the gold standard in public transportation management. Predictive insights, seamless integration, and real-time tracking at your fingertips.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            Get Started Free
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            View Platform
                        </Link>
                    </div>

                    {/* Stats Section Placeholder */}
                    <div className="flex justify-center gap-8" style={{ marginTop: '5rem', opacity: 0.7 }}>
                        {[
                            { label: 'Active Users', val: '50k+' },
                            { label: 'Smart Buses', val: '1,200+' },
                            { label: 'Daily Routes', val: '800+' }
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{s.val}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Home;
