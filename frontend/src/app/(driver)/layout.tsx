'use client';

import DriverAuthGuard from '@/components/driver-auth-guard';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Map, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    useEffect(() => {
        // Prevent back navigation to login
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <DriverAuthGuard>
            <div className="flex h-screen flex-col bg-gray-50">
                <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold">
                        <span className="text-blue-600">RTS</span> Driver
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-4 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <Link href="/driver/dashboard" className={`flex flex-col items-center justify-center gap-1 ${pathname === '/driver/dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                        }`}>
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </Link>
                    <Link href="/driver/trips" className={`flex flex-col items-center justify-center gap-1 ${pathname.startsWith('/driver/trips') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                        }`}>
                        <Map className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Trips</span>
                    </Link>
                    <Link href="/driver/profile" className={`flex flex-col items-center justify-center gap-1 ${pathname === '/driver/profile' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                        }`}>
                        <User className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </Link>
                </nav>
            </div>
        </DriverAuthGuard>
    );
}
