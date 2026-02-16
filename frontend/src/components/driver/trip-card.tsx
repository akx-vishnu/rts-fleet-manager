'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface TripCardProps {
    trip: any;
}

export default function TripCard({ trip }: TripCardProps) {
    const isToday = new Date(trip.start_time).toDateString() === new Date().toDateString();

    return (
        <Card className="mb-4 overflow-hidden border-l-4 border-l-gray-300 hover:border-l-blue-500 transition-all">
            <CardContent className="p-0">
                <Link href={`/driver/trips/${trip.id}`} className="block p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant={trip.type === 'pickup' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                    {trip.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    {isToday ? 'Today' : format(new Date(trip.start_time), 'MMM d')}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{trip.route.name}</h3>
                        </div>
                        <Badge variant="outline" className={`
                            ${trip.status === 'ongoing' ? 'border-green-500 text-green-600 bg-green-50' :
                                trip.status === 'completed' ? 'border-gray-200 text-gray-500 bg-gray-50' :
                                    'border-blue-200 text-blue-600 bg-blue-50'}
                        `}>
                            {trip.status}
                        </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(trip.start_time), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">{trip.route.origin} → {trip.route.destination}</span>
                        </div>
                        {trip.vehicle && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{trip.vehicle.registration_number}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{trip.vehicle.model}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">View Details</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}
