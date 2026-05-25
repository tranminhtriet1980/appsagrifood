import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#c0c1ff",
        "primary-fixed": "#e1e0ff",
        "primary-fixed-dim": "#c0c1ff",
        "on-primary": "#1000a9",
        "on-primary-fixed": "#07006c",
        "on-primary-fixed-variant": "#2f2ebe",
        "primary-container": "#8083ff",
        "on-primary-container": "#0d0096",
        
        "secondary": "#b9c8de",
        "secondary-fixed": "#d4e4fa",
        "secondary-fixed-dim": "#b9c8de",
        "on-secondary": "#233143",
        "on-secondary-fixed": "#0d1c2d",
        "on-secondary-fixed-variant": "#39485a",
        "secondary-container": "#39485a",
        "on-secondary-container": "#a7b6cc",
        
        "tertiary": "#ffb783",
        "tertiary-fixed": "#ffdcc5",
        "tertiary-fixed-dim": "#ffb783",
        "on-tertiary": "#4f2500",
        "on-tertiary-fixed": "#301400",
        "on-tertiary-fixed-variant": "#703700",
        "tertiary-container": "#d97721",
        "on-tertiary-container": "#452000",
        
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        
        "background": "#0b1326",
        "on-background": "#dae2fd",
        "surface": "#0b1326",
        "surface-dim": "#0b1326",
        "surface-bright": "#31394d",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#c7c4d7",
        
        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "status-success": "#10B981",
        
        "outline": "#908fa0",
        "outline-variant": "#464554",
        "inverse-surface": "#dae2fd",
        "inverse-on-surface": "#283044",
        "inverse-primary": "#494bd6",
        "surface-tint": "#c0c1ff"
      },
      spacing: {
        "sm": "8px",
        "base": "4px",
        "lg": "24px",
        "xs": "4px",
        "gutter": "16px",
        "margin-mobile": "16px",
        "xl": "32px",
        "md": "16px",
        "margin-desktop": "32px"
      },
      fontFamily: {
        "display-lg": ["Geist", "sans-serif"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "body-sm": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "display-lg-mobile": ["Geist", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "body-lg": ["Geist", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-md": ["20px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "display-lg-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
        "label-md": ["12px", {"lineHeight": "1", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "label-sm": ["11px", {"lineHeight": "1", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [],
};
export default config;
