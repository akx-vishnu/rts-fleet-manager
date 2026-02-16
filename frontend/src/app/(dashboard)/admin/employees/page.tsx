'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { AddEmployeeModal } from '@/components/admin/employees/add-employee-modal';
import { EditEmployeeModal } from '@/components/admin/employees/edit-employee-modal';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
    id: string;
    email?: string;
    name?: string;
    phone: string;
}

interface Employee {
    id: string;
    employee_id: string;
    user: User;
    department: string;
    designation: string;
    shift_start?: string;
    shift_end?: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedEmployees = [...employees].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue, bValue;

        switch (key) {
            case 'employee_id':
                aValue = a.employee_id || '';
                bValue = b.employee_id || '';
                break;
            case 'name':
                aValue = a.user?.name || '';
                bValue = b.user?.name || '';
                break;
            case 'phone':
                aValue = a.user?.phone || '';
                bValue = b.user?.phone || '';
                break;
            case 'department':
                aValue = a.department || '';
                bValue = b.department || '';
                break;
            case 'designation':
                aValue = a.designation || '';
                bValue = b.designation || '';
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return <span className="text-gray-300"> ↑↓</span>;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                <div className="flex items-center space-x-2">
                    <AddEmployeeModal onEmployeeAdded={fetchEmployees} />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => handleSort('employee_id')} className="cursor-pointer hover:bg-gray-50">
                                        Emp ID {renderSortIcon('employee_id')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-gray-50">
                                        Name {renderSortIcon('name')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('phone')} className="cursor-pointer hover:bg-gray-50">
                                        Phone {renderSortIcon('phone')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('department')} className="cursor-pointer hover:bg-gray-50">
                                        Department {renderSortIcon('department')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('designation')} className="cursor-pointer hover:bg-gray-50">
                                        Designation {renderSortIcon('designation')}
                                    </TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-bold text-blue-600">
                                            {employee.employee_id}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {employee.user?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>{employee.user?.phone}</TableCell>
                                        <TableCell>{employee.department}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{employee.designation}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {employee.shift_start} - {employee.shift_end}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingEmployee(employee)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sortedEmployees.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {
                editingEmployee && (
                    <EditEmployeeModal
                        employee={editingEmployee}
                        onClose={() => setEditingEmployee(null)}
                        onEmployeeUpdated={fetchEmployees}
                    />
                )
            }
        </div >
    );
}
