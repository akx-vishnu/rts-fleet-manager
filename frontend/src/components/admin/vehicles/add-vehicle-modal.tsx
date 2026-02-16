'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddVehicleModalProps {
    onVehicleAdded: () => void;
}

export function AddVehicleModal({ onVehicleAdded }: AddVehicleModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        license_plate: string;
        model: string;
        capacity: string;
        status: string;
        owner: string;
        owner_phone: string;
    }>({
        license_plate: '',
        model: '',
        capacity: '',
        status: 'active',
        owner: '',
        owner_phone: '',
    });

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
            await api.post('/fleet/vehicles', {
                ...formData,
                capacity: parseInt(formData.capacity, 10),
            });
            setOpen(false);
            setFormData({
                license_plate: '',
                model: '',
                capacity: '',
                status: 'active',
                owner: '',
                owner_phone: '',
            });
            onVehicleAdded();
        } catch (error) {
            console.error('Failed to add vehicle', error);
            // Ideally show a toast notification here
            alert('Failed to add vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new vehicle here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="license_plate" className="text-right">
                                License Plate
                            </Label>
                            <Input
                                id="license_plate"
                                name="license_plate"
                                value={formData.license_plate}
                                onChange={(e) => {
                                    const { name, value } = e.target;
                                    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
                                }}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">
                                Owner
                            </Label>
                            <Input
                                id="owner"
                                name="owner"
                                value={formData.owner || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="RTS"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner_phone" className="text-right">
                                Owner Phone
                            </Label>
                            <Input
                                id="owner_phone"
                                name="owner_phone"
                                value={formData.owner_phone || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="9843012345"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">
                                Model
                            </Label>
                            <Input
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="capacity" className="text-right">
                                Capacity
                            </Label>
                            <Input
                                id="capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                                min="1"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="col-span-3">
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
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
