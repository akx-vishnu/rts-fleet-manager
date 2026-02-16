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
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

interface LeaveRequest {
    id: string;
    start_date: string;
    end_date: string;
    leave_type: string;
    status: string;
    reason?: string;
    approved_at?: string;
    driver: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    };
    approver?: {
        name: string;
    };
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDriver, setFilterDriver] = useState<string>('all');

    const [newLeave, setNewLeave] = useState({
        driverId: '',
        startDate: '',
        endDate: '',
        leaveType: 'vacation',
        reason: '',
    });

    useEffect(() => {
        loadData();
    }, [filterStatus, filterDriver]);

    const loadData = async () => {
        try {
            setLoading(true);

            let url = '/leave';
            const params = [];
            if (filterStatus !== 'all') params.push(`status=${filterStatus}`);
            if (filterDriver !== 'all') params.push(`driverId=${filterDriver}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const [leaveRes, driversRes] = await Promise.all([
                api.get(url),
                api.get('/fleet/drivers'),
            ]);

            setLeaveRequests(leaveRes.data);
            setDrivers(driversRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLeave = async () => {
        if (!newLeave.driverId || !newLeave.startDate || !newLeave.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        if (new Date(newLeave.endDate) < new Date(newLeave.startDate)) {
            alert('End date must be after start date');
            return;
        }

        try {
            await api.post('/leave', {
                driverId: newLeave.driverId,
                startDate: newLeave.startDate,
                endDate: newLeave.endDate,
                leaveType: newLeave.leaveType,
                reason: newLeave.reason,
            });

            alert('Leave request created successfully!');
            setShowDialog(false);
            setNewLeave({
                driverId: '',
                startDate: '',
                endDate: '',
                leaveType: 'vacation',
                reason: '',
            });
            loadData();
        } catch (error: any) {
            console.error('Error creating leave:', error);
            alert(error.response?.data?.message || 'Failed to create leave request');
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this leave request?')) return;

        try {
            await api.patch(`/leave/${id}/approve`);
            alert('Leave request approved!');
            loadData();
        } catch (error) {
            console.error('Error approving leave:', error);
            alert('Failed to approve leave request');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this leave request?')) return;

        try {
            await api.patch(`/leave/${id}/reject`);
            alert('Leave request rejected!');
            loadData();
        } catch (error) {
            console.error('Error rejecting leave:', error);
            alert('Failed to reject leave request');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getLeaveTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            sick: 'bg-purple-100 text-purple-800',
            vacation: 'bg-blue-100 text-blue-800',
            personal: 'bg-orange-100 text-orange-800',
            emergency: 'bg-red-100 text-red-800',
        };
        return <Badge variant="outline" className={colors[type] || ''}>{type}</Badge>;
    };

    const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
    const approvedRequests = leaveRequests.filter(r => r.status === 'approved');
    const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Leave Management</h1>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Leave Request
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{approvedRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Rejected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{rejectedRequests.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Filter by Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
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
                    </div>
                </CardContent>
            </Card>

            {/* Leave Requests List */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests ({leaveRequests.length} total)</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No leave requests found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leaveRequests.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(leave.status)}
                                                {getLeaveTypeBadge(leave.leave_type)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-semibold">Driver:</span>{' '}
                                                    {leave.driver.user.name}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Duration:</span>{' '}
                                                    {new Date(leave.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(leave.end_date).toLocaleDateString()}
                                                </div>
                                                {leave.reason && (
                                                    <div className="col-span-2 text-muted-foreground">
                                                        <span className="font-semibold">Reason:</span>{' '}
                                                        {leave.reason}
                                                    </div>
                                                )}
                                                {leave.approved_at && leave.approver && (
                                                    <div className="col-span-2 text-xs text-muted-foreground">
                                                        Processed by {leave.approver.name} on{' '}
                                                        {new Date(leave.approved_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {leave.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                                    onClick={() => handleApprove(leave.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                                    onClick={() => handleReject(leave.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Leave Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Leave Request</DialogTitle>
                        <DialogDescription>
                            Submit a new leave request for a driver
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Driver *</Label>
                            <Select
                                value={newLeave.driverId}
                                onValueChange={(value) => setNewLeave({ ...newLeave, driverId: value })}
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
                                <Label>Start Date *</Label>
                                <Input
                                    type="date"
                                    value={newLeave.startDate}
                                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date *</Label>
                                <Input
                                    type="date"
                                    value={newLeave.endDate}
                                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Leave Type *</Label>
                            <Select
                                value={newLeave.leaveType}
                                onValueChange={(value) => setNewLeave({ ...newLeave, leaveType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="vacation">Vacation</SelectItem>
                                    <SelectItem value="personal">Personal Leave</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason (Optional)</Label>
                            <Textarea
                                value={newLeave.reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                placeholder="Reason for leave request..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateLeave}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
