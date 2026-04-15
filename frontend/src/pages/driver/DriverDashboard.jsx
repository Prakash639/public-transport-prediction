import { useState, useEffect } from 'react';
import api from '../../api/axios';
import MapTracking from '../../components/MapTracking';

const DriverDashboard = () => {
    const [activeTrip, setActiveTrip] = useState(null);
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active Trips List states
    const [allActiveTrips, setAllActiveTrips] = useState([]);
    const [loadingActive, setLoadingActive] = useState(false);
    const [endingTripId, setEndingTripId] = useState(null);

    // Tracking states
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [trackingError, setTrackingError] = useState('');
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Auto-fetch location when dashboard loads and there's no active trip
    useEffect(() => {
        if (!activeTrip && !currentLocation && !fetchingLocation) {
            fetchInitialLocation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTrip]);

    const getAccurateLocation = (maxRetries = 3) => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const attemptFetch = () => {
                attempts++;
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const accuracy = position.coords.accuracy;
                        if (accuracy <= 100) {
                            resolve(position);
                        } else {
                            if (attempts < maxRetries) {
                                setTrackingError(`Accuracy low (${Math.round(accuracy)}m). Fetching high-accuracy GPS location... (Attempt ${attempts + 1}/${maxRetries})`);
                                setTimeout(attemptFetch, 2000);
                            } else {
                                reject(new Error("Please move outdoors for better GPS signal. Enable High Accuracy Mode in device location settings."));
                            }
                        }
                    },
                    (error) => {
                        if (attempts < maxRetries) {
                            setTrackingError(`Fetching high-accuracy GPS location... (Attempt ${attempts + 1}/${maxRetries})`);
                            setTimeout(attemptFetch, 2000);
                        } else {
                            let msg = "Location access is required.";
                            if (error.code === 1) msg = "Location permission denied. Enable High Accuracy Mode in device location settings.";
                            if (error.code === 2) msg = "Please move outdoors for better GPS signal. Enable High Accuracy Mode in device location settings.";
                            if (error.code === 3) msg = "Timeout. Please move outdoors for better GPS signal.";
                            reject(new Error(msg));
                        }
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            };
            
            attemptFetch();
        });
    };

    const fetchInitialLocation = async () => {
        if (!navigator.geolocation) {
            setTrackingError("Geolocation is not supported. Cannot start trip without location.");
            return;
        }

        setFetchingLocation(true);
        setTrackingError('Fetching high-accuracy GPS location...');

        try {
            const position = await getAccurateLocation(3);
            setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            setTrackingError('');
            setFetchingLocation(false);
        } catch (error) {
            console.error("Initial location error:", error);
            setTrackingError(error.message);
            setFetchingLocation(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [busRes, routeRes] = await Promise.all([
                api.get('/buses'),
                api.get('/routes')
            ]);
            setBuses(busRes.data);
            setRoutes(routeRes.data);
            await fetchAllActiveTrips();
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllActiveTrips = async () => {
        setLoadingActive(true);
        try {
            const res = await api.get('/trips/active');
            setAllActiveTrips(res.data);
        } catch (error) {
            console.error("Error fetching active trips:", error);
        } finally {
            setLoadingActive(false);
        }
    };

    // Continuous Tracking Logic
    useEffect(() => {
        let intervalId;
        if (activeTrip && isTracking) {
            fetchAndUpdateLocation();
            
            intervalId = setInterval(() => {
                fetchAndUpdateLocation();
            }, 10000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTrip, isTracking]);

    const fetchAndUpdateLocation = async () => {
        if (!navigator.geolocation) {
            setTrackingError("Geolocation is not supported by your browser.");
            setIsTracking(false);
            return;
        }

        try {
            const position = await getAccurateLocation(2);
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            setTrackingError('');
            
            if (activeTrip) {
                await api.post(`/trips/${activeTrip.trip_id}/location`, {
                    latitude,
                    longitude
                });
            }
        } catch (error) {
            console.error('Geolocation error:', error);
            setTrackingError(error.message);
        }
    };

    const startTrip = async () => {
        if (!selectedBus || !selectedRoute) return;

        if (currentLocation) {
            startTripWithLocation(currentLocation.latitude, currentLocation.longitude);
            return;
        }

        if (!navigator.geolocation) {
            alert("Geolocation is not supported. Cannot start trip without location.");
            return;
        }

        setLoading(true);
        setTrackingError('Fetching high-accuracy GPS location...');
        try {
            const position = await getAccurateLocation(3);
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            setTrackingError('');
            startTripWithLocation(latitude, longitude);
        } catch (error) {
            console.error('Geolocation error:', error);
            setLoading(false);
            setTrackingError(error.message);
            alert(`Error fetching start location: ${error.message}`);
        }
    };

    const startTripWithLocation = async (latitude, longitude) => {
        setLoading(true);
        try {
            const res = await api.post('/trips', { 
                bus_id: selectedBus, 
                route_id: selectedRoute,
                start_lat: latitude,
                start_lng: longitude
            });
            setActiveTrip({ trip_id: res.data.tripId, bus_id: selectedBus, route_id: selectedRoute });
            setIsTracking(true);
            setLoading(false);
            fetchAllActiveTrips();
        } catch (error) {
            console.error('Error starting trip', error);
            setLoading(false);
            alert('Failed to start trip on server');
        }
    };

    const endTrip = async () => {
        if (!activeTrip) return;
        try {
            await api.put(`/trips/${activeTrip.trip_id}/end`);
            setActiveTrip(null);
            setIsTracking(false);
            setCurrentLocation(null);
            fetchInitialLocation(); 
            fetchAllActiveTrips();
        } catch (error) {
            console.error('Error ending trip', error);
        }
    };

    const handleEndSpecificTrip = async (tripId) => {
        if (!window.confirm("Are you sure you want to end this trip?")) return;
        
        setEndingTripId(tripId);
        try {
            await api.put(`/trips/${tripId}/end`);
            
            if (activeTrip && activeTrip.trip_id === tripId) {
                setActiveTrip(null);
                setIsTracking(false);
                setCurrentLocation(null);
                fetchInitialLocation();
            }
            
            setTimeout(() => {
                setAllActiveTrips(prev => prev.filter(t => t.trip_id !== tripId));
                setEndingTripId(null);
            }, 500);
        } catch (error) {
            console.error('Error ending trip', error);
            setEndingTripId(null);
            alert("Failed to end trip");
        }
    };

    const toggleTracking = () => {
        setIsTracking(!isTracking);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
            <div className="spinner"></div>
        </div>
    );

    // Compute active route data for map if available
    let activeRouteData = null;
    let activeBusData = null;
    if (activeTrip && routes.length > 0 && buses.length > 0) {
        const routeObj = routes.find(r => r.route_id === activeTrip.route_id);
        if (routeObj) {
            activeRouteData = routeObj;
        }
        activeBusData = buses.find(b => b.bus_id === activeTrip.bus_id);
    }
    
    const combinedMapData = activeRouteData && activeBusData ? {
        bus_id: activeBusData.bus_id,
        trip_id: activeTrip.trip_id,
        start_lat: currentLocation ? currentLocation.latitude : activeRouteData.source_lat,
        start_lng: currentLocation ? currentLocation.longitude : activeRouteData.source_lng,
        dest_lat: activeRouteData.dest_lat,
        dest_lng: activeRouteData.dest_lng 
    } : null;

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1000px' }}>
                {/* Header */}
                <div className="animate-fade-in" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: '800',
                        background: 'var(--gradient-main)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        🚗 Driver Console
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Manage your trips and update real-time location automatically
                    </p>
                </div>

                {activeTrip ? (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {/* Left Column: Controls and Status */}
                            <div className="card glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div className="icon icon-lg" style={{
                                    margin: '0 auto 1.5rem',
                                    background: 'var(--gradient-success)',
                                    width: '80px',
                                    height: '80px',
                                    fontSize: '2.5rem',
                                    animation: isTracking ? 'pulse 2s infinite' : 'none',
                                    opacity: isTracking ? 1 : 0.7
                                }}>
                                    {isTracking ? '📡' : '⏸️'}
                                </div>

                                <h2 style={{ color: isTracking ? 'var(--success)' : 'var(--warning)', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    {isTracking ? 'Live Tracking Active' : 'Tracking Paused'}
                                </h2>

                                <div className="info-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Trip ID</span>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>#{activeTrip.trip_id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bus</span>
                                        <span style={{ fontWeight: '700' }}>🚌 {activeBusData ? activeBusData.bus_number : activeTrip.bus_id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Location</span>
                                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                            {currentLocation ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}` : 'Waiting...'}
                                        </span>
                                    </div>
                                    {trackingError && (
                                        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                                            ❌ {trackingError}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 justify-center" style={{ flexWrap: 'wrap' }}>
                                    <button onClick={toggleTracking} className="btn" style={{ 
                                        padding: '0.75rem 1.5rem', 
                                        fontSize: '0.95rem',
                                        background: isTracking ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary)',
                                        color: isTracking ? 'var(--warning)' : 'white',
                                        border: isTracking ? '2px solid var(--warning)' : 'none'
                                    }}>
                                        {isTracking ? '⏸️ Pause Tracking' : '▶️ Resume Tracking'}
                                    </button>
                                    <button onClick={endTrip} className="btn" style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '0.95rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--danger)',
                                        border: '2px solid var(--danger)'
                                    }}>
                                        🛑 End Trip
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Live Map */}
                            <div className="card glass-card" style={{ overflow: 'hidden', padding: '0' }}>
                                <div style={{ height: '100%', minHeight: '400px', width: '100%' }}>
                                    <MapTracking 
                                        busLocation={currentLocation} 
                                        selectedBus={combinedMapData} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card glass-card animate-fade-in" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="section-header" style={{ border: 'none', paddingBottom: '0.5rem' }}>
                            <span className="section-icon">🚀</span>
                            <h3 style={{ fontSize: '1.5rem' }}>Start a New Trip</h3>
                        </div>

                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Select a bus and route to begin your journey. Location tracking will start automatically.
                        </p>

                        <div className="flex flex-col gap-4">
                            {/* Device Location Display */}
                            <div className="input-group" style={{ textAlign: 'left' }}>
                                <label className="input-label">📍 Device Location</label>
                                {fetchingLocation ? (
                                    <div style={{ padding: '0.75rem', background: 'rgba(249, 115, 22, 0.08)', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                        Fetching your real-time GPS location...
                                    </div>
                                ) : currentLocation ? (
                                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--success)' }}>
                                        ✅ Location acquired: <strong>{currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}</strong>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button onClick={fetchInitialLocation} className="btn" style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            fontSize: '0.9rem', 
                                            background: 'rgba(239, 68, 68, 0.1)', 
                                            color: 'var(--danger)', 
                                            border: '1px solid var(--danger)' 
                                        }}>
                                            ⚠️ Location Missing - Click to Try Again
                                        </button>
                                        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>
                                            {trackingError || "Location access is required to start the trip"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">🚌 Select Bus</label>
                                <select
                                    className="input-field"
                                    value={selectedBus}
                                    onChange={e => setSelectedBus(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="">Choose a bus...</option>
                                    {buses.map(b => (
                                        <option key={b.bus_id} value={b.bus_id}>{b.bus_number}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">🛣️ Select Route</label>
                                <select
                                    className="input-field"
                                    value={selectedRoute}
                                    onChange={e => setSelectedRoute(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="">Choose a route...</option>
                                    {routes.map(r => (
                                        <option key={r.route_id} value={r.route_id}>
                                            {r.source} → {r.destination}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={startTrip}
                                className="btn btn-primary"
                                disabled={!selectedBus || !selectedRoute || !currentLocation}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    marginTop: '1rem',
                                    opacity: (!selectedBus || !selectedRoute || !currentLocation) ? 0.5 : 1,
                                    cursor: (!selectedBus || !selectedRoute || !currentLocation) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                🚀 Start Trip & Tracking
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Trips Section */}
                <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
                    <div className="section-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="section-icon">🔥</span>
                            <h2 style={{ fontSize: '1.5rem' }}>Active Trips</h2>
                        </div>
                        <button 
                            onClick={fetchAllActiveTrips} 
                            className="btn btn-outline" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            disabled={loadingActive}
                        >
                            {loadingActive ? 'Refreshing...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {loadingActive && allActiveTrips.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching active trips...</p>
                        </div>
                    ) : allActiveTrips.length === 0 ? (
                        <div className="card glass-card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed', borderWidth: '2px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <h3 style={{ color: 'var(--text-muted)' }}>No Active Trips Found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All buses are currently idle.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {allActiveTrips.map((trip) => (
                                <div 
                                    key={trip.trip_id} 
                                    className={`card glass-card hover-lift ${endingTripId === trip.trip_id ? 'animate-fade-out' : ''}`}
                                    style={{ 
                                        padding: '1.5rem', 
                                        borderLeft: '4px solid var(--primary)',
                                        opacity: endingTripId === trip.trip_id ? 0 : 1,
                                        transition: 'all 0.5s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🚌 {trip.bus_number}</h4>
                                            <div className="badge badge-success">
                                                <span className="status-dot active"></span>
                                                Active
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trip ID</div>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>#{trip.trip_id}</div>
                                        </div>
                                    </div>

                                    <div className="info-card" style={{ background: 'var(--bg-body)', border: 'none', marginBottom: '1.5rem' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Route</div>
                                            <div style={{ fontWeight: '600' }}>{trip.source} → {trip.destination}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Started At</div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                                {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                    ({new Date(trip.start_time).toLocaleDateString()})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleEndSpecificTrip(trip.trip_id)}
                                        className="btn"
                                        disabled={endingTripId === trip.trip_id}
                                        style={{ 
                                            width: '100%', 
                                            background: 'rgba(239, 68, 68, 0.1)', 
                                            color: 'var(--danger)', 
                                            border: '1px solid var(--danger)',
                                            padding: '0.6rem'
                                        }}
                                    >
                                        {endingTripId === trip.trip_id ? 'Ending...' : '🛑 End Trip'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Injected Animations */}
            <style>
                {`
                    @keyframes fadeOut {
                        from { opacity: 1; transform: scale(1); }
                        to { opacity: 0; transform: scale(0.95); }
                    }
                    .animate-fade-out {
                        animation: fadeOut 0.5s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default DriverDashboard;
