import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToRgbTriplet, shadeHex } from "@/lib/color";

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export const colorPresets: ColorPreset[] = [
  { id: "teal-lime", name: "Teal & Lime", primary: "#0E3B39", secondary: "#D7FE63" },
  { id: "navy-amber", name: "Navy & Amber", primary: "#0B2647", secondary: "#F5B93D" },
  { id: "plum-mint", name: "Plum & Mint", primary: "#3B1748", secondary: "#6EE7B7" },
  { id: "slate-cyan", name: "Slate & Cyan", primary: "#1E293B", secondary: "#22D3EE" },
  { id: "forest-gold", name: "Forest & Gold", primary: "#0F2E1D", secondary: "#F2C14E" },
  { id: "crimson-rose", name: "Crimson & Rose", primary: "#3B0D1E", secondary: "#FDA4AF" },
  { id: "midnight-violet", name: "Midnight & Violet", primary: "#161032", secondary: "#A78BFA" },
  { id: "espresso-copper", name: "Espresso & Copper", primary: "#2B1B14", secondary: "#E8A87C" },
  { id: "obsidian-emerald", name: "Obsidian & Emerald", primary: "#0A0F0D", secondary: "#34D399" },
  { id: "sapphire-ice", name: "Sapphire & Ice", primary: "#0B2545", secondary: "#8ECAE6" },
  { id: "wine-blush", name: "Wine & Blush", primary: "#3A0E1E", secondary: "#F4A8B8" },
  { id: "charcoal-lemon", name: "Charcoal & Lemon", primary: "#1F2421", secondary: "#F6E96B" },
  { id: "indigo-coral", name: "Indigo & Coral", primary: "#22214A", secondary: "#FF8C6B" },
  { id: "graphite-sky", name: "Graphite & Sky", primary: "#202325", secondary: "#7FC8F8" },
  { id: "hunter-peach", name: "Hunter & Peach", primary: "#122A1D", secondary: "#FFC7A8" },
  { id: "aubergine-gold", name: "Aubergine & Gold", primary: "#2C1338", secondary: "#EBC26E" },
  { id: "steel-rose", name: "Steel & Rose", primary: "#2A3439", secondary: "#F6A6B2" },
  { id: "ebony-turquoise", name: "Ebony & Turquoise", primary: "#101010", secondary: "#40E0D0" },
  { id: "royal-champagne", name: "Royal & Champagne", primary: "#101B4A", secondary: "#F0DCA6" },
  { id: "moss-marigold", name: "Moss & Marigold", primary: "#1D2B1A", secondary: "#F4B942" },
];

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
  preset: ColorPreset;
  setPreset: (id: string) => void;
  setCustomColors: (primary: string, secondary: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MODE_KEY = "vistapay_theme_mode";
const PRESET_KEY = "vistapay_theme_preset";
const CUSTOM_KEY = "vistapay_theme_custom";

function applyCssVars(primary: string, secondary: string) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", hexToRgbTriplet(primary));
  root.style.setProperty("--color-primary-dark", hexToRgbTriplet(shadeHex(primary, -0.25)));
  root.style.setProperty("--color-primary-light", hexToRgbTriplet(shadeHex(primary, 0.6)));
  root.style.setProperty("--color-secondary", hexToRgbTriplet(secondary));
  root.style.setProperty("--color-secondary-dark", hexToRgbTriplet(shadeHex(secondary, -0.2)));
  root.style.setProperty("--color-secondary-light", hexToRgbTriplet(shadeHex(secondary, 0.5)));
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(MODE_KEY) as Mode) || "light";
  });

  const [preset, setPresetState] = useState<ColorPreset>(() => {
    if (typeof window === "undefined") return colorPresets[0];
    const custom = localStorage.getItem(CUSTOM_KEY);
    if (custom) {
      try {
        const parsed = JSON.parse(custom) as ColorPreset;
        return parsed;
      } catch {
        /* ignore */
      }
    }
    const savedId = localStorage.getItem(PRESET_KEY);
    return colorPresets.find((p) => p.id === savedId) ?? colorPresets[0];
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    applyCssVars(preset.primary, preset.secondary);
  }, [preset]);

  const toggleMode = () => setModeState((m) => (m === "light" ? "dark" : "light"));
  const setMode = (m: Mode) => setModeState(m);

  const setPreset = (id: string) => {
    const found = colorPresets.find((p) => p.id === id);
    if (!found) return;
    setPresetState(found);
    localStorage.setItem(PRESET_KEY, id);
    localStorage.removeItem(CUSTOM_KEY);
  };

  const setCustomColors = (primary: string, secondary: string) => {
    const custom: ColorPreset = { id: "custom", name: "Custom", primary, secondary };
    setPresetState(custom);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode, preset, setPreset, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
