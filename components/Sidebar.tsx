"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Eye,
  Palette,
  Bot,
  Database,
  Terminal,
  HardDrive,
} from "lucide-react";

const navItems = [
  { name: "หน้าแรก", href: "/", icon: Home, color: "orange" },
  { name: "Vision Lab", href: "/synthesis", icon: Eye, color: "purple" },
  { name: "Studio", href: "/studio", icon: Palette, color: "pink" },
  { name: "Agents", href: "/agents", icon: Bot, color: "cyan" },
  { name: "Registry", href: "/registry", icon: Database, color: "green" },
  { name: "Memory", href: "/memory", icon: HardDrive, color: "blue" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-24 flex-col items-center py-10 glass-card rounded-3xl z-100 shadow-2xl">
        {/* Logo */}
        <Link href="/" className="mb-16 group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-sunset flex items-center justify-center text-white text-3xl font-black shadow-xl glow group-hover:scale-110 transition-transform">
            W
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex items-center justify-center w-full h-16 rounded-2xl transition-all duration-300 group/item relative ${
                  isActive
                    ? "bg-gradient-sunset text-white shadow-lg scale-110"
                    : "text-slate-400 hover:text-slate-900 hover:bg-orange-50 hover:scale-105"
                }`}
              >
                <item.icon className="w-8 h-8 transition-transform group-hover/item:scale-125" />
                {isActive && (
                  <div className="absolute -right-1 w-1.5 h-8 bg-orange-500 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="mt-auto w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg pulse-glow">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 glass-card rounded-3xl z-100 shadow-2xl px-4 py-4">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? "bg-gradient-sunset text-white shadow-lg"
                    : "text-slate-400"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
