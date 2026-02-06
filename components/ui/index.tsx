"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "orange" | "purple" | "cyan" | "outline" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

export const Button = ({
  children,
  variant = "orange",
  size = "md",
  glow = false,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";

  const variants = {
    orange:
      "bg-gradient-sunset text-white hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1",
    purple:
      "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-500/30",
    cyan: "bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-cyan-500/30",
    outline: "border-2 border-orange-300 text-orange-600 hover:bg-orange-50",
    glass: "glass-card text-slate-900 hover:bg-white",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-base",
    lg: "px-9 py-4.5 text-lg",
    xl: "px-12 py-6 text-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glow ? "glow" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({
  children,
  className = "",
  interactive = false,
  gradient = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  gradient?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`rounded-3xl p-8 transition-all duration-500 ${
        gradient ? "bg-gradient-vibrant text-white shadow-2xl" : "glass-card"
      } ${
        interactive
          ? "hover:shadow-2xl hover:-translate-y-2 cursor-pointer hover:glow"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Badge = ({
  children,
  variant = "orange",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "orange" | "purple" | "cyan" | "glass";
  className?: string;
}) => {
  const styles: any = {
    orange: "bg-orange-100 text-orange-600 border border-orange-200",
    purple: "bg-purple-100 text-purple-600 border border-purple-200",
    cyan: "bg-cyan-100 text-cyan-600 border border-cyan-200",
    glass: "glass-card text-slate-600",
  };

  return (
    <span
      className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const GradientText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={`text-gradient-orange ${className}`}>{children}</span>;
