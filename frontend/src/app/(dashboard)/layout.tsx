"use client"

import { Sidebar } from "@/components/layout/sidebar"
import AuthGuard from "@/components/auth-guard"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 shrink-0">
                    <Sidebar />
                </aside>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Mobile Header */}
                    <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:hidden">
                        <span className="text-lg font-bold">RTS Fleet</span>
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64 border-r-0">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}
