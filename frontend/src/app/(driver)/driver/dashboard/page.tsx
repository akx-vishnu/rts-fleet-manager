'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Calendar, Clock, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';

export default function DriverDashboard() {
    const [driver, setDriver] = useState<any>(null);
    const [todayTrips, setTodayTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { toast } = useToast(); // Added initialization

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling']
        });

        const fetchData = async (isRealtime = false) => {
            try {
                const [profileRes, tripsRes] = await Promise.all([
                    api.get('/driver/me'),
                    api.get('/driver/trips')
                ]);

                setDriver(profileRes.data);

                const now = new Date();
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                const endOfDay = new Date(now.setHours(23, 59, 59, 999));

                const allTrips = tripsRes.data;

                // Active trips for the "Today's Trips" list
                const activeTrips = allTrips.filter((t: any) => {
                    const tripDate = new Date(t.start_time);
                    return tripDate >= startOfDay && tripDate <= endOfDay && (t.status === 'scheduled' || t.status === 'ongoing');
                });
                setTodayTrips(activeTrips);

                // Refined Vehicle Selection Logic (Ongoing > Upcoming > Last Completed)
                const ongoing = allTrips.find((t: any) => t.status === 'ongoing');

                const nextScheduled = [...allTrips]
                    .filter((t: any) => t.status === 'scheduled')
                    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .find(t => new Date(t.start_time) >= new Date());

                const mostRecent = allTrips[0];

                const relevantTrip = ongoing || nextScheduled || mostRecent;
                setLastAssignedVehicle(relevantTrip?.vehicle || null);

                if (isRealtime) {
                    toast({
                        title: "Update Received",
                        description: `Assigned vehicle: ${relevantTrip?.vehicle?.model || 'None'}`,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch driver data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Listen for real-time updates
        socket.on('tripsUpdated', () => fetchData(true));
        socket.on('tripStatusChanged', () => fetchData(true));

        return () => {
            socket.disconnect();
        };
    }, []);

    const [lastAssignedVehicle, setLastAssignedVehicle] = useState<any>(null);

    if (loading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }

    if (!driver) {
        return <div className="p-4 text-center text-red-500">Error loading profile</div>;
    }

    const currentTrip = todayTrips.find(t => t.status === 'ongoing') || todayTrips[0];
    const assignedVehicle = lastAssignedVehicle;

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hello, {driver.user?.name.split(' ')[0]} 👋</h1>
                    <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, d MMMM')}</p>
                </div>
                <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-blue-600 font-bold">{driver.user?.name.charAt(0)}</span>
                </div>
            </motion.div>

            {/* Vehicle Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Assigned Vehicle</p>
                                <h3 className="text-xl font-bold">{assignedVehicle?.model || 'No Vehicle'}</h3>
                                <p className="text-sm opacity-90">{assignedVehicle?.license_plate || 'Not assigned yet'}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-green-400/20 px-2 py-1 rounded text-xs font-medium border border-green-400/30">
                                {driver.status === 'on_trip' ? 'ON TRIP' : 'ACTIVE'}
                            </div>
                            {assignedVehicle && (
                                <div className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                                    Capacity: {assignedVehicle.capacity}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Current/Next Trip Action */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-gray-900">
                        {currentTrip?.status === 'ongoing' ? 'Current Trip' : 'Up Next'}
                    </h2>
                    <Link href="/driver/trips" className="text-sm text-blue-600 font-medium">View All</Link>
                </div>

                {currentTrip ? (
                    <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                        ${currentTrip.type === 'pickup' ? 'bg-orange-100 text-orange-700' :
                                            currentTrip.type === 'drop' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {currentTrip.type}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">#{currentTrip.route.name}</span>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full 
                                    ${currentTrip.status === 'ongoing' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                                    {currentTrip.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium leading-none">{currentTrip.route.origin}</p>
                                        <div className="h-4 border-l border-dashed border-gray-300 ml-2 my-0.5"></div>
                                        <p className="text-sm font-medium leading-none">{currentTrip.route.destination}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 ml-0.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{format(new Date(currentTrip.start_time || new Date()), 'h:mm a')}</span>
                                </div>
                            </div>

                            <Link href={`/driver/trips/${currentTrip.id}`}>
                                <Button className="w-full gap-2 items-center justify-center font-medium bg-gray-900 group">
                                    {currentTrip.status === 'ongoing' ? 'Continue Trip' : 'Start Trip'}
                                    <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed text-gray-500">
                        <p>No active trips for today.</p>
                        <Link href="/driver/trips">
                            <Button variant="link" className="text-blue-600 h-auto p-0 mt-2">Check schedule</Button>
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-gray-900">{todayTrips.length}</span>
                        <span className="text-xs text-gray-500 mt-1">Today's Trips</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-gray-900">
                            {driver.tripsCompleted || 0}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">Completed</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
