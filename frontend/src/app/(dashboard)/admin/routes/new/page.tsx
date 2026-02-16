'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash } from 'lucide-react';

export default function NewRoutePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [stops, setStops] = useState<{ name: string; lat: number; lng: number; type: string }[]>([]);

    // Form states
    const [name, setName] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('');

    // New stop state
    const [newStop, setNewStop] = useState({ name: '', lat: '', lng: '', type: 'pickup' });

    const handleAddStop = () => {
        if (!newStop.name || !newStop.lat || !newStop.lng) return;
        setStops([...stops, {
            name: newStop.name,
            lat: parseFloat(newStop.lat),
            lng: parseFloat(newStop.lng),
            type: newStop.type
        }]);
        setNewStop({ name: '', lat: '', lng: '', type: 'pickup' });
    };

    const handleRemoveStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/routes', {
                name,
                origin,
                destination,
                estimated_duration: parseInt(duration),
                stops
            });
            router.push('/admin/routes');
        } catch (error) {
            console.error('Failed to create route', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/routes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create New Route</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Route Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Route Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Route A - Downtown" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Est. Duration (mins)</Label>
                            <Input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="origin">Origin</Label>
                            <Input id="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Start Location" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destination">Destination</Label>
                            <Input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="End Location" required />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stops (Ordered)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-end border-b pb-4">
                            <div className="space-y-2 flex-1">
                                <Label>Stop Name</Label>
                                <Input value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })} placeholder="Stop Name" />
                            </div>
                            <div className="space-y-2 w-24">
                                <Label>Lat</Label>
                                <Input value={newStop.lat} onChange={e => setNewStop({ ...newStop, lat: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2 w-24">
                                <Label>Lng</Label>
                                <Input value={newStop.lng} onChange={e => setNewStop({ ...newStop, lng: e.target.value })} placeholder="0.00" />
                            </div>
                            <Button type="button" onClick={handleAddStop}>Add Stop</Button>
                        </div>

                        <div className="space-y-2">
                            {stops.map((stop, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium">{stop.name}</p>
                                            <p className="text-xs text-muted-foreground">{stop.lat}, {stop.lng}</p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveStop(index)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            {stops.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4">No stops added yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/routes">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Route'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
