'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, ChevronDown } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { format, addDays, subDays } from 'date-fns';
import { Input } from '@/components/ui/input';

interface Assignment {
    id: string;
    date: string;
    shift_type: string;
    trip_type: string;
    scheduled_time: string;
    status: string;
    notes?: string;
    driver: {
        id: string;
        user: { name: string; email: string; phone?: string; };
    };
    vehicle: {
        id: string;
        license_plate: string;
        model: string;
    };
    route: {
        id: string;
        name: string;
    };
    employees: {
        employee: {
            id: string;
            employee_id: string;
            user: { name: string; };
        };
    }[];
}

export default function RosterAssignmentsPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [newAssignment, setNewAssignment] = useState({
        driverId: '',
        vehicleId: '',
        routeId: '',
        shiftType: 'morning',
        tripType: 'pickup',
        scheduledTime: '',
        employeeIds: [] as string[],
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!showDialog) {
            setNewAssignment({
                driverId: '',
                vehicleId: '',
                routeId: '',
                shiftType: 'morning',
                tripType: 'pickup',
                scheduledTime: '',
                employeeIds: [],
                notes: '',
            });
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [showDialog]);

    const loadData = async () => {
        try {
            setLoading(true);
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            // Use fromDate/toDate even for single day to ensure consistency with backend
            const [assignmentsRes, driversRes, vehiclesRes, routesRes, employeesRes] = await Promise.all([
                api.get(`/roster-assignments?fromDate=${dateStr}&toDate=${dateStr}`),
                api.get('/fleet/drivers'),
                api.get('/fleet/vehicles'),
                api.get('/routes'),
                api.get('/employees'),
            ]);

            setAssignments(assignmentsRes.data);
            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setRoutes(routesRes.data);
            setEmployees(employeesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
    const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const handleToday = () => setSelectedDate(new Date());

    const handleCreateAssignment = async () => {
        if (!newAssignment.driverId || !newAssignment.vehicleId || !newAssignment.routeId || !newAssignment.tripType || !newAssignment.scheduledTime) {
            alert('Please fill in all required fields: Route, Driver, Vehicle, Trip Type, and Scheduled Time');
            return;
        }

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            await api.post('/roster-assignments', {
                driverId: newAssignment.driverId,
                vehicleId: newAssignment.vehicleId,
                routeId: newAssignment.routeId,
                date: dateStr,
                shiftType: newAssignment.shiftType,
                tripType: newAssignment.tripType,
                scheduledTime: newAssignment.scheduledTime,
                employeeIds: newAssignment.employeeIds,
                notes: newAssignment.notes,
            });

            alert('Assignment created successfully!');
            setShowDialog(false);
            setNewAssignment({
                driverId: '',
                vehicleId: '',
                routeId: '',
                shiftType: 'morning',
                tripType: 'pickup',
                scheduledTime: '',
                employeeIds: [],
                notes: '',
            });
            setSuggestions([]);
            setShowSuggestions(false);
            loadData();
        } catch (error: any) {
            console.error('Error creating assignment:', error);
            alert(error.response?.data?.message || 'Failed to create assignment');
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/roster-assignments/${id}`);
            loadData();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const handleGetSuggestions = async () => {
        if (!newAssignment.routeId) return alert('Select a route first');
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const res = await api.get(`/roster-assignments/suggestions?date=${dateStr}&routeId=${newAssignment.routeId}`);
            setSuggestions(res.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error getting suggestions:', error);
        }
    };

    const getShiftBadgeColor = (shift: string) => {
        switch (shift) {
            case 'morning': return 'bg-blue-100 text-blue-800';
            case 'afternoon': return 'bg-orange-100 text-orange-800';
            case 'night': return 'bg-purple-100 text-purple-800';
            case 'weekend': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Roster Management</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
                        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 px-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium min-w-[120px] text-center">
                                {format(selectedDate, 'EEE, MMM d, yyyy')}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNextDay}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" onClick={handleToday}>Today</Button>
                    <Button onClick={() => setShowDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Assignment
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No assignments found for {format(selectedDate, 'MMM d, yyyy')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>{assignment.date}</TableCell>
                                        <TableCell>{assignment.scheduled_time || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.trip_type === 'pickup' ? 'default' : 'secondary'}>
                                                {assignment.trip_type?.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {assignment.driver.user.name}
                                            <div className="text-xs text-muted-foreground">
                                                {assignment.driver.user.phone || assignment.driver.user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {assignment.vehicle.license_plate}
                                            <div className="text-xs text-muted-foreground">{assignment.vehicle.model}</div>
                                        </TableCell>
                                        <TableCell>{assignment.route.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {assignment.employees?.map((empRel, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {empRel.employee.user.name} ({empRel.employee.employee_id})
                                                    </Badge>
                                                ))}
                                                {(!assignment.employees || assignment.employees.length === 0) && '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>
                            Assign a driver, vehicle, and route for {format(selectedDate, 'MMMM d, yyyy')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Route *</Label>
                                <Select
                                    value={newAssignment.routeId}
                                    onValueChange={(value) => {
                                        setNewAssignment({ ...newAssignment, routeId: value });
                                        setSuggestions([]);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routes.map((route) => (
                                            <SelectItem key={route.id} value={route.id}>
                                                {route.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Shift Type *</Label>
                                <Select
                                    value={newAssignment.shiftType}
                                    onValueChange={(value) => setNewAssignment({ ...newAssignment, shiftType: value })}
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Trip Type *</Label>
                                <Select
                                    value={newAssignment.tripType}
                                    onValueChange={(value) => setNewAssignment({ ...newAssignment, tripType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pickup">Pickup</SelectItem>
                                        <SelectItem value="drop">Drop</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Scheduled Time *</Label>
                                <Input
                                    type="time"
                                    value={newAssignment.scheduledTime}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, scheduledTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Employees</Label>
                            <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-1">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`emp-${emp.id}`}
                                            checked={newAssignment.employeeIds.includes(emp.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewAssignment(prev => ({ ...prev, employeeIds: [...prev.employeeIds, emp.id] }));
                                                } else {
                                                    setNewAssignment(prev => ({ ...prev, employeeIds: prev.employeeIds.filter(id => id !== emp.id) }));
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor={`emp-${emp.id}`} className="text-sm font-normal cursor-pointer">
                                            {emp.user.name} ({emp.employee_id})
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {newAssignment.routeId && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Driver *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGetSuggestions}
                                    >
                                        Check AI Suggestions
                                    </Button>
                                </div>

                                {suggestions.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors"
                                            onClick={() => setShowSuggestions(!showSuggestions)}
                                        >
                                            <p className="text-sm font-semibold">AI Recommended Drivers ({suggestions.length})</p>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showSuggestions && (
                                            <div className="p-3 bg-blue-50 space-y-2">
                                                {suggestions.slice(0, 3).map((sug, idx) => (
                                                    <div
                                                        key={sug.driver.id}
                                                        className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-gray-50"
                                                        onClick={() => setNewAssignment({ ...newAssignment, driverId: sug.driver.id })}
                                                    >
                                                        <div>
                                                            <span className="font-semibold">#{idx + 1} {sug.driver.user.name}</span>
                                                            <p className="text-xs text-muted-foreground">{sug.reasoning}</p>
                                                        </div>
                                                        <Badge variant="outline">Score: {sug.fairnessScore.toFixed(1)}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Select
                                    value={newAssignment.driverId}
                                    onValueChange={(value) => setNewAssignment({ ...newAssignment, driverId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select driver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                {driver.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Vehicle *</Label>
                            <Select
                                value={newAssignment.vehicleId}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, vehicleId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.model} - {vehicle.license_plate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                value={newAssignment.notes}
                                onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                                placeholder="Add any notes..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateAssignment}>Create Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
