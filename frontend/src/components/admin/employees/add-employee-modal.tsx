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

interface AddEmployeeModalProps {
    onEmployeeAdded: () => void;
}

export function AddEmployeeModal({ onEmployeeAdded }: AddEmployeeModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        employee_id: '',
        shift_start: '',
        shift_end: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create User
            const userRes = await api.post('/users', {
                email: formData.email || undefined,
                name: formData.name,
                phone: formData.phone,
                role: 'employee',
            });

            const userId = userRes.data.id;

            // 2. Create Employee Profile
            await api.post('/employees', {
                userId: userId,
                employee_id: formData.employee_id,
                department: formData.department,
                designation: formData.designation,
                shift_start: formData.shift_start,
                shift_end: formData.shift_end,
            });

            setOpen(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                department: '',
                designation: '',
                employee_id: '',
                shift_start: '',
                shift_end: '',
            });
            onEmployeeAdded();
        } catch (error: any) {
            console.error('Failed to add employee', error);
            const message = error.response?.data?.message || 'Failed to add employee.';
            alert(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Create a new employee account and profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required placeholder="e.g. EMP001" />
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
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Create Employee'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
