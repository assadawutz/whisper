"use client";

import React, { useState } from "react";

/**
 * Premium 3-Column Grid Component
 */
export function Grid3({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full max-w-[1400px] mx-auto px-6 py-20 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Premium Card Component
 */
export function Card({
  title,
  description,
  image,
  icon,
}: {
  title?: string;
  description?: string;
  image?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative bg-white rounded-premium-lg border border-gray-100 p-2 transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2">
      {image && (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-premium bg-gray-50 mb-6">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      )}
      <div className="p-6">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-2xl font-black text-brand-primary mb-3 tracking-tight group-hover:text-brand-accent transition-colors">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-gray-500 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Premium Button Component
 */
export function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "glass";
  className?: string;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-accent shadow-premium",
    secondary:
      "bg-brand-secondary text-brand-primary hover:brightness-110 shadow-premium",
    outline:
      "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white",
    glass:
      "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
  };

  return (
    <button
      onClick={onClick}
      className={`px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Hero Section Component
 */
export function Hero({
  title,
  subtitle,
  image,
  ctaText,
  onCtaClick,
  id,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-mesh"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-secondary rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="brand" className="mb-8 animate-fadeIn">
            Next-Gen Interface
          </Badge>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.85] tracking-tighter uppercase italic animate-slideUp">
            {title.split(" ").map((word, i) => (
              <span
                key={i}
                className={i % 2 === 1 ? "text-brand-secondary" : ""}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium leading-relaxed max-w-2xl mx-auto animate-fadeIn delay-300">
              {subtitle}
            </p>
          )}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fadeIn delay-500">
            {ctaText && (
              <Button variant="secondary" onClick={onCtaClick}>
                {ctaText}
              </Button>
            )}
            <Button variant="glass">Learn Architecture</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Banner Carousel (Slider)
 */
export function BannerCarousel({
  items,
}: {
  items: { title: string; subtitle?: string; image: string }[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="relative w-full aspect-[21/9] bg-brand-primary overflow-hidden rounded-premium-xl shadow-2xl group mx-auto max-w-[1440px]">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 transform ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
        >
          <img
            src={item.image}
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
            alt={item.title}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic drop-shadow-2xl">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="text-xl font-medium opacity-80 max-w-2xl bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
                {item.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Paging */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 transition-all duration-500 rounded-full ${i === active ? "w-12 bg-brand-secondary shadow-[0_0_15px_rgba(0,224,255,0.8)]" : "w-4 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Premium Navbar
 */
export function Navbar({
  logo,
  links = [],
}: {
  logo: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px]">
      <div className="glass-panel px-10 h-20 rounded-full flex items-center justify-between">
        <div className="font-black text-2xl tracking-tighter uppercase italic flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg rotate-12 flex items-center justify-center text-white text-xs">
            W
          </div>
          {logo}
        </div>
        <div className="hidden md:flex items-center gap-10">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="text-xs font-black uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="primary" className="py-2.5 px-8">
            Portal
          </Button>
        </div>
      </div>
    </nav>
  );
}

/**
 * Component Badge
 */
export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "brand" | "success" | "error";
  className?: string;
}) {
  const styles = {
    default: "bg-surface-200 text-gray-600",
    brand:
      "bg-brand-secondary text-brand-primary shadow-[0_0_20px_rgba(0,224,255,0.3)]",
    success: "bg-emerald-500 text-white",
    error: "bg-rose-500 text-white",
  };
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Premium Footer
 */
export function Footer({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <footer
      id={id}
      className={`bg-brand-primary text-white pt-32 pb-16 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
        <div className="md:col-span-2">
          <h2 className="text-4xl font-black italic tracking-tighter mb-8 uppercase">
            Whisper<span className="text-brand-secondary">.</span>
          </h2>
          <p className="text-gray-500 max-w-sm font-medium leading-relaxed text-lg">
            Drafting the next dimension of digital experiences through AI
            orchestration.
          </p>
        </div>
        <div>
          <h4 className="font-black text-[11px] uppercase tracking-[0.25em] text-brand-secondary mb-8">
            Capabilities
          </h4>
          <ul className="space-y-6 text-sm font-bold opacity-40">
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Spatial Vision
            </li>
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Semantic Patching
            </li>
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Macro Architecture
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-[11px] uppercase tracking-[0.25em] text-brand-secondary mb-8">
            Connect
          </h4>
          <ul className="space-y-6 text-sm font-bold opacity-40">
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Network_Beta
            </li>
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Archive_v2
            </li>
            <li className="hover:opacity-100 transition-opacity cursor-pointer">
              Terminal
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-32 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
        <span>&copy; MMXXVI WHISPER_CORP_INTL</span>
        <div className="flex gap-10">
          <span>Systems_Stable</span>
          <span className="text-brand-secondary">Encrypt_AES_256</span>
        </div>
      </div>
    </footer>
  );
}
