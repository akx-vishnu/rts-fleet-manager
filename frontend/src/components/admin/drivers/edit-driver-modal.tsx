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
import api from '@/lib/api';
import { Trash2 } from 'lucide-react';

interface EditDriverModalProps {
    driver: any;
    onClose: () => void;
    onDriverUpdated: () => void;
}

export function EditDriverModal({ driver, onClose, onDriverUpdated }: EditDriverModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        status: '',
        password: '',
    });

    useEffect(() => {
        if (driver) {
            setFormData({
                name: driver.user?.name || '',
                email: driver.user?.email || '',
                phone: driver.user?.phone || '',
                license_number: driver.license_number || '',
                status: driver.status || 'active',
                password: '',
            });
        }
    }, [driver]);

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
            // Only send password if it's not empty
            const { password, ...rest } = formData;
            const submitData: any = { ...rest };
            if (password) {
                submitData.password = password;
            }

            await api.patch(`/fleet/drivers/${driver.id}`, submitData);
            onDriverUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to update driver', error);
            const message = error.response?.data?.message || 'Failed to update driver.';
            alert(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete driver ${formData.name}?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/fleet/drivers/${driver.id}`);
            onDriverUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to delete driver', error);
            const message = error.response?.data?.message || 'Failed to delete driver. They may have active assignments.';
            alert(message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Driver</DialogTitle>
                    <DialogDescription>
                        Update driver details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="license_number">License No.</Label>
                                <Input id="license_number" name="license_number" value={formData.license_number} onChange={handleChange} required />
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
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="on_trip">On Trip</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 border-t pt-4">
                            <Label htmlFor="password">Reset Password (leave blank to keep current)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
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
                            Delete Driver
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
        </Dialog>
    );
}
