"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <section className="relative space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            {/* Animated Background Blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10"></div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="container flex max-w-[64rem] flex-col items-center gap-4 text-center"
            >
                <motion.h1 variants={item} className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    Next-Gen <span className="text-primary">Employee Transportation</span>
                </motion.h1>
                <motion.p variants={item} className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    A complete fleet management solution with real-time tracking,
                    automated rosters, and AI-powered route optimization.
                </motion.p>
                <motion.div variants={item} className="space-x-4 pt-4">
                    <Link href="/login">
                        <Button size="lg" className="gap-2 h-12 px-8 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                            Access Dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    )
}
