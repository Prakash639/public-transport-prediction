import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import RouteSearchForm from '../../components/RouteSearchForm';
import BusList from '../../components/BusList';
import MapTracking from '../../components/MapTracking';

const PassengerBusSearch = () => {
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null); // Independent tracking of selected route
    const [activeBuses, setActiveBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isTrackingMode, setIsTrackingMode] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const navigate = useNavigate();

    // Fetch all available routes on mount for the dropdown
    useEffect(() => {
        const fetchAllRoutes = async () => {
            try {
                setLoading(true);
                const res = await api.get('/routes');
                setRoutes(res.data);
            } catch (err) {
                console.error('Error fetching all routes:', err);
                setError('Failed to load available routes.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllRoutes();
    }, []);

    const handleSelectRoute = async (routeId) => {
        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(true);
            setSelectedRouteId(routeId);
            
            // Clear previous state
            setSelectedBus(null);
            setBusLocation(null);
            
            const res = await api.get('/trips/active', { params: { routeId } });
            setActiveBuses(res.data);
            setIsTrackingMode(true);

            if (res.data.length > 0) {
                handleSelectBus(res.data[0]);
            } else {
                console.log('No active buses for this route');
            }

            // Auto-scroll to buses section
            setTimeout(() => {
                const resultsSection = document.getElementById('search-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } catch (err) {
            console.error('Error fetching active buses:', err);
            setError('Failed to fetch active buses for this route.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBus = (bus) => {
        setSelectedBus(bus);
        // Initial fetch of location or just use current if available (live_tracking might be separate)
        // For now, let's assume we fetch latest location for this trip
        fetchBusLocation(bus.trip_id);
    };

    const fetchBusLocation = async (tripId) => {
        try {
            const res = await api.get(`/trips/${tripId}/location`);
            setBusLocation(res.data);
        } catch (err) {
            // It's possible no location data exists yet
            console.log('No location data yet');
            setBusLocation(null);
        }
    };

    // Poll for location updates if a bus is selected
    useEffect(() => {
        let interval;
        if (selectedBus) {
            fetchBusLocation(selectedBus.trip_id); // Fetch immediately
            interval = setInterval(() => {
                fetchBusLocation(selectedBus.trip_id);
            }, 5000); // Poll every 5 seconds
        }
        return () => clearInterval(interval);
    }, [selectedBus]);

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: 'calc(100vh - 74px)', overflowX: 'hidden' }}>
            {/* Background Decorations */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                right: '-5%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'fixed',
                bottom: '-5%',
                left: '-5%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div className="container" style={{ padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
                <div className="flex justify-between items-end" style={{ marginBottom: '3rem' }}>
                    <div className="animate-slide-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span className="badge badge-primary">Passenger Dashboard</span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Live Updates</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                            Where to <span style={{ color: 'var(--primary)', position: 'relative' }}>
                                Next?
                                <span style={{ position: 'absolute', bottom: '4px', left: 0, width: '100%', height: '8px', background: 'var(--primary-glow)', zIndex: -1 }}></span>
                            </span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Find and track your transit in real-time</p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        {loading && (
                            <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                <div className="spinner-sm"></div>
                                Updating...
                            </div>
                        )}
                        <button
                            className="btn"
                            style={{
                                background: 'rgba(239, 68, 68, 0.05)',
                                color: 'var(--danger)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                backdropFilter: 'blur(8px)',
                                fontSize: '0.875rem',
                                padding: '0.6rem 1.25rem'
                            }}
                            onClick={() => navigate('/passenger/report-issue', { state: { busId: selectedBus?.bus_id } })}
                        >
                            <span style={{ fontSize: '1.1rem' }}>⚠️</span> Report Issue
                        </button>
                    </div>
                </div>

                <div className="flex gap-8 flex-col lg-flex-row" style={{ alignItems: 'stretch' }}>
                    {/* Left Panel: Search & Results */}
                    <div style={{ flex: '1', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card glass-card hover-lift" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', 
                                    background: 'var(--gradient-main)', 
                                    borderRadius: '12px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>🔍</span>
                                </div>
                                <h3 style={{ fontSize: '1.4rem' }}>Plan Your Journey</h3>
                            </div>
                            <RouteSearchForm routes={routes} onRouteSelect={handleSelectRoute} loading={loading} />
                        </div>

                        {error && (
                            <div className="animate-fade-in" style={{ 
                                padding: '1rem', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: 'var(--radius)', 
                                color: 'var(--danger)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span>❌</span> {error}
                            </div>
                        )}

                        {(routes.length > 0 || isTrackingMode) && (
                            <div id="search-results" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(37,99,235,0.02)', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="status-dot active"></div>
                                            <h3 style={{ fontSize: '1.1rem' }}>Available Fleet</h3>
                                        </div>
                                    </div>
                                    <BusList
                                        buses={activeBuses}
                                        onSelectBus={handleSelectBus}
                                        selectedBusId={selectedBus?.trip_id}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!isTrackingMode && routes.length === 0 && !error && (
                            <div className="info-card animate-pulse" style={{ background: 'rgba(37,99,235,0.03)', border: '1px dashed var(--primary)', textAlign: 'center', padding: '2rem' }}>
                                <p style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: '500' }}>
                                    {!searchPerformed ? 
                                        "Enter your origin and destination above to see real-time bus availability." : 
                                        "No active routes found for this search. Please try different keywords."
                                    }
                                </p>
                            </div>
                        )}
                        
                        {!isTrackingMode && routes.length === 0 && !error && !loading && searchPerformed && (
                           <div style={{ padding: '1rem', textAlign: 'center' }}>
                               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                   {/* Extra space for visual balance when no results */}
                               </p>
                           </div>
                        )}
                    </div>

                    {/* Right Panel: Map & Tracking */}
                    <div style={{ flex: '2', minWidth: '400px' }}>
                        <div className="card glass-card" style={{ 
                            padding: '0', 
                            overflow: 'hidden', 
                            height: '100%', 
                            minHeight: '650px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            boxShadow: 'var(--shadow-xl)',
                            border: '1px solid rgba(255,255,255,0.6)'
                        }}>
                            {isTrackingMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{
                                        padding: '1.25rem 2rem',
                                        background: 'rgba(255,255,255,0.9)',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Live Tracking</span>
                                                {selectedBus && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>#{selectedBus.bus_number}</span>}
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                                {selectedBus ? `${selectedBus.source} → ${selectedBus.destination}` : 'Awaiting Vehicle Selection'}
                                            </h4>
                                        </div>
                                        
                                        <div style={{ textAlign: 'right' }}>
                                            {busLocation ? (
                                                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <span className="text-success font-bold" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <span className="status-dot active"></span> Signal Strong
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated just now</span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="spinner-sm" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }}></div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connecting...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={{ flex: 1, position: 'relative', background: '#e5e7eb', minHeight: '550px' }}>
                                        <MapTracking busLocation={busLocation} selectedBus={selectedBus} />
                                        
                                        {!selectedBus && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'rgba(255,255,255,0.85)',
                                                backdropFilter: 'blur(4px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                textAlign: 'center',
                                                padding: '3rem'
                                            }}>
                                                <div className="card" style={{ maxWidth: '320px', boxShadow: 'var(--shadow-lg)' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
                                                    <h3 style={{ marginBottom: '0.75rem' }}>No active buses</h3>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                        There are currently no active vehicles on this route. Please check back shortly or try a different route.
                                                    </p>
                                                    <button className="btn btn-outline w-full mt-6" onClick={() => setIsTrackingMode(false)}>
                                                        Reset Search
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Overlay Info Card */}
                                        {selectedBus && busLocation && (
                                            <div className="animate-slide-in" style={{
                                                position: 'absolute',
                                                bottom: '2rem',
                                                left: '2rem',
                                                zIndex: 10,
                                                width: '280px'
                                            }}>
                                                <div className="card glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.8)' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div className="icon icon-primary" style={{ borderRadius: '10px' }}>🚌</div>
                                                        <div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Vehicle Info</div>
                                                            <div style={{ fontSize: '1rem', fontWeight: '800' }}>{selectedBus.bus_number}</div>
                                                        </div>
                                                    </div>
                                                    <div className="divider" style={{ margin: '1rem 0', opacity: 0.5 }}></div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>LATITUDE</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>{Number(busLocation.latitude).toFixed(4)}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>LONGITUDE</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>{Number(busLocation.longitude).toFixed(4)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center', position: 'relative' }}>
                                    <div style={{
                                        width: '120px', height: '120px',
                                        background: 'var(--bg-body)',
                                        borderRadius: '32px',
                                        marginBottom: '2rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '3.5rem',
                                        boxShadow: 'var(--shadow-md)',
                                        transform: 'rotate(-5deg)'
                                    }}>📍</div>
                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '800' }}>Interactive Transit Map</h2>
                                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                        Complete the search to unlock live GPS satellite tracking of the entire active fleet.
                                    </p>
                                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                                        <span className="badge badge-outline">Live GPS</span>
                                        <span className="badge badge-outline">Real-time ETA</span>
                                        <span className="badge badge-outline">Fleet Status</span>
                                    </div>
                                    
                                    {/* Abstract Map Background Illustration */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0.03,
                                        zIndex: -1,
                                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                                    }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PassengerBusSearch;
