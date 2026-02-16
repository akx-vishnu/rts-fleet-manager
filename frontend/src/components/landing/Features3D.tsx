'use client';

import { motion } from 'framer-motion';
import { Truck, MapPin, Users, BarChart3, Shield, Zap, Clock, Globe } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
    {
        icon: MapPin,
        title: 'Real-Time Tracking',
        description: 'Monitor your entire fleet with GPS tracking and live location updates.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Users,
        title: 'Driver Management',
        description: 'Manage driver profiles, schedules, and performance metrics efficiently.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: Truck,
        title: 'Vehicle Fleet Control',
        description: 'Comprehensive vehicle management with maintenance tracking and status monitoring.',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        description: 'Gain insights with detailed reports and performance dashboards.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        icon: Globe,
        title: 'Route Optimization',
        description: 'Plan and optimize routes for maximum efficiency and cost savings.',
        gradient: 'from-indigo-500 to-blue-500',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-level security with role-based access control and audit logs.',
        gradient: 'from-red-500 to-orange-500',
    },
    {
        icon: Zap,
        title: 'Instant Notifications',
        description: 'Real-time alerts for trips, arrivals, and important fleet events.',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        icon: Clock,
        title: 'Shift Management',
        description: 'Automated shift scheduling and roster management for optimal operations.',
        gradient: 'from-teal-500 to-cyan-500',
    },
];

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const Icon = feature.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
        >
            <div className="relative h-full p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                        {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                    </p>
                </div>

                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300`}></div>
            </div>
        </motion.div>
    );
}

export function Features3D() {
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true });

    return (
        <section id="features" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 text-sm font-medium mb-4">
                        Powerful Features
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Everything You Need to
                        <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Manage Your Fleet
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Comprehensive fleet management solution designed for enterprise-level operations
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-block p-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-2xl shadow-blue-500/20">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Ready to Transform Your Fleet Operations?
                        </h3>
                        <p className="text-blue-100 mb-6 text-lg">
                            Join leading organizations using RTS Fleet Manager
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            Start Free Trial
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
