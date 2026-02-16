"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"
import { Loader2, Trash2 } from "lucide-react"
import { io } from "socket.io-client"

export default function AdminTripsPage() {
    const [trips, setTrips] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTrips()

        // Connect to WebSocket for real-time updates
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling']
        })

        socket.on('connect', () => {
            console.log('Connected to WebSocket for trip updates')
        })

        // Listen for trip status changes
        socket.on('tripStatusChanged', (data: any) => {
            console.log('Trip status changed:', data)
            setTrips(prevTrips =>
                prevTrips.map(trip =>
                    trip.id === data.tripId
                        ? { ...trip, status: data.status, ...data.trip }
                        : trip
                )
            )
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const fetchTrips = async () => {
        try {
            const res = await api.get("/trips") // Admin fetches all trips
            setTrips(res.data)
        } catch (error) {
            console.error("Failed to fetch trips", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this trip? All boarding and GPS logs will be permanently removed.")) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete trip", error);
            alert("Failed to delete trip.");
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Trip Management</h1>
                    <p className="text-muted-foreground">
                        Overview of all scheduled and active trips.
                    </p>
                </div>
                <Button onClick={async () => {
                    setLoading(true);
                    try {
                        // Use local date instead of UTC to avoid timezone issues
                        const today = new Date();
                        const localDate = today.getFullYear() + '-' +
                            String(today.getMonth() + 1).padStart(2, '0') + '-' +
                            String(today.getDate()).padStart(2, '0');

                        console.log('Generating trips for:', localDate);
                        await api.post('/trips/generate', { date: localDate });
                        await fetchTrips();
                    } catch (error) {
                        console.error("Failed to generate trips", error);
                    } finally {
                        setLoading(false);
                    }
                }}>
                    Generate Today's Trips
                </Button>
            </div>

            <Card className="glass">
                <CardHeader>
                    <CardTitle>All Trips</CardTitle>
                    <CardDescription>
                        List of all trips across the fleet.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date/Time</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Distance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No trips found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    trips.map((trip) => (
                                        <TableRow key={trip.id}>
                                            <TableCell>
                                                {new Date(trip.start_time).toLocaleDateString()} <br />
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(trip.start_time).toLocaleTimeString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{trip.route?.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{trip.driver?.user?.name || 'Unassigned'}</span>
                                                    <span className="text-xs text-muted-foreground">{trip.driver?.user?.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{trip.vehicle?.license_plate || 'Unassigned'}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${trip.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {trip.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {trip.distance_traveled_km?.toFixed(2) || '0.00'} km
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-white hover:bg-destructive"
                                                    onClick={() => handleDelete(trip.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
