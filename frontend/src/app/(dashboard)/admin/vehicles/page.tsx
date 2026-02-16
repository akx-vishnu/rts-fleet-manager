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
import { Plus, Pencil } from 'lucide-react';
import { AddVehicleModal } from '@/components/admin/vehicles/add-vehicle-modal';
import { EditVehicleModal } from '@/components/admin/vehicles/edit-vehicle-modal';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'license_plate', direction: 'asc' });

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const res = await api.get('/fleet/vehicles');
            setVehicles(res.data);
        } catch (error) {
            console.error('Failed to load vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedVehicles = [...vehicles].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue, bValue;

        switch (key) {
            case 'license_plate':
                aValue = a.license_plate || '';
                bValue = b.license_plate || '';
                break;
            case 'owner':
                aValue = a.owner || '';
                bValue = b.owner || '';
                break;
            case 'model':
                aValue = a.model || '';
                bValue = b.model || '';
                break;
            case 'capacity':
                aValue = a.capacity || 0;
                bValue = b.capacity || 0;
                break;
            case 'status':
                aValue = a.status || '';
                bValue = b.status || '';
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return <span className="text-gray-300"> ↑↓</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
                    <p className="text-muted-foreground">Manage your fleet vehicles here.</p>
                </div>
                <AddVehicleModal onVehicleAdded={loadVehicles} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Vehicles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort('license_plate')} className="cursor-pointer hover:bg-gray-50">
                                    License Plate {renderSortIcon('license_plate')}
                                </TableHead>
                                <TableHead onClick={() => handleSort('owner')} className="cursor-pointer hover:bg-gray-50">
                                    Owner {renderSortIcon('owner')}
                                </TableHead>
                                <TableHead>Owner Phone</TableHead>
                                <TableHead onClick={() => handleSort('model')} className="cursor-pointer hover:bg-gray-50">
                                    Model {renderSortIcon('model')}
                                </TableHead>
                                <TableHead onClick={() => handleSort('capacity')} className="cursor-pointer hover:bg-gray-50">
                                    Capacity {renderSortIcon('capacity')}
                                </TableHead>
                                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-gray-50">
                                    Status {renderSortIcon('status')}
                                </TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : sortedVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No vehicles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                                        <TableCell>{vehicle.owner || 'RTS'}</TableCell>
                                        <TableCell>{vehicle.owner_phone || 'N/A'}</TableCell>
                                        <TableCell>{vehicle.model}</TableCell>
                                        <TableCell>{vehicle.capacity}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(
                                                    vehicle.status
                                                )}`}
                                            >
                                                {vehicle.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {vehicle.current_lat
                                                ? `${vehicle.current_lat.toFixed(4)}, ${vehicle.current_lng.toFixed(4)}`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingVehicle(vehicle)}
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

            {editingVehicle && (
                <EditVehicleModal
                    vehicle={editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                    onVehicleUpdated={loadVehicles}
                />
            )}
        </div>
    );
}
