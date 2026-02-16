"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Simple JWT decoder (no verification, just reading payload)
function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export default function DriverAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        // Check for token on client side
        const token = localStorage.getItem("token")

        if (!token) {
            router.push("/login")
            return
        }

        // Decode token to check user role
        const payload = decodeJWT(token)

        if (!payload) {
            // Invalid token
            localStorage.removeItem("token")
            router.push("/login")
            return
        }

        // Check if user has driver role
        const userRole = payload.role
        if (userRole !== 'driver') {
            // User is not a driver - redirect to appropriate portal
            // toast({
            //     title: "Access Denied",
            //     description: "This portal is for drivers only.",
            //     variant: "destructive"
            // })
            if (userRole === 'admin' || userRole === 'super_admin') {
                router.replace("/admin") // Use replace to prevent back navigation
            } else {
                localStorage.removeItem("token")
                router.replace("/login")
            }
            return
        }

        setAuthorized(true)
    }, [router])

    if (!authorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm text-gray-500">Verifying access...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
