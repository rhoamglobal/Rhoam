export function getWalkingMinutes(
  propertyCoords?: [number, number],
  schoolCoords?: [number, number]
): number | null {
  // 🛡️ Guard against missing data
  if (!propertyCoords || !schoolCoords) return null;

  const [lat1, lng1] = propertyCoords;
  const [lat2, lng2] = schoolCoords;

  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number"
  ) {
    return null;
  }

  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

  const walkingSpeedKmPerMin = 0.083; // ~5km/h
  return Math.round(distance / walkingSpeedKmPerMin);
}