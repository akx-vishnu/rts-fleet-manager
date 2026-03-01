"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { Loader2, Activity, Bus, Map, Users, Car, Clock, CheckCircle } from "lucide-react"

interface RecentActivity {
    id: string;
    action: string;
    details: string;
    user: string;
    createdAt: string;
}

interface DashboardStats {
    totalVehicles: number;
    activeVehicles: number;
    totalTrips: number;
    completedTrips: number;
    ongoingTrips: number;
    scheduledToday: number;
    onTimeRate: number;
    totalDrivers: number;
    activeDrivers: number;
    totalEmployees: number;
    recentActivity: RecentActivity[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/overview');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const statsCards = [
        { title: 'Total Trips', value: stats?.totalTrips || 0, icon: Map, desc: `${stats?.completedTrips || 0} completed` },
        { title: 'Vehicles', value: `${stats?.activeVehicles || 0} / ${stats?.totalVehicles || 0}`, icon: Bus, desc: 'Active / Total' },
        { title: 'Drivers', value: `${stats?.activeDrivers || 0} / ${stats?.totalDrivers || 0}`, icon: Users, desc: 'Active / Total' },
        { title: 'Ongoing Trips', value: stats?.ongoingTrips || 0, icon: Car, desc: `${stats?.scheduledToday || 0} scheduled today` },
    ];

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHr / 24);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        return `${diffDays}d ago`;
    };

    const formatAction = (action: string) => {
        // Convert "POST /fleet/vehicles" -> "Created Vehicle"
        // Convert "PATCH /fleet/drivers/xxx" -> "Updated Driver"
        // Convert "DELETE /routes/xxx" -> "Deleted Route"
        // Convert "LOGIN" -> "User Login"
        if (action === 'LOGIN') return 'User Login';
        if (action.includes('[FAILED]')) return action.replace('[FAILED]', '⚠ Failed');

        const method = action.split(' ')[0];
        const path = action.split(' ')[1] || '';

        let verb = method;
        if (method === 'POST') verb = 'Created';
        if (method === 'PATCH' || method === 'PUT') verb = 'Updated';
        if (method === 'DELETE') verb = 'Deleted';

        // Extract resource name from path
        const segments = path.split('/').filter(Boolean);
        let resource = segments[segments.length - 1] || 'Resource';
        // If the last segment looks like a UUID, use the one before
        if (resource.length > 20 || resource.match(/^[0-9a-f-]{36}$/)) {
            resource = segments[segments.length - 2] || 'Resource';
        }
        // Capitalize
        resource = resource.charAt(0).toUpperCase() + resource.slice(1);

        return `${verb} ${resource}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Fleet performance and analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Last updated: Just now
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} className="glass transition-all hover:scale-[1.02]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity and Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center">
                                        <div className="ml-4 space-y-1 flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none">
                                                {formatAction(activity.action)}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {activity.user}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
                                            {formatTimeAgo(activity.createdAt)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No recent activity
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">On-Time Rate</p>
                                        <p className="text-xs text-muted-foreground">Completed trips</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-green-600">{stats?.onTimeRate || 0}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                        <Car className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Completed Trips</p>
                                        <p className="text-xs text-muted-foreground">All time</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold">{stats?.completedTrips || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Scheduled Today</p>
                                        <p className="text-xs text-muted-foreground">Upcoming trips</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold">{stats?.scheduledToday || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                        <Users className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Employees</p>
                                        <p className="text-xs text-muted-foreground">Registered employees</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold">{stats?.totalEmployees || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

