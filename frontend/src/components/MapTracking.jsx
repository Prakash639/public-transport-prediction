import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Style defined OUTSIDE component for stable reference
const MAP_STYLE = {
    version: 8,
    sources: {
        "osm": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors"
        }
    },
    layers: [
        {
            id: "osm",
            type: "raster",
            source: "osm"
        }
    ]
};

const isValidCoord = (lat, lng) => {
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    return Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
};

// OSRM route-fetching utility
const fetchOSRMRoute = async (srcLng, srcLat, destLng, destLat, signal) => {
    // URL with extra parameters for better accuracy and shortest path
    const url = `https://router.project-osrm.org/route/v1/driving/${srcLng},${srcLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=false`;
    
    console.log(`[MapTracking] Fetching OSRM route: ${srcLng},${srcLat} -> ${destLng},${destLat}`);
    
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();
    
    console.log('[MapTracking] OSRM API Response:', data);
    
    if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('No valid route found in OSRM response');
    }
    
    const route = data.routes[0];
    return {
        geometry: route.geometry,                    // GeoJSON LineString
        distance: (route.distance / 1000).toFixed(1), // km
        duration: Math.round(route.duration / 60),     // minutes
    };
};

const MapTracking = ({ busLocation, selectedBus }) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const [hasFittedBounds, setHasFittedBounds] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // OSRM route state
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);       // { distance, duration }
    const [routeError, setRouteError] = useState(false);

    // Parse coordinates
    const position = useMemo(() => {
        if (!busLocation) return null;
        if (!isValidCoord(busLocation.latitude, busLocation.longitude)) return null;
        return { latitude: parseFloat(busLocation.latitude), longitude: parseFloat(busLocation.longitude) };
    }, [busLocation]);

    const sourcePos = useMemo(() => {
        if (!selectedBus) return null;
        if (!isValidCoord(selectedBus.start_lat, selectedBus.start_lng)) return null;
        return { latitude: parseFloat(selectedBus.start_lat), longitude: parseFloat(selectedBus.start_lng) };
    }, [selectedBus]);

    const destPos = useMemo(() => {
        if (!selectedBus) return null;
        if (!isValidCoord(selectedBus.dest_lat, selectedBus.dest_lng)) return null;
        return { latitude: parseFloat(selectedBus.dest_lat), longitude: parseFloat(selectedBus.dest_lng) };
    }, [selectedBus]);

    // Compute initial center based on available data
    const initialViewState = useMemo(() => {
        if (sourcePos) return { latitude: sourcePos.latitude, longitude: sourcePos.longitude, zoom: 12 };
        return { latitude: 12.9716, longitude: 77.5946, zoom: 12 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset bounds & route when trip changes
    useEffect(() => {
        setHasFittedBounds(false);
        setRouteGeoJSON(null);
        setRouteInfo(null);
        setRouteError(false);
    }, [selectedBus?.trip_id]);

    // ─── Fetch OSRM road route ───────────────────────────────────────
    useEffect(() => {
        if (!sourcePos || !destPos) return;

        // Strict boundary check for coordinates
        if (!isValidCoord(sourcePos.latitude, sourcePos.longitude) || 
            !isValidCoord(destPos.latitude, destPos.longitude)) {
            console.error('[MapTracking] Invalid coordinates for routing');
            return;
        }

        const abortCtrl = new AbortController();

        fetchOSRMRoute(
            sourcePos.longitude, sourcePos.latitude,  // Longitude FIRST
            destPos.longitude, destPos.latitude,      // Longitude FIRST
            abortCtrl.signal
        )
            .then((result) => {
                const geojson = {
                    type: 'Feature',
                    geometry: result.geometry,
                };
                setRouteGeoJSON(geojson);
                setRouteInfo({ distance: result.distance, duration: result.duration });
                setRouteError(false);
                console.log('[MapTracking] OSRM route loaded:', result.distance, 'km,', result.duration, 'min');
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                console.warn('[MapTracking] OSRM fetch failed:', err.message);
                setRouteError(true);
                setRouteInfo(null);
            });

        return () => abortCtrl.abort();
    }, [sourcePos, destPos]);

    // Straight-line fallback GeoJSON (ONLY used when OSRM fails)
    const fallbackRoute = useMemo(() => {
        if (!sourcePos || !destPos) return null;
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [sourcePos.longitude, sourcePos.latitude],
                    [destPos.longitude, destPos.latitude]
                ]
            }
        };
    }, [sourcePos, destPos]);

    // Route data selection: OSRM route is priority, straight-line only on crash
    const routeData = routeGeoJSON || (routeError ? fallbackRoute : null);

    // ─── Fit bounds once per trip (uses every point in the route) ────
    useEffect(() => {
        if (!mapReady || !mapRef.current || hasFittedBounds) return;
        if (!routeData && !sourcePos && !destPos && !position) return;

        const bounds = new maplibregl.LngLatBounds();
        let hasPoints = false;

        // Extend bounds with the FULL path if available
        if (routeData?.geometry?.coordinates?.length) {
            routeData.geometry.coordinates.forEach(([lng, lat]) => {
                bounds.extend([lng, lat]);
            });
            hasPoints = true;
        } else {
            // Fallback points for bounds if no full route yet
            if (sourcePos) { bounds.extend([sourcePos.longitude, sourcePos.latitude]); hasPoints = true; }
            if (destPos) { bounds.extend([destPos.longitude, destPos.latitude]); hasPoints = true; }
        }

        if (position) { bounds.extend([position.longitude, position.latitude]); hasPoints = true; }

        if (hasPoints && !bounds.isEmpty()) {
            setTimeout(() => {
                try {
                    mapRef.current?.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 14 });
                    setHasFittedBounds(true);
                } catch (e) {
                    console.error('[MapTracking] fitBounds error:', e);
                }
            }, 300);
        }
    }, [sourcePos, destPos, position, hasFittedBounds, mapReady, routeData]);

    // Force resize after mount and on window resize
    useEffect(() => {
        const doResize = () => {
            if (mapRef.current) {
                try { mapRef.current.resize(); } catch (e) { /* ignore */ }
            }
        };

        // Resize on mount after a short delay
        const t1 = setTimeout(doResize, 200);
        const t2 = setTimeout(doResize, 500);
        const t3 = setTimeout(doResize, 1500);

        window.addEventListener('resize', doResize);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener('resize', doResize);
        };
    }, [mapReady]);

    const handleMapLoad = useCallback((evt) => {
        console.log('[MapTracking] Map loaded successfully');
        setMapReady(true);
        // Force multiple resizes to handle delayed layout
        setTimeout(() => evt.target?.resize(), 100);
        setTimeout(() => evt.target?.resize(), 500);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                borderRadius: '12px',
                overflow: 'hidden',
                width: '100%',
                height: '600px',      // FIXED PIXEL HEIGHT - not percentage
                position: 'relative'
            }}
        >
            <Map
                initialViewState={initialViewState}
                ref={mapRef}
                mapLib={maplibregl}
                style={{ width: '100%', height: '600px' }}  // FIXED PIXEL HEIGHT
                mapStyle={MAP_STYLE}
                onLoad={handleMapLoad}
                onError={(e) => console.error('[MapTracking] Error:', e)}
            >
                <NavigationControl position="top-right" />

                {/* Route Path (OSRM road route or straight-line fallback) */}
                {routeData && (
                    <Source id="route-path" type="geojson" data={routeData}>
                        <Layer
                            id="route-layer-outline"
                            type="line"
                            paint={{
                                'line-color': '#1e40af',
                                'line-width': 8,
                                'line-opacity': 0.3
                            }}
                            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        />
                        <Layer
                            id="route-layer"
                            type="line"
                            paint={{
                                'line-color': '#3b82f6',
                                'line-width': 5,
                                'line-opacity': 0.9
                            }}
                            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        />
                    </Source>
                )}

                {/* Source Marker */}
                {sourcePos && (
                    <Marker latitude={sourcePos.latitude} longitude={sourcePos.longitude} anchor="bottom">
                        <div style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '2px solid white'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>🏠</span>
                            <span>Start</span>
                        </div>
                    </Marker>
                )}

                {/* Destination Marker */}
                {destPos && (
                    <Marker latitude={destPos.latitude} longitude={destPos.longitude} anchor="bottom">
                        <div style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '2px solid white'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>🏁</span>
                            <span>End</span>
                        </div>
                    </Marker>
                )}

                {/* Bus Marker */}
                {position && (
                    <Marker
                        latitude={position.latitude}
                        longitude={position.longitude}
                        anchor="bottom"
                    >
                        <div style={{
                            background: 'var(--primary, #2563eb)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '16px',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '2px solid white',
                            transform: 'translateY(-8px)',
                            transition: 'all 0.4s ease'
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>🚌</span>
                            <span>LIVE</span>
                        </div>
                    </Marker>
                )}
            </Map>

            {/* Route Info Overlay */}
            {routeInfo && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    zIndex: 10,
                    border: '1px solid rgba(0,0,0,0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>📏</span>
                        <span>{routeInfo.distance} km</span>
                    </div>
                    <div style={{ width: '1px', height: '18px', background: '#cbd5e1' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>⏱️</span>
                        <span>{routeInfo.duration} min</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(MapTracking);
