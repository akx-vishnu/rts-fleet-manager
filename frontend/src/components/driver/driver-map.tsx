'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useEffect } from 'react';
import L from 'leaflet';

interface DriverMapProps {
    routePoints: [number, number][]; // [lat, lng] array
    currentLocation?: [number, number];
    stops: any[];
    currentStopId?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15); // Zoom level 15 for better view
        }
    }, [center, map]);
    return null;
}

export default function DriverMap({ routePoints, currentLocation, stops, currentStopId }: DriverMapProps) {
    // Default center to Coimbatore, India
    const coimbatoreCenter: [number, number] = [11.0168, 76.9558];
    const defaultCenter: [number, number] = currentLocation || (routePoints.length > 0 ? routePoints[0] : coimbatoreCenter);

    const vehicleIcon = L.divIcon({
        className: 'vehicle-icon',
        html: `<div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

    const stopIcon = (isNext: boolean, isCompleted: boolean) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${isNext ? '#3b82f6' : isCompleted ? '#22c55e' : '#9ca3af'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });

    return (
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route Line */}
            {routePoints.length > 1 && (
                <Polyline positions={routePoints} color="#3b82f6" weight={4} opacity={0.7} />
            )}

            {/* Stops */}
            {stops.map((stop, index) => {
                // Determine status based on currentStopId/logic passing from parent
                // For now simplistic: if index < currentStopIndex -> completed
                // We need to know current stop index to color correctly.
                // Assuming parent passes stops in order.
                const isNext = stop.id === currentStopId;
                const isCompleted = false; // Logic needed

                return (
                    <Marker key={stop.id} position={[stop.stop.lat, stop.stop.lng]} icon={stopIcon(isNext, isCompleted)}>
                        <Popup>{stop.stop.name}</Popup>
                    </Marker>
                )
            })}

            {/* Current Vehicle Location */}
            {currentLocation && (
                <>
                    <Marker position={currentLocation} icon={vehicleIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                    <MapUpdater center={currentLocation} />
                </>
            )}
        </MapContainer>
    );
}
