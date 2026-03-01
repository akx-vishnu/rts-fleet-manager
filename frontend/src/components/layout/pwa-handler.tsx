"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Simple JWT decoder
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

export function PWAHandler() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize Socket.io
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL);

            socketRef.current.on('connect', () => {
                console.log('[PWAHandler] Socket connected');
                setupRooms();
            });

            socketRef.current.on('notification', (payload: { title: string; body: string; data?: any }) => {
                console.log('[PWAHandler] Notification received:', payload);
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(payload.title, {
                        body: payload.body,
                        icon: "/logo.png",
                        data: payload.data
                    });
                }
            });
        }

        const setupRooms = () => {
            const token = localStorage.getItem('token');
            if (token && socketRef.current) {
                const payload = decodeJWT(token);
                if (payload) {
                    const userId = payload.sub;
                    const role = payload.role;

                    // Join driver-specific room
                    if (userId) {
                        socketRef.current.emit('joinRoom', `user_${userId}`);
                    }

                    // Join admin room
                    if (role === 'admin' || role === 'super_admin') {
                        socketRef.current.emit('joinRoom', 'admins');
                    }
                }
            }
        };

        // Function to request location permission
        const requestLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log("Location access granted:", position);
                    },
                    (error) => {
                        console.warn("Location access denied or error:", error.message);
                    },
                    { enableHighAccuracy: true }
                );
            }
        };

        // Function to request notification permission
        const requestNotifications = async () => {
            if ("Notification" in window) {
                if (Notification.permission === "default") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        console.log("Notification access granted.");
                        new Notification("RTS Fleet", {
                            body: "Notifications are now enabled!",
                            icon: "/logo.png"
                        });
                    }
                }
            }
        };

        // Trigger requests
        const handlePermissions = async () => {
            setTimeout(() => {
                requestLocation();
                requestNotifications();
                setupRooms();
            }, 2000);
        };

        handlePermissions();

        // Listen for storage changes (login/logout in other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                setupRooms();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Listen for installation event
        window.addEventListener('appinstalled', () => {
            console.log('App was installed');
            handlePermissions();
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return null;
}
