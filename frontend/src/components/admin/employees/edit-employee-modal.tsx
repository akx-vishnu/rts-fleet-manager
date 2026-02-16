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
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface EditEmployeeModalProps {
    employee: any;
    onClose: () => void;
    onEmployeeUpdated: () => void;
}

export function EditEmployeeModal({ employee, onClose, onEmployeeUpdated }: EditEmployeeModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        employee_id: '',
        department: '',
        designation: '',
        shift_start: '',
        shift_end: '',
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.user?.name || '',
                email: employee.user?.email || '',
                phone: employee.user?.phone || '',
                employee_id: employee.employee_id || '',
                department: employee.department || '',
                designation: employee.designation || '',
                shift_start: employee.shift_start || '',
                shift_end: employee.shift_end || '',
            });
        }
    }, [employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch(`/employees/${employee.id}`, {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || null,
                employee_id: formData.employee_id,
                department: formData.department,
                designation: formData.designation,
                shift_start: formData.shift_start,
                shift_end: formData.shift_end,
            });

            onEmployeeUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to update employee', error);
            const message = error.response?.data?.message || 'Failed to update employee.';
            alert(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete employee ${formData.name}?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/employees/${employee.id}`);
            onEmployeeUpdated();
            onClose();
        } catch (error: any) {
            console.error('Failed to delete employee', error);
            const message = error.response?.data?.message || 'Failed to delete employee.';
            alert(message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" name="department" value={formData.department} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input id="designation" name="designation" value={formData.designation} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shift_start">Shift Start</Label>
                                <Input id="shift_start" name="shift_start" type="time" value={formData.shift_start} onChange={handleChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shift_end">Shift End</Label>
                                <Input id="shift_end" name="shift_end" type="time" value={formData.shift_end} onChange={handleChange} />
                            </div>
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
        </Dialog>
    );
}
