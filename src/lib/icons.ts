import {
  Zap,
  Landmark,
  UtensilsCrossed,
  ShoppingBag,
  Megaphone,
  Palette,
  Wifi,
  Tv,
  Smartphone,
  Droplets,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Zap,
  Landmark,
  UtensilsCrossed,
  ShoppingBag,
  Megaphone,
  Palette,
  Wifi,
  Tv,
  Smartphone,
  Droplets,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Zap;
}
