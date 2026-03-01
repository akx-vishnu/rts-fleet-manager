'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Car icon for active vehicle (Uber-like)
const carIcon = new L.Icon({
    iconUrl: '/car-icon.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

// Stop markers
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

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface VehicleLocation {
    vehicleId: string;
    lat: number;
    lng: number;
    driverName?: string;
    licensePlate?: string;
    tripId?: string;
}

interface SelectedTrip {
    id: string;
    route: any;
    driver: any;
    vehicle: any;
    status: string;
    type: string;
}

// Subcomponent for vehicle marker to handle auto-opening its popup
function VehicleMarker({ v, isSelected }: { v: VehicleLocation, isSelected: boolean }) {
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && markerRef.current) {
            // Small delay to ensure the map flyTo animation starts/finishes
            setTimeout(() => {
                markerRef.current?.openPopup();
            }, 500);
        }
    }, [isSelected, v.lat, v.lng]);

    return (
        <Marker
            ref={markerRef}
            position={[v.lat, v.lng] as L.LatLngExpression}
            icon={carIcon}
            zIndexOffset={isSelected ? 1000 : 0}
        >
            <Popup>
                <div className="p-2">
                    <h3 className="font-bold text-blue-600">
                        {v.licensePlate || `Vehicle ${v.vehicleId.slice(0, 8)}`}
                    </h3>
                    {v.driverName && <p className="text-sm">Driver: {v.driverName}</p>}
                    {v.tripId && <p className="text-sm text-green-600">On Trip</p>}
                    <p className="text-xs text-gray-500 mt-1">
                        📍 {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
}

// Component to fly-to the selected vehicle
function FlyToVehicle({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
}

interface LiveMapProps {
    selectedTrip?: SelectedTrip | null;
    trips?: SelectedTrip[];
}

export default function LiveMap({ selectedTrip, trips = [] }: LiveMapProps) {
    const [vehicles, setVehicles] = useState<Record<string, VehicleLocation>>({});

    // Initialize vehicles from trips when available
    useEffect(() => {
        if (trips.length > 0) {
            setVehicles(prev => {
                const updated = { ...prev };
                trips.forEach(t => {
                    const v = t.vehicle;
                    if (v && v.id && v.current_lat && v.current_lng) {
                        // Only add if not already added by WS
                        if (!updated[v.id]) {
                            updated[v.id] = {
                                vehicleId: v.id,
                                lat: v.current_lat,
                                lng: v.current_lng,
                                driverName: t.driver?.user?.name,
                                licensePlate: v.license_plate,
                                tripId: t.id
                            };
                        }
                    }
                });
                return updated;
            });
        }
    }, [trips]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('joinRoom', 'admins');
        });

        socket.on('vehicleLocation', (data: VehicleLocation) => {
            setVehicles(prev => ({
                ...prev,
                [data.vehicleId]: data
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const vehicleList = Object.values(vehicles);

    // Get route stops for the selected trip
    const selectedStops = selectedTrip?.route?.stops || [];
    const stopCoords: [number, number][] = selectedStops
        .filter((rs: any) => rs.stop?.lat && rs.stop?.lng)
        .map((rs: any) => [rs.stop.lat, rs.stop.lng] as [number, number]);

    // Find the selected vehicle
    const selectedVehicle = selectedTrip?.vehicle?.id
        ? vehicles[selectedTrip.vehicle.id]
        : null;

    // Default center: selected vehicle, or first vehicle, or Coimbatore
    const center: [number, number] = selectedVehicle
        ? [selectedVehicle.lat, selectedVehicle.lng]
        : vehicleList.length > 0
            ? [vehicleList[0].lat, vehicleList[0].lng]
            : [11.0168, 76.9558];

    return (
        <MapContainer center={center as L.LatLngExpression} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Fly to selected vehicle */}
            {selectedVehicle && (
                <FlyToVehicle lat={selectedVehicle.lat} lng={selectedVehicle.lng} />
            )}

            {/* All vehicle markers */}
            {vehicleList.map((v) => {
                const isSelected = selectedTrip?.vehicle?.id === v.vehicleId;
                return (
                    <VehicleMarker key={v.vehicleId} v={v} isSelected={isSelected} />
                );
            })}

            {/* Route stops for selected trip */}
            {selectedTrip && selectedStops.map((rs: any, index: number) => {
                if (!rs.stop?.lat || !rs.stop?.lng) return null;
                const isFirst = index === 0;
                const isLast = index === selectedStops.length - 1;
                const icon = isFirst ? pickupIcon : isLast ? dropIcon : pickupIcon;

                return (
                    <Marker
                        key={rs.id || index}
                        position={[rs.stop.lat, rs.stop.lng] as L.LatLngExpression}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold">
                                    {isFirst ? '🟢 Start: ' : isLast ? '🔴 End: ' : '📍 '}
                                    {rs.stop.name}
                                </h3>
                                <p className="text-xs text-gray-500">Stop {index + 1}</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Route path line for selected trip */}
            {selectedTrip && stopCoords.length > 1 && (
                <Polyline
                    positions={stopCoords}
                    color="#2563eb"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 6"
                />
            )}
        </MapContainer>
    );
}

