import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalBuses: 0, totalRoutes: 0, activeTrips: 0, users: [] });
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busNumber, setBusNumber] = useState('');
    const [routeId, setRouteId] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [destLat, setDestLat] = useState('');
    const [destLng, setDestLng] = useState('');
    const [message, setMessage] = useState('');
    const [actionNotes, setActionNotes] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchIssues()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues');
            setIssues(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleIssueAction = async (issueId, status) => {
        const admin_note = actionNotes[issueId] || '';
        try {
            await api.put(`/issues/${issueId}/status`, { status, admin_note });
            setMessage(`Issue #${issueId} status updated to ${status}`);
            fetchIssues();
            fetchStats();
        } catch (error) {
            setMessage('Error updating issue status');
        }
    };

    const handleNoteChange = (issueId, note) => {
        setActionNotes(prev => ({ ...prev, [issueId]: note }));
    };

    const handleCreateBus = async (e) => {
        e.preventDefault();
        try {
            await api.post('/buses', { bus_number: busNumber, route_id: routeId });
            setMessage('Bus created successfully');
            setBusNumber('');
            setRouteId('');
            fetchStats();
        } catch (error) {
            setMessage('Error creating bus');
        }
    };

    const handleCreateRoute = async (e) => {
        e.preventDefault();
        try {
            await api.post('/routes', { source, destination, dest_lat: destLat, dest_lng: destLng });
            setMessage('Route created successfully');
            setSource('');
            setDestination('');
            setDestLat('');
            setDestLng('');
            fetchStats();
        } catch (error) {
            setMessage('Error creating route');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6 animate-fade-in">
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            background: 'linear-gradient(to right, var(--primary), #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            👨‍💼 Admin Command Center
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Manage all system operations and monitor performance
                        </p>
                    </div>
                    <button className="btn btn-outline" onClick={fetchData}>
                        🔄 Refresh Data
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in">
                    <div className="stat-card">
                        <div className="icon icon-primary icon-lg" style={{ margin: '0 auto 1rem' }}>🚌</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Buses</p>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.totalBuses}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="icon icon-success icon-lg" style={{ margin: '0 auto 1rem' }}>🛣️</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Routes</p>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>{stats.totalRoutes}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="icon icon-lg" style={{ margin: '0 auto 1rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>🚀</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Trips</p>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8b5cf6' }}>{stats.activeTrips}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="icon icon-lg" style={{ margin: '0 auto 1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>⚠️</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Issues</p>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)' }}>
                            {issues.filter(i => i.status === 'Pending').length}
                        </h3>
                    </div>
                </div>

                {message && (
                    <div className="animate-fade-in card" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>✅ {message}</span>
                        <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                    </div>
                )}

                {/* Issue Management Section */}
                <div className="card glass-card mb-8 animate-slide-in" style={{ padding: '2rem' }}>
                    <div className="section-header">
                        <span className="section-icon">📋</span>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Issue Management</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Review and resolve reported issues</p>
                        </div>
                        <span className="badge badge-primary">{issues.length} Total</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Bus</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th style={{ minWidth: '250px' }}>Admin Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((issue) => (
                                    <tr key={issue.id}>
                                        <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#{issue.id}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{issue.user_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{issue.email}</div>
                                        </td>
                                        <td>
                                            {issue.bus_number ? (
                                                <>
                                                    <div style={{ fontWeight: '600' }}>🚌 {issue.bus_number}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {issue.route_source && issue.route_destination
                                                            ? `${issue.route_source} - ${issue.route_destination}`
                                                            : 'No Route'}
                                                    </div>
                                                </>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td><span className="badge-outline">{issue.issue_category}</span></td>
                                        <td style={{ fontSize: '0.875rem' }}>{issue.issue_type}</td>
                                        <td>
                                            <span className={`badge ${issue.status === 'Pending' ? 'badge-warning' :
                                                issue.status === 'Approved' ? 'badge-info' :
                                                    issue.status === 'In Progress' ? 'badge-primary' :
                                                        issue.status === 'Resolved' ? 'badge-success' : 'badge-danger'
                                                }`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    className="input-field"
                                                    placeholder="Action note..."
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                    value={actionNotes[issue.id] || ''}
                                                    onChange={(e) => handleNoteChange(issue.id, e.target.value)}
                                                />
                                                <div className="flex gap-1">
                                                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleIssueAction(issue.id, 'Approved')}>✓ Approve</button>
                                                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleIssueAction(issue.id, 'In Progress')}>⚙️ Work</button>
                                                    <button className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)' }} onClick={() => handleIssueAction(issue.id, 'Resolved')}>✓ Done</button>
                                                    <button className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleIssueAction(issue.id, 'Rejected')}>✕ Reject</button>
                                                </div>
                                                {issue.admin_note && (
                                                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '4px', padding: '0.5rem', background: 'var(--bg-hover)', borderRadius: '6px' }}>
                                                        📝 {issue.admin_note}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Forms */}
                <div className="grid grid-cols-2 gap-6 mb-8 animate-slide-in">
                    {/* Create Route */}
                    <div className="card glass-card" style={{ padding: '2rem' }}>
                        <div className="section-header" style={{ border: 'none', paddingBottom: 0 }}>
                            <span className="section-icon">🛣️</span>
                            <h3 style={{ fontSize: '1.25rem' }}>Create New Route</h3>
                        </div>
                        <form onSubmit={handleCreateRoute} className="flex flex-col gap-4">
                            <div className="input-group">
                                <label className="input-label">📍 Source</label>
                                <input className="input-field" placeholder="Departure City" value={source} onChange={e => setSource(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">📍 Destination</label>
                                <input className="input-field" placeholder="Arrival City" value={destination} onChange={e => setDestination(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label className="input-label">🌐 Dest Latitude</label>
                                    <input className="input-field" type="number" step="any" placeholder="12.9716" value={destLat} onChange={e => setDestLat(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">🌐 Dest Longitude</label>
                                    <input className="input-field" type="number" step="any" placeholder="77.5946" value={destLng} onChange={e => setDestLng(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                ➕ Add Route
                            </button>
                        </form>
                    </div>

                    {/* Create Bus */}
                    <div className="card glass-card" style={{ padding: '2rem' }}>
                        <div className="section-header" style={{ border: 'none', paddingBottom: 0 }}>
                            <span className="section-icon">🚌</span>
                            <h3 style={{ fontSize: '1.25rem' }}>Add New Bus</h3>
                        </div>
                        <form onSubmit={handleCreateBus} className="flex flex-col gap-4">
                            <div className="input-group">
                                <label className="input-label">🔢 Bus Number</label>
                                <input className="input-field" placeholder="Plate Number (e.g. DL-1234)" value={busNumber} onChange={e => setBusNumber(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">🛣️ Route ID</label>
                                <input className="input-field" type="number" placeholder="Enter Route ID" value={routeId} onChange={e => setRouteId(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                ➕ Add Bus
                            </button>
                        </form>
                    </div>
                </div>

                {/* User Distribution */}
                <div className="card glass-card animate-slide-in" style={{ padding: '2rem' }}>
                    <div className="section-header">
                        <span className="section-icon">👥</span>
                        <h3 style={{ fontSize: '1.25rem' }}>System User Distribution</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {stats.users.map((u, i) => (
                            <div key={i} className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
                                <div className="icon icon-primary icon-lg" style={{ margin: '0 auto 0.75rem' }}>
                                    {u.role === 'admin' ? '👨‍💼' : u.role === 'driver' ? '🚗' : '👤'}
                                </div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    {u.role}s
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{u.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

