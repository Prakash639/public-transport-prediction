import React, { useState } from 'react';

const RouteSearchForm = ({ routes, onRouteSelect, loading }) => {
    const [selectedId, setSelectedId] = useState('');

    const handleChange = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        if (id) {
            onRouteSelect(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: '0' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🗺️</span> Select Your Route
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedId}
                        onChange={handleChange}
                        className="input-field"
                        style={{ 
                            background: 'rgba(255,255,255,0.7)', 
                            border: '2px solid var(--border)',
                            appearance: 'none',
                            paddingRight: '2.5rem',
                            fontWeight: '600',
                            color: 'var(--text-main)',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                    >
                        <option value="">{loading ? 'Loading routes...' : '-- Choose a Route --'}</option>
                        {routes.map(route => (
                            <option key={route.route_id} value={route.route_id}>
                                {route.source} ➔ {route.destination}
                            </option>
                        ))}
                    </select>
                    <div style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--text-muted)'
                    }}>
                        ▼
                    </div>
                </div>
            </div>
            
            {selectedId && (
                <div className="animate-fade-in" style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--primary)', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    <span className="status-dot active"></span>
                    Route selected. Fetching live buses...
                </div>
            )}
        </div>
    );
};

export default RouteSearchForm;
