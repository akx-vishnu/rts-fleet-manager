import { MapPin, CalendarClock, CreditCard } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                            Key Features
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            Everything you need to manage your fleet
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            From real-time tracking to automated billing, our platform handles the complexities of employee transportation so you don't have to.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
                    <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Real-time Tracking</h3>
                        <p className="text-center text-muted-foreground">
                            Monitor your entire fleet in real-time with precise GPS tracking and delay alerts.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <CalendarClock className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Smart Rostering</h3>
                        <p className="text-center text-muted-foreground">
                            Automated scheduling algorithms that optimize routes and shift timings for maximum efficiency.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <CreditCard className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Automated Billing</h3>
                        <p className="text-center text-muted-foreground">
                            Generate error-free invoices and manage vendor payments with our integrated billing engine.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
