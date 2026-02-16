'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Bus, Map as MapIcon, Users, Calendar, Activity, ShieldCheck, LogOut, Briefcase, Car, Clock } from 'lucide-react';
import { memo } from 'react';

// Grouped navigation items for better UX
const operationsItems = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Live Tracking', href: '/admin/tracking', icon: Activity },
    { title: 'Trips', href: '/admin/trips', icon: Car },
    { title: 'Shifts', href: '/admin/shifts', icon: Clock },
    { title: 'Roster', href: '/admin/roster', icon: Calendar },
];

const managementItems = [
    { title: 'Routes & Stops', href: '/admin/routes', icon: MapIcon },
    { title: 'Vehicles', href: '/admin/vehicles', icon: Bus },
    { title: 'Drivers', href: '/admin/drivers', icon: Users },
    { title: 'Employees', href: '/admin/employees', icon: Briefcase },
];

const systemItems = [
    { title: 'Audit Logs', href: '/admin/audit', icon: ShieldCheck },
];

// Memoized navigation item component for performance
const NavItem = memo(({ item, isActive, onClick }: { item: typeof operationsItems[0], isActive: boolean, onClick?: () => void }) => {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-base font-medium transition-all duration-150',
                isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
        >
            <Icon className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-transform duration-150",
                isActive ? '' : 'group-hover:scale-110'
            )} />
            <span className="truncate">{item.title}</span>
        </Link>
    );
});

NavItem.displayName = 'NavItem';

// Memoized section component
const NavSection = memo(({ title, items, pathname, onLinkClick }: { title: string, items: typeof operationsItems, pathname: string, onLinkClick?: () => void }) => (
    <div className="space-y-0.5">
        <h3 className="px-3 mb-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {title}
        </h3>
        {items.map((item) => {
            // Special handling for dashboard - only active when exactly on /admin
            const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <NavItem key={item.href} item={item} isActive={isActive} onClick={onLinkClick} />;
        })}
    </div>
));

NavSection.displayName = 'NavSection';

export function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-full min-h-screen w-64 flex-col bg-gray-900 text-white border-r border-gray-800">
            {/* Brand Header */}
            <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4 shrink-0">
                <div className="text-center">
                    <h1 className="text-sm font-bold tracking-wider leading-tight text-white">RUDRA TRAVEL SERVICE</h1>
                    <p className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Fleet Manager</p>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 space-y-4 px-2 py-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <NavSection title="Operations" items={operationsItems} pathname={pathname} onLinkClick={onLinkClick} />

                <div className="border-t border-gray-800 pt-4">
                    <NavSection title="Management" items={managementItems} pathname={pathname} onLinkClick={onLinkClick} />
                </div>

                <div className="border-t border-gray-800 pt-4">
                    <NavSection title="System" items={systemItems} pathname={pathname} onLinkClick={onLinkClick} />
                </div>
            </nav>

            {/* Sign Out - Always at bottom */}
            <div className="border-t border-gray-800 p-2 shrink-0">
                <button
                    onClick={handleSignOut}
                    className="group flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-150"
                >
                    <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-red-500 transition-transform duration-150 group-hover:scale-110" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
