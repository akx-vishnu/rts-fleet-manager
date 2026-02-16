'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TripCard from '@/components/driver/trip-card';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function DriverTripsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await api.get('/driver/trips');
                setTrips(response.data);
            } catch (error) {
                console.error("Failed to fetch trips", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const upcomingTrips = trips.filter(t => t.status === 'scheduled' || t.status === 'ongoing');
    const completedTrips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');

    return (
        <div className="pb-20">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">My Trips</h1>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingTrips.length > 0 ? (
                        upcomingTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No upcoming trips scheduled.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {completedTrips.length > 0 ? (
                        completedTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No trip history found.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
