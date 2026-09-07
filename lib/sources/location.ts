const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  India: [20.5937, 78.9629], Germany: [51.1657, 10.4515], Japan: [36.2048, 138.2529],
  'United Kingdom': [55.3781, -3.436], 'United States': [37.0902, -95.7129], Canada: [56.1304, -106.3468],
  France: [46.2276, 2.2137], Australia: [-25.2744, 133.7751], Singapore: [1.3521, 103.8198],
  Netherlands: [52.1326, 5.2913], Ireland: [53.1424, -7.6921], Spain: [40.4637, -3.7492],
  Italy: [41.8719, 12.5674], Brazil: [-14.235, -51.9253], 'United Arab Emirates': [23.4241, 53.8478],
  Switzerland: [46.8182, 8.2275], Sweden: [60.1282, 18.6435], Denmark: [56.2639, 9.5018],
  Norway: [60.472, 8.4689], Finland: [61.9241, 25.7482], Israel: [31.0461, 34.8516],
  'South Korea': [35.9078, 127.7669], China: [35.8617, 104.1954], Austria: [47.5162, 14.5501],
  Belgium: [50.5039, 4.4699], Portugal: [39.3999, -8.2245], Poland: [51.9194, 19.1451],
};

const CITY_COORDS: Record<string, [number, number]> = {
  Noida: [28.5355, 77.391], Delhi: [28.6139, 77.209], Bengaluru: [12.9716, 77.5946], Bangalore: [12.9716, 77.5946],
  Mumbai: [19.076, 72.8777], Hyderabad: [17.385, 78.4867], Pune: [18.5204, 73.8567], Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639], Gurgaon: [28.4595, 77.0266], Gurugram: [28.4595, 77.0266],
  Berlin: [52.52, 13.405], Munich: [48.1351, 11.582], Hamburg: [53.5511, 9.9937], Frankfurt: [50.1109, 8.6821],
  London: [51.5074, -0.1278], Paris: [48.8566, 2.3522], Tokyo: [35.6762, 139.6503], Osaka: [34.6937, 135.5023],
  Singapore: [1.3521, 103.8198], Toronto: [43.6532, -79.3832], Vancouver: [49.2827, -123.1207],
  'New York': [40.7128, -74.006], Boston: [42.3601, -71.0589], 'San Francisco': [37.7749, -122.4194],
  Seattle: [47.6062, -122.3321], Amsterdam: [52.3676, 4.9041], Dublin: [53.3498, -6.2603], Zurich: [47.3769, 8.5417],
};

export function normalizeLocation(country: string, city?: string | null) {
  const text = `${city ?? ''} ${country ?? ''}`;
  for (const name of Object.keys(COUNTRY_CENTROIDS)) {
    if (text.toLowerCase().includes(name.toLowerCase())) return { country: name, city: city ?? null };
  }
  return { country: country || 'Worldwide', city: city ?? null };
}

export function resolveCoordinates(country: string, city?: string | null, lat?: number, lon?: number) {
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) return [lat, lon] as [number, number];
  const text = `${city ?? ''} ${country ?? ''}`;
  for (const [name, coords] of Object.entries(CITY_COORDS)) {
    if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i').test(text)) return coords;
  }
  for (const [name, coords] of Object.entries(COUNTRY_CENTROIDS)) {
    if (text.toLowerCase().includes(name.toLowerCase())) return coords;
  }
  return null;
}
