'use client';

import { useState, useEffect, Fragment } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function RoutesPage() {
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            const res = await api.get('/routes');
            setRoutes(res.data);
        } catch (error) {
            console.error('Failed to load routes', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        if (expandedRouteId === id) {
            setExpandedRouteId(null);
        } else {
            setExpandedRouteId(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
                    <p className="text-muted-foreground">Manage transportation routes.</p>
                </div>
                <Link href="/admin/routes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Route
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Route ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Est. Duration</TableHead>
                                <TableHead>Stops</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : routes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No routes found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                routes.map((route) => (
                                    <Fragment key={route.id}>
                                        <TableRow className={expandedRouteId === route.id ? "bg-muted/50" : ""}>
                                            <TableCell className="font-mono text-xs">{route.id.split('-')[0]}</TableCell>
                                            <TableCell className="font-medium">{route.name}</TableCell>
                                            <TableCell>{route.origin}</TableCell>
                                            <TableCell>{route.destination}</TableCell>
                                            <TableCell>{route.estimated_duration_mins} mins</TableCell>
                                            <TableCell>{route.stops?.length || 0}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${route.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {route.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => toggleExpand(route.id)}
                                                >
                                                    {expandedRouteId === route.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        {expandedRouteId === route.id && (
                                            <TableRow className="bg-muted/20">
                                                <TableCell colSpan={8}>
                                                    <div className="p-4 rounded-md border text-sm">
                                                        <h4 className="font-semibold mb-2 text-gray-700">Route Stops</h4>
                                                        {route.stops && route.stops.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {route.stops.map((rs: any, index: number) => (
                                                                    <div key={rs.id || index} className="flex items-center">
                                                                        <span className="bg-white px-2 py-1 rounded border shadow-sm">
                                                                            {rs.stop?.name || `Stop ${index + 1}`}
                                                                        </span>
                                                                        {index < route.stops.length - 1 && (
                                                                            <span className="mx-2 text-gray-400">→</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">No stops defined for this route.</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
