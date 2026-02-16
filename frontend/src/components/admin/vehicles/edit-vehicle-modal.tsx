'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface EditVehicleModalProps {
    vehicle: any;
    onClose: () => void;
    onVehicleUpdated: () => void;
}

export function EditVehicleModal({ vehicle, onClose, onVehicleUpdated }: EditVehicleModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        license_plate: string;
        model: string;
        capacity: number;
        status: string;
        owner: string;
        owner_phone: string;
    }>({
        license_plate: '',
        model: '',
        capacity: 0,
        status: '',
        owner: '',
        owner_phone: '',
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                license_plate: vehicle.license_plate || '',
                model: vehicle.model || '',
                capacity: vehicle.capacity || 0,
                status: vehicle.status || 'active',
                owner: vehicle.owner || '',
                owner_phone: vehicle.owner_phone || '',
            });
        }
    }, [vehicle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch(`/fleet/vehicles/${vehicle.id}`, formData);
            onVehicleUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to update vehicle', error);
            const message = error.response?.data?.message || 'Failed to update vehicle.';
            alert(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete vehicle ${formData.license_plate}?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/fleet/vehicles/${vehicle.id}`);
            onVehicleUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to delete vehicle', error);
            const message = error.response?.data?.message || 'Failed to delete vehicle. It may have active trips.';
            alert(message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Vehicle</DialogTitle>
                    <DialogDescription>
                        Update vehicle details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="license_plate">License Plate</Label>
                                <Input
                                    id="license_plate"
                                    name="license_plate"
                                    value={formData.license_plate}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
                                    }}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="owner">Owner</Label>
                                <Input
                                    id="owner"
                                    name="owner"
                                    value={formData.owner || ''}
                                    onChange={handleChange}
                                    placeholder="RTS"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="owner_phone">Owner Phone</Label>
                                <Input
                                    id="owner_phone"
                                    name="owner_phone"
                                    value={formData.owner_phone || ''}
                                    onChange={handleChange}
                                    placeholder="9843012345"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
