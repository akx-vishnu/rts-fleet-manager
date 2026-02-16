'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming these exist, or I'll use native select
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewRosterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    const [employeeId, setEmployeeId] = useState('');
    const [routeId, setRouteId] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('pickup');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empRes, routeRes] = await Promise.all([
                api.get('/users?role=employee'), // Assuming filter exists
                api.get('/routes')
            ]);
            setEmployees(empRes.data);
            setRoutes(routeRes.data);
        } catch (error) {
            console.error('Failed to load data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/rosters', {
                employeeId,
                routeId,
                date,
                type
            });
            router.push('/admin/roster');
        } catch (error) {
            console.error('Failed to create roster', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/roster">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Assign Roster</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Trip Type</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="pickup">Pickup</option>
                                <option value="drop">Drop</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee">Employee</Label>
                            <select
                                id="employee"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={employeeId}
                                onChange={e => setEmployeeId(e.target.value)}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.email} ({emp.name || 'No Name'})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="route">Route</Label>
                            <select
                                id="route"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={routeId}
                                onChange={e => setRouteId(e.target.value)}
                                required
                            >
                                <option value="">Select Route</option>
                                {routes.map(route => (
                                    <option key={route.id} value={route.id}>{route.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Link href="/admin/roster">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Assign'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
