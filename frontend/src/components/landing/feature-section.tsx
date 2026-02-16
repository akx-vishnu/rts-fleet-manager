"use client"

import { motion } from "framer-motion"
import { Shield, Truck, Map as MapIcon } from "lucide-react"

export function FeatureSection() {
    return (
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3"
            >
                <motion.div whileHover={{ y: -5 }} className="glass relative overflow-hidden rounded-xl border p-2 shadow-sm transition-all hover:shadow-md">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="p-3 w-fit rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <MapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">Live Tracking</h3>
                            <p className="text-sm text-muted-foreground">
                                Real-time GPS tracking for all your fleet vehicles.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass relative overflow-hidden rounded-xl border p-2 shadow-sm transition-all hover:shadow-md">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="p-3 w-fit rounded-lg bg-green-100 dark:bg-green-900/20">
                            <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">Secure Boarding</h3>
                            <p className="text-sm text-muted-foreground">
                                OTP and QR code based boarding for employee safety.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass relative overflow-hidden rounded-xl border p-2 shadow-sm transition-all hover:shadow-md">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="p-3 w-fit rounded-lg bg-purple-100 dark:bg-purple-900/20">
                            <Truck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">Fleet Analytics</h3>
                            <p className="text-sm text-muted-foreground">
                                Comprehensive reports on fuel, distance, and efficiency.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
