'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const vehicleIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const completedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface VehicleLocation {
    vehicleId: string;
    lat: number;
    lng: number;
    driverName?: string;
    licensePlate?: string;
    tripId?: string;
}

interface BoardingEvent {
    tripId: string;
    boardingLog: any;
    location: { lat: number; lng: number };
}

interface Stop {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'pickup' | 'drop';
    employeeCount: number;
    boarded: number;
}

export default function LiveMap() {
    const [vehicles, setVehicles] = useState<Record<string, VehicleLocation>>({});
    const [stops, setStops] = useState<Stop[]>([]);
    const [boardingEvents, setBoardingEvents] = useState<BoardingEvent[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('joinRoom', 'admins');
        });

        // Listen for vehicle location updates
        socket.on('vehicleLocation', (data: VehicleLocation) => {
            setVehicles(prev => ({
                ...prev,
                [data.vehicleId]: data
            }));
        });

        // Listen for employee boarding events
        socket.on('employeeBoarding', (data: BoardingEvent) => {
            console.log('Employee boarding event:', data);
            setBoardingEvents(prev => [...prev, data]);

            // Update stop status
            setStops(prev => prev.map(stop => {
                if (stop.id === data.boardingLog.stop_id) {
                    return {
                        ...stop,
                        boarded: stop.boarded + 1
                    };
                }
                return stop;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const vehicleList = Object.values(vehicles);

    // Default center to Coimbatore, India
    const center: [number, number] = vehicleList.length > 0
        ? [vehicleList[0].lat, vehicleList[0].lng]
        : [11.0168, 76.9558]; // Coimbatore coordinates

    return (
        <MapContainer center={center as L.LatLngExpression} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Vehicle Markers */}
            {vehicleList.map((v) => (
                <Marker key={v.vehicleId} position={[v.lat, v.lng] as L.LatLngExpression} icon={vehicleIcon}>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-blue-600">Vehicle: {v.vehicleId}</h3>
                            {v.driverName && <p className="text-sm">Driver: {v.driverName}</p>}
                            {v.licensePlate && <p className="text-sm">Plate: {v.licensePlate}</p>}
                            {v.tripId && <p className="text-sm text-green-600">Trip ID: {v.tripId}</p>}
                            <p className="text-xs text-gray-500 mt-1">
                                📍 {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Stop Markers */}
            {stops.map((stop) => {
                const icon = stop.type === 'pickup' ? pickupIcon :
                    stop.boarded === stop.employeeCount ? completedIcon : dropIcon;

                return (
                    <Marker key={stop.id} position={[stop.lat, stop.lng] as L.LatLngExpression} icon={icon}>
                        <Popup>
                            <div className="p-2">
                                <h3 className={`font-bold ${stop.type === 'pickup' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stop.type === 'pickup' ? '🟢' : '🔴'} {stop.name}
                                </h3>
                                <p className="text-sm">Type: {stop.type.toUpperCase()}</p>
                                <p className="text-sm">Employees: {stop.boarded} / {stop.employeeCount}</p>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${(stop.boarded / stop.employeeCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Recent boarding event markers */}
            {boardingEvents.slice(-10).map((event, idx) => (
                <Marker
                    key={`boarding-${idx}`}
                    position={[event.location.lat, event.location.lng] as L.LatLngExpression}
                >
                    <Popup>
                        <div className="p-2">
                            <p className="font-bold">✅ Boarding Event</p>
                            <p className="text-xs text-gray-500">
                                Trip: {event.tripId}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
