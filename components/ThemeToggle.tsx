"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  /** visual style: 'icon' = round button only, 'pill' = icon + label */
  variant?: "icon" | "pill";
  className?: string;
}

export default function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render only after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-surface-container border border-outline-variant animate-pulse ${className}`}
      />
    );
  }

  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (variant === "pill") {
    return (
      <button
        onClick={toggle}
        title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant bg-surface-container hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface text-[13px] font-medium ${className}`}
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${isDark ? "rotate-0 text-amber-400" : "rotate-180 text-indigo-500"}`}
          style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}
        >
          {isDark ? "light_mode" : "dark_mode"}
        </span>
        <span>{isDark ? "Sáng" : "Tối"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
      aria-label="Toggle theme"
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center
        bg-surface-container border border-outline-variant
        hover:bg-surface-container-high hover:scale-110
        active:scale-95 transition-all duration-200
        text-on-surface-variant hover:text-on-surface
        ${className}
      `}
    >
      {/* Sun icon — visible in dark mode */}
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100 text-amber-400" : "opacity-0 rotate-90 scale-50"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        light_mode
      </span>

      {/* Moon icon — visible in light mode */}
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${!isDark ? "opacity-100 rotate-0 scale-100 text-indigo-500" : "opacity-0 -rotate-90 scale-50"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        dark_mode
      </span>
    </button>
  );
}
