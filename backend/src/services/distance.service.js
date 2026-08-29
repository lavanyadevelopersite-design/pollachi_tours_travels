const AppError = require('../utils/AppError');

/**
 * Free driving-distance providers (no paid API).
 * Preferred: OpenRouteService (if key) → OSRM public → Geoapify (if key).
 */

const toKm = (meters) => Number((Number(meters) / 1000).toFixed(0));

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
};

const viaOsrm = async (fromLng, fromLat, toLng, toLat) => {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  const data = await fetchJson(url);
  const meters = data?.routes?.[0]?.distance;
  if (meters == null) throw new Error('OSRM: no route');
  return { distanceKm: toKm(meters), provider: 'osrm' };
};

const viaOpenRouteService = async (fromLng, fromLat, toLng, toLat, apiKey) => {
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
  const data = await fetchJson(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [fromLng, fromLat],
        [toLng, toLat],
      ],
    }),
  });
  const meters = data?.routes?.[0]?.summary?.distance;
  if (meters == null) throw new Error('OpenRouteService: no route');
  return { distanceKm: toKm(meters), provider: 'openrouteservice' };
};

const viaGeoapify = async (fromLng, fromLat, toLng, toLat, apiKey) => {
  const url =
    `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}` +
    `&mode=drive&apiKey=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url);
  const meters = data?.features?.[0]?.properties?.distance;
  if (meters == null) throw new Error('Geoapify: no route');
  return { distanceKm: toKm(meters), provider: 'geoapify' };
};

const geocodeNominatim = async (query) => {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}&format=json&limit=1`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (enquiry-distance)' },
  });
  if (!data?.[0]) throw new AppError(`Location not found: ${query}`, 404);
  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    label: data[0].display_name,
  };
};

const searchPlaces = async (query, limit = 8) => {
  if (!query || String(query).trim().length < 2) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (enquiry-places)' },
  });
  return (data || []).map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
};

const calculateDrivingDistance = async ({
  fromLat,
  fromLng,
  toLat,
  toLng,
  fromPlace,
  toPlace,
}) => {
  let origin = {
    lat: fromLat != null ? Number(fromLat) : null,
    lng: fromLng != null ? Number(fromLng) : null,
  };
  let dest = {
    lat: toLat != null ? Number(toLat) : null,
    lng: toLng != null ? Number(toLng) : null,
  };

  if ((origin.lat == null || origin.lng == null) && fromPlace) {
    origin = await geocodeNominatim(fromPlace);
  }
  if ((dest.lat == null || dest.lng == null) && toPlace) {
    dest = await geocodeNominatim(toPlace);
  }

  if (
    origin.lat == null ||
    origin.lng == null ||
    dest.lat == null ||
    dest.lng == null
  ) {
    throw new AppError('From and To coordinates or place names are required', 400);
  }

  const orsKey = process.env.OPENROUTESERVICE_API_KEY;
  const geoKey = process.env.GEOAPIFY_API_KEY;
  const errors = [];

  // Preferred order: OpenRouteService → OSRM → Geoapify
  if (orsKey) {
    try {
      const result = await viaOpenRouteService(origin.lng, origin.lat, dest.lng, dest.lat, orsKey);
      return { ...result, from: origin, to: dest };
    } catch (err) {
      errors.push(err.message);
    }
  }

  try {
    const result = await viaOsrm(origin.lng, origin.lat, dest.lng, dest.lat);
    return { ...result, from: origin, to: dest };
  } catch (err) {
    errors.push(err.message);
  }

  if (geoKey) {
    try {
      const result = await viaGeoapify(origin.lng, origin.lat, dest.lng, dest.lat, geoKey);
      return { ...result, from: origin, to: dest };
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new AppError(
    `Unable to calculate driving distance. ${errors.join(' | ')}`,
    502
  );
};

module.exports = {
  calculateDrivingDistance,
  searchPlaces,
  geocodeNominatim,
};
