'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { Bus, User, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';
import io from 'socket.io-client';

// Dynamically import LiveMap with SSR disabled
const LiveMap = dynamic(() => import('@/components/map/live-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

interface Trip {
    id: string;
    route: any;
    driver: any;
    vehicle: any;
    status: string;
    type: string;
    start_time: string;
    boardingLogs?: any[];
}

export default function TrackingPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    useEffect(() => {
        loadTrips();

        // Connect to WebSocket for real-time updates
        const socket = io('http://localhost:3000');

        socket.on('employeeBoarding', (data) => {
            console.log('Employee boarding event:', data);
            // Reload trips to get updated boarding data
            loadTrips();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const loadTrips = async () => {
        try {
            const res = await api.get('/trips');
            const activeTrips = res.data.filter((trip: Trip) =>
                trip.status === 'ongoing' || trip.status === 'scheduled'
            );

            // Load boarding logs for each trip
            const tripsWithBoarding = await Promise.all(
                activeTrips.map(async (trip: Trip) => {
                    try {
                        const boardingRes = await api.get(`/trips/${trip.id}/boarding`);
                        return { ...trip, boardingLogs: boardingRes.data };
                    } catch (error) {
                        return { ...trip, boardingLogs: [] };
                    }
                })
            );

            setTrips(tripsWithBoarding);
        } catch (error) {
            console.error('Failed to load trips', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ongoing':
                return 'bg-blue-100 text-blue-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getBoardingStats = (trip: Trip) => {
        if (!trip.boardingLogs || trip.boardingLogs.length === 0) {
            return { total: 0, boarded: 0, missed: 0, pending: 0 };
        }

        const total = trip.boardingLogs.length;
        const boarded = trip.boardingLogs.filter((log: any) => log.status === 'boarded').length;
        const missed = trip.boardingLogs.filter((log: any) => log.status === 'missed' || log.status === 'no_show').length;
        const pending = total - boarded - missed;

        return { total, boarded, missed, pending };
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Live Tracking</h2>
                <p className="text-muted-foreground">Monitor vehicle locations and employee boarding in real-time.</p>
            </div>

            <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
                {/* Left Panel - Trip Details */}
                <div className="col-span-2">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Active Trips</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full px-6 pb-6">
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading trips...</div>
                                ) : trips.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Bus className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                        <p>No active trips</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {trips.map((trip) => {
                                            const stats = getBoardingStats(trip);
                                            return (
                                                <Card
                                                    key={trip.id}
                                                    className={`cursor-pointer transition-all ${selectedTripId === trip.id ? 'ring-2 ring-primary' : ''
                                                        }`}
                                                    onClick={() => setSelectedTripId(trip.id)}
                                                >
                                                    <CardContent className="p-4 space-y-3">
                                                        {/* Trip Header */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Bus className="h-5 w-5 text-blue-600" />
                                                                <div>
                                                                    <p className="font-semibold">Trip #{trip.id.slice(0, 8)}</p>
                                                                    <p className="text-sm text-muted-foreground capitalize">{trip.type} Trip</p>
                                                                </div>
                                                            </div>
                                                            <Badge className={getStatusColor(trip.status)}>
                                                                {trip.status}
                                                            </Badge>
                                                        </div>

                                                        {/* Route Info */}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{trip.route?.name || 'Unknown Route'}</span>
                                                        </div>

                                                        {/* Vehicle & Driver */}
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">Vehicle</p>
                                                                <p className="font-medium">{trip.vehicle?.license_plate || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Driver</p>
                                                                <p className="font-medium">{trip.driver?.user?.name || 'N/A'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Boarding Stats */}
                                                        <div className="pt-2 border-t">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">Boarding Progress</span>
                                                                <span className="text-sm font-semibold text-blue-600">
                                                                    {stats.boarded}/{stats.total}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-4 text-xs">
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    <span>{stats.boarded} Boarded</span>
                                                                </div>
                                                                {stats.missed > 0 && (
                                                                    <div className="flex items-center gap-1 text-red-600">
                                                                        <XCircle className="h-3 w-3" />
                                                                        <span>{stats.missed} Missed</span>
                                                                    </div>
                                                                )}
                                                                {stats.pending > 0 && (
                                                                    <div className="flex items-center gap-1 text-yellow-600">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{stats.pending} Pending</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Map */}
                <div className="col-span-3">
                    <Card className="h-full overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle>Fleet Map</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[calc(100%-4rem)]">
                            <LiveMap />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
