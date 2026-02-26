'use client';

import { Button } from "@/components/ui/button";
import { Check, X, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming this exists or standard shadcn/ui toast
import api from "@/lib/api";

interface EmployeeListProps {
    stopId: string;
    tripId: string;
    tripType: string;
    employees: any[];
    onUpdate: () => void;
}

export default function EmployeeList({ stopId, tripId, tripType, employees, onUpdate }: EmployeeListProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleStatusUpdate = async (employeeId: string, status: 'boarded' | 'missed' | 'dropped') => {
        setLoading(employeeId);
        try {
            await api.post(`/driver/trips/${tripId}/stops/${stopId}/employees/${employeeId}/status`, { status });
            onUpdate();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-3">
            {employees.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No employees assigned to this stop.</p>
            ) : (
                employees.map((log) => (
                    <div key={log.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{log.employee.name}</p>
                                {log.employee.phone && (
                                    <a href={`tel:${log.employee.phone}`} className="text-xs text-blue-600 font-medium hover:underline block mt-0.5">
                                        📞 {log.employee.phone}
                                    </a>
                                )}
                                <p className="text-xs text-gray-500 mt-0.5">{log.employee.department || 'Employee'}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {log.status === 'boarded' || log.status === 'dropped' ? (
                                <span className="text-green-600 font-bold text-xs px-3 py-1 bg-green-50 rounded-full border border-green-100">
                                    {log.status === 'boarded' ? 'PICKED' : 'DROPPED'}
                                </span>
                            ) : log.status === 'missed' ? (
                                <span className="text-red-600 font-bold text-xs px-3 py-1 bg-red-50 rounded-full border border-red-100">
                                    MISSED
                                </span>
                            ) : (
                                <>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        disabled={loading === log.employee_id}
                                        onClick={() => handleStatusUpdate(log.employee_id, 'missed')}
                                        title="Missed"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    {(tripType === 'pickup' || tripType === 'both' || tripType === 'return') && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-green-700 border-green-200 hover:bg-green-50"
                                            disabled={loading === log.employee_id}
                                            onClick={() => handleStatusUpdate(log.employee_id, 'boarded')}
                                        >
                                            Pick
                                        </Button>
                                    )}
                                    {(tripType === 'drop' || tripType === 'both' || tripType === 'return') && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-blue-700 border-blue-200 hover:bg-blue-50"
                                            disabled={loading === log.employee_id}
                                            onClick={() => handleStatusUpdate(log.employee_id, 'dropped')}
                                        >
                                            Drop
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
