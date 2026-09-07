const AppError = require('../utils/AppError');

/**
 * Free driving-distance providers (no paid API).
 * Preferred: OpenRouteService (if key) → OSRM public → Geoapify (if key).
 */

const toKm = (meters, decimals = 0) => Number((Number(meters) / 1000).toFixed(decimals));
const toMinutes = (seconds) =>
  seconds == null ? null : Math.max(1, Math.round(Number(seconds) / 60));

const geocodeCache = new Map();

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

const viaOsrm = async (fromLng, fromLat, toLng, toLat, { withGeometry = false } = {}) => {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=${withGeometry ? 'full' : 'false'}` +
    (withGeometry ? '&geometries=geojson' : '');
  const data = await fetchJson(url);
  const route = data?.routes?.[0];
  const meters = route?.distance;
  if (meters == null) throw new Error('OSRM: no route');
  const geometry = route.geometry?.coordinates ? route.geometry : null;
  if (withGeometry && !geometry) throw new Error('OSRM: no geometry');
  return {
    distanceKm: toKm(meters, withGeometry ? 1 : 0),
    durationMin: toMinutes(route.duration),
    geometry,
    provider: 'osrm',
  };
};

const viaOpenRouteService = async (
  fromLng,
  fromLat,
  toLng,
  toLat,
  apiKey,
  { withGeometry = false } = {}
) => {
  const url = withGeometry
    ? 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'
    : 'https://api.openrouteservice.org/v2/directions/driving-car';
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

  if (withGeometry) {
    const feature = data?.features?.[0];
    const meters = feature?.properties?.summary?.distance;
    const geometry = feature?.geometry;
    if (meters == null || !geometry?.coordinates) throw new Error('OpenRouteService: no route');
    return {
      distanceKm: toKm(meters, 1),
      durationMin: toMinutes(feature.properties?.summary?.duration),
      geometry,
      provider: 'openrouteservice',
    };
  }

  const meters = data?.routes?.[0]?.summary?.distance;
  if (meters == null) throw new Error('OpenRouteService: no route');
  return {
    distanceKm: toKm(meters),
    durationMin: toMinutes(data.routes[0]?.summary?.duration),
    geometry: null,
    provider: 'openrouteservice',
  };
};

const viaGeoapify = async (
  fromLng,
  fromLat,
  toLng,
  toLat,
  apiKey,
  { withGeometry = false } = {}
) => {
  const url =
    `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}` +
    `&mode=drive&apiKey=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url);
  const feature = data?.features?.[0];
  const meters = feature?.properties?.distance;
  if (meters == null) throw new Error('Geoapify: no route');
  const geometry = feature?.geometry || null;
  if (withGeometry && !geometry?.coordinates) throw new Error('Geoapify: no geometry');
  return {
    distanceKm: toKm(meters, withGeometry ? 1 : 0),
    durationMin: toMinutes(feature.properties?.time),
    geometry,
    provider: 'geoapify',
  };
};

