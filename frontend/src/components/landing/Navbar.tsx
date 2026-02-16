import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-xl tracking-tighter" href="/">
                    <span className="text-primary">RTS</span> SaaS
                </Link>
                <nav className="flex items-center gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                        Pricing
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
                        About
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        Log In
                    </Button>
                    <Button size="sm">Get Started</Button>
                </div>
            </div>
        </header>
    );
}
