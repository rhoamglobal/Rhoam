import {
    Wifi,
    Droplets,
    Shield,
    Zap,
    Car,
    Wind,
    LucideIcon,
  } from "lucide-react";
  
  export const amenityIcons: Record<string, LucideIcon> = {
    wifi: Wifi,
    borehole: Droplets,
    water: Droplets,
    security: Shield,
    electricity: Zap,
    parking: Car,
    ac: Wind,
  };

  // Used by AmenitiesSelector (the filter UI) — same keys as amenityIcons
  // above, plus a human-readable label for each.
  export const amenities: {
    key: string;
    label: string;
    icon: LucideIcon;
  }[] = [
    { key: "wifi", label: "Wifi", icon: Wifi },
    { key: "borehole", label: "Borehole", icon: Droplets },
    { key: "water", label: "Water", icon: Droplets },
    { key: "security", label: "Security", icon: Shield },
    { key: "electricity", label: "Electricity", icon: Zap },
    { key: "parking", label: "Parking", icon: Car },
    { key: "ac", label: "AC", icon: Wind },
  ];