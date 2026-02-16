import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative w-full py-24 md:py-32 lg:py-40 bg-background overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Intelligent Employee <br className="hidden md:inline" />
                        <span className="text-primary">Fleet Management</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Streamline your corporate transportation with real-time tracking, automated rostering, and efficient billing.
                    </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button size="lg" className="h-12 px-8">
                        Start Free Trial
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8">
                        Request Demo
                    </Button>
                </div>
            </div>
        </section>
    );
}
