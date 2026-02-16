"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { Loader2, Activity, Bus, Map, Users } from "lucide-react"

interface DashboardStats {
    totalUsers: number;
    totalVehicles: number;
    activeVehicles: number;
    totalTrips: number;
    onTimeRate: number;
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

    // Enhanced stats with icons
    const statsCards = [
        { title: 'Total Trips', value: stats?.totalTrips || 0, icon: Map, desc: '+20.1% from last month' },
        { title: 'Active Vehicles', value: `${stats?.activeVehicles || 0} / ${stats?.totalVehicles || 0}`, icon: Bus, desc: 'Vehicles currently on road' },
        { title: 'On-Time Rate', value: `${stats?.onTimeRate || 0}%`, icon: Activity, desc: 'Target: 95%' },
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, desc: 'Drivers & Admins' },
    ];

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

            {/* Recent Activity and Alerts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Trip #TR-8832 Started
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Driver John Doe • Route R-101
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+2m ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Vehicle V-09 Arrived at Office
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Route R-102 Completed
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+15m ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts Section */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Vehicle #104 maintenance due</p>
                                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Driver License Expiring</p>
                                    <p className="text-sm text-muted-foreground">Driver John Doe</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
