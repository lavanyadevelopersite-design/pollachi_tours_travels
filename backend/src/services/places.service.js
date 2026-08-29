/**
 * Configurable place search providers.
 * Priority: GOOGLE_PLACES_API_KEY → GEOAPIFY → MAPBOX → OpenStreetMap Nominatim.
 */

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

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

const normalizePlace = (item) => ({
  name: item.name,
  label: item.label || item.name,
  latitude: item.latitude != null ? Number(item.latitude) : null,
  longitude: item.longitude != null ? Number(item.longitude) : null,
  country: item.country || null,
  state: item.state || null,
  city: item.city || null,
  place_id: item.place_id || null,
  provider: item.provider || 'unknown',
});

const viaGooglePlaces = async (query, limit, apiKey) => {
  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
    `input=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url);
  const predictions = (data?.predictions || []).slice(0, limit);
  const details = await Promise.all(
    predictions.map(async (p) => {
      try {
        const detailUrl =
          `https://maps.googleapis.com/maps/api/place/details/json?` +
          `place_id=${encodeURIComponent(p.place_id)}&fields=name,geometry,address_component,place_id` +
          `&key=${encodeURIComponent(apiKey)}`;
        const detail = await fetchJson(detailUrl);
        const r = detail?.result || {};
        const comps = r.address_components || [];
        const find = (type) =>
          comps.find((c) => c.types?.includes(type))?.long_name || null;
        return normalizePlace({
          name: r.name || p.description,
          label: p.description,
          latitude: r.geometry?.location?.lat,
          longitude: r.geometry?.location?.lng,
          country: find('country'),
          state: find('administrative_area_level_1'),
          city: find('locality') || find('administrative_area_level_2'),
          place_id: r.place_id || p.place_id,
          provider: 'google',
        });
      } catch {
        return normalizePlace({
          name: p.description,
          label: p.description,
          place_id: p.place_id,
          provider: 'google',
        });
      }
    })
  );
  return details.filter(Boolean);
};

const viaGeoapify = async (query, limit, apiKey) => {
  const url =
    `https://api.geoapify.com/v1/geocode/autocomplete?` +
    `text=${encodeURIComponent(query)}&limit=${limit}&apiKey=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url);
  return (data?.features || []).map((f) => {
    const p = f.properties || {};
    return normalizePlace({
      name: p.name || p.formatted || p.city || query,
      label: p.formatted || p.name,
      latitude: p.lat,
      longitude: p.lon,
      country: p.country,
      state: p.state,
      city: p.city || p.county,
      place_id: p.place_id || p.datasource?.raw?.place_id || null,
      provider: 'geoapify',
    });
  });
};

const viaMapbox = async (query, limit, apiKey) => {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${encodeURIComponent(apiKey)}&limit=${limit}&types=place,poi,locality,region`;
  const data = await fetchJson(url);
  return (data?.features || []).map((f) => {
    const ctx = f.context || [];
    const find = (prefix) => ctx.find((c) => String(c.id).startsWith(prefix))?.text || null;
    return normalizePlace({
      name: f.text || f.place_name,
      label: f.place_name,
      latitude: f.center?.[1],
      longitude: f.center?.[0],
      country: find('country'),
      state: find('region'),
      city: find('place') || find('locality'),
      place_id: f.id,
      provider: 'mapbox',
    });
  });
};

const viaNominatim = async (query, limit) => {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (itinerary-places)' },
  });
  return (data || []).map((item) => {
    const a = item.address || {};
    return normalizePlace({
      name: item.name || a.city || a.town || a.village || item.display_name?.split(',')[0],
      label: item.display_name,
      latitude: item.lat,
      longitude: item.lon,
      country: a.country || null,
      state: a.state || null,
      city: a.city || a.town || a.village || a.county || null,
      place_id: String(item.place_id || item.osm_id || ''),
      provider: 'openstreetmap',
    });
  });
};

const searchPlaces = async (query, limit = 8) => {
  const q = String(query || '').trim();
  if (q.length < 2) return [];

  const cacheKey = `${q.toLowerCase()}|${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  const geoapifyKey = process.env.GEOAPIFY_API_KEY;
  const mapboxKey = process.env.MAPBOX_API_KEY;
  const preferred = (process.env.PLACES_PROVIDER || '').toLowerCase();

  const providers = [];
  if (preferred === 'google' && googleKey) providers.push(() => viaGooglePlaces(q, limit, googleKey));
  else if (preferred === 'geoapify' && geoapifyKey) providers.push(() => viaGeoapify(q, limit, geoapifyKey));
  else if (preferred === 'mapbox' && mapboxKey) providers.push(() => viaMapbox(q, limit, mapboxKey));
  else if (preferred === 'openstreetmap') providers.push(() => viaNominatim(q, limit));
  else {
    if (googleKey) providers.push(() => viaGooglePlaces(q, limit, googleKey));
    if (geoapifyKey) providers.push(() => viaGeoapify(q, limit, geoapifyKey));
    if (mapboxKey) providers.push(() => viaMapbox(q, limit, mapboxKey));
    providers.push(() => viaNominatim(q, limit));
  }

  let lastError;
  for (const run of providers) {
    try {
      const results = await run();
      if (results?.length) {
        cache.set(cacheKey, { at: Date.now(), data: results });
        return results;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  return [];
};

module.exports = { searchPlaces };
