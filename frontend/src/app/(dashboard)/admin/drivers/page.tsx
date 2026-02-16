'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AddDriverModal } from '@/components/admin/drivers/add-driver-modal';
import { EditDriverModal } from '@/components/admin/drivers/edit-driver-modal';

export default function DriversPage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDriver, setEditingDriver] = useState<any | null>(null);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const res = await api.get('/fleet/drivers');
            const sorted = res.data.sort((a: any, b: any) =>
                (a.user?.name || '').localeCompare(b.user?.name || '')
            );
            setDrivers(sorted);
        } catch (error) {
            console.error('Failed to load drivers', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'on_trip':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                    <p className="text-muted-foreground">Manage your drivers here.</p>
                </div>
                <AddDriverModal onDriverAdded={loadDrivers} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>License Number</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : drivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No drivers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drivers.map((driver) => (
                                    <TableRow key={driver.id}>
                                        <TableCell className="font-medium">{driver.user?.name || 'N/A'}</TableCell>
                                        <TableCell>{driver.user?.email || 'N/A'}</TableCell>
                                        <TableCell>{driver.user?.phone || 'N/A'}</TableCell>
                                        <TableCell>{driver.license_number?.toUpperCase()}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(
                                                    driver.status
                                                )}`}
                                            >
                                                {driver.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingDriver(driver)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {editingDriver && (
                <EditDriverModal
                    driver={editingDriver}
                    onClose={() => setEditingDriver(null)}
                    onDriverUpdated={loadDrivers}
                />
            )}
        </div>
    );
}
