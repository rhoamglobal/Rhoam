// Haversine formula → calculates distance between two coordinates in KM

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const earthRadius = 6371; // KM

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

// Convert KM → walking minutes
// average walking speed ≈ 5km/h

export function kmToWalkMinutes(km: number) {
  const walkingSpeedKmPerMin = 5 / 60;

  return Math.round(km / walkingSpeedKmPerMin);
}

// Optional: human readable badge
export function getDistanceBadge(minutes: number) {
  if (minutes <= 5) return "Very close";
  if (minutes <= 10) return "Walkable";
  if (minutes <= 20) return "Moderate";
  return "Farther out";
}