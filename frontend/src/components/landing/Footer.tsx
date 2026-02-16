import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full py-6 bg-background border-t border-border">
            <div className="container px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} RTS SaaS. All rights reserved.
                </p>
                <nav className="flex gap-4 sm:gap-6">
                    <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="#">
                        Privacy
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
