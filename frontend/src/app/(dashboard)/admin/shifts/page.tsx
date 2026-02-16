'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Shift {
    id: string;
    shift_type: string;
    day_of_week: number;
    effective_from: string;
    effective_until?: string;
    is_active: boolean;
    driver: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    };
}

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [filterDriver, setFilterDriver] = useState<string>('all');

    const [newShift, setNewShift] = useState({
        driverId: '',
        shiftType: 'morning',
        dayOfWeek: 1,
        effectiveFrom: '',
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        loadData();
    }, [filterDriver]);

    const loadData = async () => {
        try {
            setLoading(true);

            let url = '/shifts';
            if (filterDriver !== 'all') url += `?driverId=${filterDriver}`;

            const [shiftsRes, driversRes] = await Promise.all([
                api.get(url),
                api.get('/fleet/drivers'),
            ]);

            setShifts(shiftsRes.data);
            setDrivers(driversRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShift = async () => {
        if (!newShift.driverId || !newShift.effectiveFrom) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await api.post('/shifts', {
                driverId: newShift.driverId,
                shiftType: newShift.shiftType,
                dayOfWeek: newShift.dayOfWeek,
                effectiveFrom: newShift.effectiveFrom,
            });

            alert('Shift schedule created successfully!');
            setShowDialog(false);
            setNewShift({
                driverId: '',
                shiftType: 'morning',
                dayOfWeek: 1,
                effectiveFrom: '',
            });
            loadData();
        } catch (error: any) {
            console.error('Error creating shift:', error);
            alert(error.response?.data?.message || 'Failed to create shift');
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shift schedule?')) return;

        try {
            await api.delete(`/shifts/${id}`);
            alert('Shift schedule deleted successfully!');
            loadData();
        } catch (error) {
            console.error('Error deleting shift:', error);
            alert('Failed to delete shift schedule');
        }
    };

    const getShiftBadge = (shift: string) => {
        const colors: Record<string, string> = {
            morning: 'bg-blue-500',
            afternoon: 'bg-orange-500',
            night: 'bg-purple-500',
            weekend: 'bg-green-500',
        };
        return (
            <Badge className={colors[shift] || 'bg-gray-500'}>
                {shift.charAt(0).toUpperCase() + shift.slice(1)}
            </Badge>
        );
    };

    // Group shifts by driver
    const shiftsByDriver = shifts.reduce((acc, shift) => {
        const driverName = shift.driver.user.name;
        if (!acc[driverName]) {
            acc[driverName] = [];
        }
        acc[driverName].push(shift);
        return acc;
    }, {} as Record<string, Shift[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Shift Schedules</h1>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Shift Schedule
                </Button>
            </div>

            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Active Shifts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{shifts.filter(s => s.is_active).length}</div>
                </CardContent>
            </Card>

            {/* Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex-1 max-w-md">
                        <Label>Filter by Driver</Label>
                        <Select value={filterDriver} onValueChange={setFilterDriver}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Drivers</SelectItem>
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                        {driver.user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Shifts List (Grouped by Driver) */}
            <div className="space-y-6">
                {loading ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            Loading...
                        </CardContent>
                    </Card>
                ) : Object.keys(shiftsByDriver).length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No shift schedules found
                        </CardContent>
                    </Card>
                ) : (
                    Object.entries(shiftsByDriver).map(([driverName, driverShifts]) => (
                        <Card key={driverName}>
                            <CardHeader>
                                <CardTitle>{driverName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {driverShifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                {getShiftBadge(shift.shift_type)}
                                                <div className="text-sm">
                                                    <span className="font-semibold">{dayNames[shift.day_of_week]}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Effective from: {new Date(shift.effective_from).toLocaleDateString()}
                                                </div>
                                                {shift.effective_until && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Until: {new Date(shift.effective_until).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {!shift.is_active && (
                                                    <Badge variant="outline" className="text-red-500">Inactive</Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteShift(shift.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Shift Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Shift Schedule</DialogTitle>
                        <DialogDescription>
                            Set up a recurring shift schedule for a driver
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Driver *</Label>
                            <Select
                                value={newShift.driverId}
                                onValueChange={(value) => setNewShift({ ...newShift, driverId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                            {driver.user.name} - {driver.license_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Shift Type *</Label>
                                <Select
                                    value={newShift.shiftType}
                                    onValueChange={(value) => setNewShift({ ...newShift, shiftType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">Morning</SelectItem>
                                        <SelectItem value="afternoon">Afternoon</SelectItem>
                                        <SelectItem value="night">Night</SelectItem>
                                        <SelectItem value="weekend">Weekend</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Day of Week *</Label>
                                <Select
                                    value={newShift.dayOfWeek.toString()}
                                    onValueChange={(value) => setNewShift({ ...newShift, dayOfWeek: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dayNames.map((day, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Effective From *</Label>
                            <Input
                                type="date"
                                value={newShift.effectiveFrom}
                                onChange={(e) => setNewShift({ ...newShift, effectiveFrom: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateShift}>Create Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
