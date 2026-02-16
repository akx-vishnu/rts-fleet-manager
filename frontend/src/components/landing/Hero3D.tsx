'use client';

import { motion } from 'framer-motion';
import { Truck, Users, MapPin, BarChart3 } from 'lucide-react';

export function Hero3D() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
            {/* Background animated patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-slate-900 to-slate-900"></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02]"></div>

            <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block"
                    >
                        <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                            Enterprise Fleet Management
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl lg:text-7xl font-bold text-white leading-tight"
                    >
                        Manage Your Fleet
                        <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            In Real-Time
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-300 leading-relaxed"
                    >
                        Streamline your transportation operations with advanced tracking,
                        driver management, and route optimization powered by real-time analytics.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a
                            href="/login"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/50"
                        >
                            Get Started
                        </a>
                        <a
                            href="#features"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 backdrop-blur-sm transition-all duration-300"
                        >
                            Learn More
                        </a>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-3 gap-8 pt-8"
                    >
                        <div>
                            <div className="text-3xl font-bold text-white">99.9%</div>
                            <div className="text-sm text-gray-400">Uptime</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-sm text-gray-400">Monitoring</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">Real-Time</div>
                            <div className="text-sm text-gray-400">Updates</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right - Illustration with cards */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-[600px] flex items-center justify-center"
                >
                    {/* Central icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="relative w-64 h-64 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-2xl shadow-blue-500/50 flex items-center justify-center"
                    >
                        <Truck className="w-32 h-32 text-white" />
                    </motion.div>

                    {/* Floating info cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="absolute top-10 left-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Truck className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-white font-semibold">42 Vehicles</div>
                                <div className="text-xs text-gray-400">Active Fleet</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="absolute bottom-20 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <MapPin className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-white font-semibold">Live Tracking</div>
                                <div className="text-xs text-gray-400">GPS Enabled</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="absolute top-32 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-white font-semibold">156 Drivers</div>
                                <div className="text-xs text-gray-400">Active</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6, duration: 0.6 }}
                        className="absolute bottom-40 left-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <div className="text-white font-semibold">Real-Time</div>
                                <div className="text-xs text-gray-400">Analytics</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>
    );
}
