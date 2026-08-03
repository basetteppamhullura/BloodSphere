// Geolocation Utility Functions for Blood Donor Network

/**
 * Calculates distance in kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // fallback default km
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Checks blood group compatibility matrix
 * Returns true if donor Blood Group can donate to recipient Blood Group
 */
export function isBloodCompatible(donorGroup, recipientGroup) {
  if (!donorGroup || !recipientGroup) return false;
  if (donorGroup === recipientGroup) return true;
  
  // O- is universal donor for all red cell donations
  if (donorGroup === "O-") return true;

  const compatibilityMap = {
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
  };

  return compatibilityMap[donorGroup]?.includes(recipientGroup) || false;
}
