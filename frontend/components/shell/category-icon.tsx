import {
  Droplet,
  Hammer,
  Refrigerator,
  Smartphone,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/types";

const iconMap: Record<ServiceCategory["icon"], LucideIcon> = {
  droplet: Droplet,
  zap: Zap,
  wind: Wind,
  refrigerator: Refrigerator,
  hammer: Hammer,
  smartphone: Smartphone,
};

export function categoryIcon(icon: ServiceCategory["icon"]): LucideIcon {
  return iconMap[icon];
}

interface CategoryIconProps {
  icon: ServiceCategory["icon"];
  className?: string;
}

/** Decorative category glyph; the label always sits next to it in the UI. */
export function CategoryIcon({ icon, className }: CategoryIconProps) {
  const Icon = iconMap[icon];
  return <Icon aria-hidden="true" className={className} />;
}