const geocodeNominatim = async (query) => {
  const q = String(query || '').trim();
  if (!q) throw new AppError('Location is required', 400);
  const cacheKey = q.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(q)}&format=json&limit=1`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (enquiry-distance)' },
  });
  if (!data?.[0]) throw new AppError(`Location not found: ${q}`, 404);
  const result = {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    label: data[0].display_name,
  };
  geocodeCache.set(cacheKey, result);
  return result;
};

const searchPlaces = async (query, limitOrOptions = 8) => {
  if (!query || String(query).trim().length < 2) return [];
  const opts =
    typeof limitOrOptions === 'object' && limitOrOptions != null
      ? limitOrOptions
      : { limit: limitOrOptions };
  const limit = Number(opts.limit) > 0 ? Number(opts.limit) : 8;
  const placeType = String(opts.placeType || '').toLowerCase();

  const params = new URLSearchParams({
    q: String(query).trim(),
    format: 'json',
    addressdetails: '1',
    limit: String(Math.min(limit + 4, 15)),
  });
  if (placeType === 'country' || placeType === 'state' || placeType === 'city') {
    params.set('featureType', placeType);
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (enquiry-places)' },
  });

  const mapped = (data || []).map((item) => {
    const address = item.address || {};
    const cityName =
      address.city || address.town || address.village || address.municipality || address.county || null;
    const stateName = address.state || address.region || address.state_district || null;
    const countryName = address.country || null;
    let name = item.name || item.display_name?.split(',')[0] || item.display_name;
    if (placeType === 'country') name = countryName || name;
    if (placeType === 'state') name = stateName || name;
    if (placeType === 'city') name = cityName || name;
    return {
      label: item.display_name,
      name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      country: countryName,
      state: stateName,
      city: cityName,
      osmType: item.type,
      osmClass: item.class,
    };
  });

  const filtered = mapped.filter((item) => {
    if (!placeType) return true;
    if (placeType === 'country') {
      return Boolean(item.country) && (item.osmType === 'administrative' || item.osmClass === 'boundary' || item.name);
    }
    if (placeType === 'state') {
      return Boolean(item.state || item.name);
    }
    if (placeType === 'city') {
      return Boolean(item.city || item.name);
    }
    return true;
  });

  const unique = [];
  const seen = new Set();
  for (const item of filtered) {
    const key = String(item.name || item.label).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
};

const resolvePoints = async ({ fromLat, fromLng, toLat, toLng, fromPlace, toPlace }) => {
  let origin = {
    lat: fromLat != null && fromLat !== '' ? Number(fromLat) : null,
    lng: fromLng != null && fromLng !== '' ? Number(fromLng) : null,
    label: fromPlace || null,
  };
  let dest = {
    lat: toLat != null && toLat !== '' ? Number(toLat) : null,
    lng: toLng != null && toLng !== '' ? Number(toLng) : null,
    label: toPlace || null,
  };

  if ((origin.lat == null || Number.isNaN(origin.lat) || origin.lng == null || Number.isNaN(origin.lng)) && fromPlace) {
    origin = await geocodeNominatim(fromPlace);
  }
  if ((dest.lat == null || Number.isNaN(dest.lat) || dest.lng == null || Number.isNaN(dest.lng)) && toPlace) {
    dest = await geocodeNominatim(toPlace);
  }

  if (
    origin.lat == null ||
    origin.lng == null ||
    dest.lat == null ||
    dest.lng == null ||
    Number.isNaN(origin.lat) ||
    Number.isNaN(origin.lng) ||
    Number.isNaN(dest.lat) ||
    Number.isNaN(dest.lng)
  ) {
    throw new AppError('From and To coordinates or place names are required', 400);
  }

  return { origin, dest };
};

const routeWithProviders = async (origin, dest, { withGeometry = false } = {}) => {
  const orsKey = process.env.OPENROUTESERVICE_API_KEY;
  const geoKey = process.env.GEOAPIFY_API_KEY;
  const errors = [];
  const opts = { withGeometry };

  if (orsKey) {
    try {
      const result = await viaOpenRouteService(origin.lng, origin.lat, dest.lng, dest.lat, orsKey, opts);
      return { ...result, from: origin, to: dest };
    } catch (err) {
      errors.push(err.message);
    }
  }

  try {
    const result = await viaOsrm(origin.lng, origin.lat, dest.lng, dest.lat, opts);
    return { ...result, from: origin, to: dest };
  } catch (err) {
    errors.push(err.message);
  }

  if (geoKey) {
    try {
      const result = await viaGeoapify(origin.lng, origin.lat, dest.lng, dest.lat, geoKey, opts);
      return { ...result, from: origin, to: dest };
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new AppError(`Unable to calculate driving distance. ${errors.join(' | ')}`, 502);
};

const calculateDrivingDistance = async (payload) => {
  const { origin, dest } = await resolvePoints(payload);
  return routeWithProviders(origin, dest, { withGeometry: false });
};

const getDrivingRoute = async (payload) => {
  const { origin, dest } = await resolvePoints(payload);
  const result = await routeWithProviders(origin, dest, { withGeometry: true });
  if (!result.geometry?.coordinates?.length) {
    throw new AppError('Unable to build driving route map', 502);
  }
  return result;
};

module.exports = {
  calculateDrivingDistance,
  getDrivingRoute,
  searchPlaces,
  geocodeNominatim,
};
