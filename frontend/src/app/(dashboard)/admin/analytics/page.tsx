import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Bus, Map, Users } from 'lucide-react';

export default function AnalyticsPage() {
    // Mock data for now, would fetch from API
    const stats = [
        { title: 'Total Vehicles', value: '42', icon: Bus, desc: '+2 from last month' },
        { title: 'Active Drivers', value: '38', icon: Users, desc: '90% of total fleet' },
        { title: 'Total Trips Today', value: '156', icon: Map, desc: '14 ongoing' },
        { title: 'On-Time Rate', value: '98.5%', icon: Activity, desc: 'All routes' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">Fleet performance overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Distance Traveled (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Placeholder for Chart */}
                        <div className="h-[200px] w-full bg-slate-100 flex items-center justify-center text-muted-foreground rounded-md">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
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
    );
}
