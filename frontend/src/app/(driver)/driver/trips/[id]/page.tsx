'use client';

import { useEffect, useState, useRef, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Users, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import EmployeeList from '@/components/driver/employee-list';
import { useToast } from '@/hooks/use-toast';

// Dynamically import Map to avoid SSR issues
const DriverMap = dynamic(() => import('@/components/driver/driver-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function ActiveTripPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [gpsLocation, setGpsLocation] = useState<[number, number] | undefined>(undefined);

    const watchIdRef = useRef<number | null>(null);

    // Fetch Trip Details
    const fetchTrip = async () => {
        try {
            const response = await api.get(`/driver/trips/${id}`);
            setTrip(response.data);

            // Determine current stop based on logs? Or just default to first uncompleted?
            // For now, default to 0. 
        } catch (error) {
            console.error("Failed to fetch trip", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load trip details" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();

        // Start GPS Tracking
        if ('geolocation' in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setGpsLocation([latitude, longitude]);

                    // Send to backend (throttle this in production)
                    api.post(`/driver/trips/${id}/location`, { lat: latitude, lng: longitude })
                        .catch(err => console.error("GPS send failed", err));
                },
                (error) => console.error("GPS Error", error),
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [id]);

    const handleStartTrip = async () => {
        // Check for geolocation permission first
        if (!('geolocation' in navigator)) {
            toast({
                variant: "destructive",
                title: "GPS Not Available",
                description: "Your device does not support location services"
            });
            return;
        }

        try {
            // Request permission and check if it's granted
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

            if (permissionStatus.state === 'denied') {
                toast({
                    variant: "destructive",
                    title: "Location Permission Required",
                    description: "Please enable location permission in your browser settings to start a trip"
                });
                return;
            }

            // Try to get current position to trigger permission prompt if needed
            if (permissionStatus.state === 'prompt') {
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        () => resolve(true),
                        (error) => {
                            if (error.code === error.PERMISSION_DENIED) {
                                reject(new Error('Permission denied'));
                            } else {
                                // GPS signal issue, not permission issue - this is OK
                                resolve(true);
                            }
                        },
                        { timeout: 5000 }
                    );
                });
            }

            // Permission is granted, start the trip
            await api.post(`/driver/trips/${id}/start`);
            fetchTrip(); // Refresh status
            toast({ variant: "success", title: "Trip Started", description: "Drive safely! GPS tracking is active." });
        } catch (error: any) {
            if (error.message === 'Permission denied') {
                toast({
                    variant: "destructive",
                    title: "Location Permission Denied",
                    description: "You must allow location access to start a trip"
                });
            } else {
                toast({ variant: "destructive", title: "Error", description: "Could not start trip" });
            }
        }
    };

    const handleCompleteTrip = async () => {
        if (!confirm("Are you sure you want to complete this trip?")) return;
        try {
            await api.post(`/driver/trips/${id}/complete`, { distance: 0 }); // Distance calculated by backend in real-time
            router.push('/driver/dashboard');
            toast({ variant: "success", title: "Trip Completed", description: "Good job!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not complete trip" });
        }
    };

    const handleNavigate = () => {
        if (!trip) return;
        const currentStop = trip.route.stops[currentStopIndex]?.stop;
        if (currentStop) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`, '_blank');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Trip...</div>;
    if (!trip) return <div className="h-screen flex items-center justify-center">Trip Not Found</div>;

    const stops = trip.route.stops;
    const currentStopData = stops[currentStopIndex];
    const employeesAtStop = trip.boardingLogs?.filter((l: any) => l.stop_id === currentStopData?.stop_id) || [];

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <DriverMap
                    stops={stops}
                    currentStopId={currentStopData?.stop_id}
                    currentLocation={gpsLocation}
                    routePoints={stops.map((s: any) => [s.stop.lat, s.stop.lng])} // Simplistic route line
                />

                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 right-4 flex justify-between z-[400]">
                    <Card className="bg-white/90 backdrop-blur border-none shadow-lg">
                        <CardContent className="p-3 flex items-center gap-3">
                            <Badge variant={trip.status === 'ongoing' ? 'default' : 'secondary'}>
                                {trip.status}
                            </Badge>
                            <span className="font-bold text-sm">{trip.route.name}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Sheet / Controls */}
            <div className="bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-10 relative mt-[-20px]">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />

                <div className="px-6 pb-6">
                    {/* Active Stop Info */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                STOP {currentStopIndex + 1} OF {stops.length}
                            </p>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {currentStopData?.stop.name}
                            </h2>
                        </div>
                        <Button
                            size="icon"
                            className="bg-blue-600 rounded-full h-12 w-12 shadow-lg shadow-blue-200"
                            onClick={handleNavigate}
                        >
                            <Navigation className="h-5 w-5 text-white" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {trip.status === 'scheduled' ? (
                            <Button className="w-full h-12 text-lg font-bold" onClick={handleStartTrip}>
                                START TRIP
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="h-12 border-2 border-gray-200">
                                            <Users className="mr-2 h-4 w-4" />
                                            Employees ({employeesAtStop.length})
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                                        <SheetHeader className="mb-4">
                                            <SheetTitle>Employees at {currentStopData?.stop.name}</SheetTitle>
                                        </SheetHeader>
                                        <div className="overflow-y-auto h-full pb-20">
                                            <EmployeeList
                                                stopId={currentStopData?.stop_id}
                                                tripId={trip.id}
                                                tripType={trip.type}
                                                employees={employeesAtStop}
                                                onUpdate={fetchTrip}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {currentStopIndex < stops.length - 1 ? (
                                    <Button
                                        className="h-12 bg-gray-900 text-white hover:bg-black"
                                        onClick={() => setCurrentStopIndex(prev => prev + 1)}
                                    >
                                        Next Stop
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        className="h-12 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={handleCompleteTrip}
                                    >
                                        Complete Trip
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Navigation controls for stops (Prev/Next) just for dev/manual override */}
                        <div className="flex justify-center gap-4 text-sm text-gray-400 pt-2">
                            <button
                                disabled={currentStopIndex === 0}
                                onClick={() => setCurrentStopIndex(prev => Math.max(0, prev - 1))}
                            >
                                Previous
                            </button>
                            <span>•</span>
                            <button
                                disabled={currentStopIndex === stops.length - 1}
                                onClick={() => setCurrentStopIndex(prev => Math.min(stops.length - 1, prev + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
