'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Truck, Phone, Mail, FileText, Hash } from 'lucide-react';

export default function DriverProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const [profileRes, tripsRes] = await Promise.all([
                api.get('/driver/me'),
                api.get('/driver/trips')
            ]);

            setProfile(profileRes.data);

            // Get vehicle from latest trip
            const activeTrips = tripsRes.data.filter((t: any) =>
                t.status === 'scheduled' || t.status === 'ongoing'
            );

            const latestTrip = activeTrips[0];
            if (latestTrip?.vehicle) {
                setVehicle(latestTrip.vehicle);
            }
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="text-center py-10">Profile not found.</div>;
    }

    // Handle case where profile is just user data (admin/employee)
    const user = profile.user || profile;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{user.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{user.phone || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {profile.license_number && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Driver Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Hash className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">License Number</p>
                                <p className="font-medium">{profile.license_number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <div className={`w-3 h-3 rounded-full ${profile.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium capitalize">{profile.status}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {vehicle ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Assigned Vehicle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <Truck className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle</p>
                                <p className="font-medium">{vehicle.model} ({vehicle.license_plate})</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Capacity</p>
                                <p className="font-medium">{vehicle.capacity} Seats</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Assigned Vehicle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">No vehicle currently assigned.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
