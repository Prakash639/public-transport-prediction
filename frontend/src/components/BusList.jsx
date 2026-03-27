import React from 'react';

const BusList = ({ buses, onSelectBus, selectedBusId }) => {
    if (!buses.length) return (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active fleet vehicles detected for this route.
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {buses.map((bus) => (
                <div
                    key={bus.trip_id}
                    onClick={() => onSelectBus(bus)}
                    style={{
                        padding: '1.25rem 1.5rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        transition: 'var(--transition)',
                        backgroundColor: selectedBusId === bus.trip_id ? 'var(--primary-glow)' : 'transparent',
                        borderLeft: selectedBusId === bus.trip_id ? '4px solid var(--primary)' : '4px solid transparent',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                    className="bus-item-hover"
                >
                    <div style={{ 
                        width: '44px', height: '44px', 
                        background: selectedBusId === bus.trip_id ? 'var(--primary)' : 'var(--bg-body)',
                        color: selectedBusId === bus.trip_id ? 'white' : 'var(--primary)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'var(--transition)'
                    }}>
                        🚌
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>{bus.bus_number}</span>
                            {selectedBusId === bus.trip_id && (
                                <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>TRACKING</span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600' }}>{bus.source}</span>
                            <span style={{ opacity: 0.3 }}>→</span>
                            <span style={{ fontWeight: '600' }}>{bus.destination}</span>
                        </div>
                    </div>
                    <div style={{ opacity: selectedBusId === bus.trip_id ? 1 : 0, transition: 'var(--transition)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default BusList;
