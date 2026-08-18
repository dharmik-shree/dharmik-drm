export interface LocationResult {
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: number;
  timezoneName: string;
}

const CITY_DATABASE: Record<string, LocationResult> = {
  mehsana: { placeName: "Mehsana, Gujarat, India", latitude: 23.588, longitude: 72.369, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  surat: { placeName: "Surat, Gujarat, India", latitude: 21.1702, longitude: 72.8311, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  sanosara: { placeName: "Sanosara, Gujarat, India", latitude: 21.729592, longitude: 71.760765, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  ahmedabad: { placeName: "Ahmedabad, Gujarat, India", latitude: 23.0225, longitude: 72.5714, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  mumbai: { placeName: "Mumbai, Maharashtra, India", latitude: 19.076, longitude: 72.8777, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  delhi: { placeName: "Delhi, India", latitude: 28.6139, longitude: 77.209, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  newdelhi: { placeName: "New Delhi, India", latitude: 28.6139, longitude: 77.209, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  bengaluru: { placeName: "Bengaluru, Karnataka, India", latitude: 12.9716, longitude: 77.5946, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  bangalore: { placeName: "Bengaluru, Karnataka, India", latitude: 12.9716, longitude: 77.5946, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  chennai: { placeName: "Chennai, Tamil Nadu, India", latitude: 13.0827, longitude: 80.2707, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  kolkata: { placeName: "Kolkata, West Bengal, India", latitude: 22.5726, longitude: 88.3639, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  hyderabad: { placeName: "Hyderabad, Telangana, India", latitude: 17.385, longitude: 78.4867, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  pune: { placeName: "Pune, Maharashtra, India", latitude: 18.5204, longitude: 73.8567, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  jaipur: { placeName: "Jaipur, Rajasthan, India", latitude: 26.9124, longitude: 75.7873, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  rajkot: { placeName: "Rajkot, Gujarat, India", latitude: 22.3039, longitude: 70.8022, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  vadodara: { placeName: "Vadodara, Gujarat, India", latitude: 22.3072, longitude: 73.1812, timezone: 5.5, timezoneName: "Asia/Kolkata" },
  bhavnagar: { placeName: "Bhavnagar, Gujarat, India", latitude: 21.7645, longitude: 72.1519, timezone: 5.5, timezoneName: "Asia/Kolkata" },
};

export async function resolveLocation(
  query: string,
  inputLat?: number,
  inputLng?: number,
  inputTz?: number
): Promise<LocationResult> {
  if (inputLat !== undefined && inputLng !== undefined && !isNaN(inputLat) && !isNaN(inputLng)) {
    return {
      placeName: query || "Specified Location",
      latitude: inputLat,
      longitude: inputLng,
      timezone: inputTz !== undefined ? inputTz : 5.5,
      timezoneName: "Asia/Kolkata",
    };
  }

  const cleanKey = query.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  for (const [key, val] of Object.entries(CITY_DATABASE)) {
    if (cleanKey.includes(key)) {
      return val;
    }
  }

  return {
    placeName: query || "Mumbai, India",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
    timezoneName: "Asia/Kolkata",
  };
}
