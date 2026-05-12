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