import Link from "next/link";
import { Truck } from "lucide-react";
import { Hero3D } from "@/components/landing/Hero3D";
import { Features3D } from "@/components/landing/Features3D";
import { Stats } from "@/components/landing/Stats";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="relative z-50 flex h-20 items-center justify-between px-6 lg:px-12 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white">RTS Fleet Manager</span>
            <p className="text-xs text-blue-300">Rudra Travel Service</p>
          </div>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 text-white/90 hover:text-white font-medium transition-colors duration-300"
          >
            Log In
          </Link>
          <Link
            href="/login" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Hero3D />
        <Stats />
        <Features3D />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16 border-t border-slate-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">RTS Fleet</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Redefining logistics management for the modern era. Enterprise-grade tools for Rudra Travel Service's global operations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="/login" className="hover:text-blue-400 transition-colors">Live Tracking</a></li>
                <li><a href="/login" className="hover:text-blue-400 transition-colors">Driver Portal</a></li>
                <li><a href="/login" className="hover:text-blue-400 transition-colors">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Status</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 uppercase text-xs tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </div>
                {/* Add more social icons as needed */}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:row justify-between items-center text-xs text-slate-500 gap-4">
            <p>© 2026 Rudra Travel Service. Modernized for excellence.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
