"use client";

import { useEffect } from "react";

// Đăng ký Service Worker để app cài được (PWA) & chạy khi mạng chập chờn
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Chỉ đăng ký ở production build (dev của Next hay xung đột với HMR)
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW register failed:", err));
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
