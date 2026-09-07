/**
 * Configurable image search providers.
 * Event-type curated images are preferred so suggestions match Meal / Activity / etc.
 */

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 7000;

const EVENT_TYPE_QUERIES = {
  accommodation: 'hotel room resort lobby bedroom',
  activity: 'sightseeing tour adventure outdoor activity',
  transportation: 'taxi cab bus car transfer vehicle',
  visa: 'passport visa stamp travel documents',
  meal: 'restaurant food dining plate meal cuisine',
  flight: 'airplane airport departure flight cabin',
  leisure: 'spa beach relax lounge pool vacation',
  cruise: 'cruise ship ocean deck cabin voyage',
};

/** Type-matched fallbacks (used first so UI always shows relevant images). */
const CURATED = {
  meal: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
  ],
  accommodation: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  ],
  activity: [
    'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  ],
  transportation: [
    'https://images.unsplash.com/photo-1449965403121-ad4dad6e9b1a?w=800&q=80',
    'https://images.unsplash.com/photo-1544620341-11cb2aa7b452?w=800&q=80',
    'https://images.unsplash.com/photo-1464219789935-c2d99b76be86?w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad54683f?w=800&q=80',
    'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  ],
  flight: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80',
    'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80',
    'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&q=80',
    'https://images.unsplash.com/photo-1569154941062-9a6b5e8f5a8d?w=800&q=80',
    'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800&q=80',
    'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
  ],
  visa: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  ],
  leisure: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'https://images.unsplash.com/photo-1571902943202-507c2746f8e0?w=800&q=80',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  ],
  cruise: [
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80',
    'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=800&q=80',
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
    'https://images.unsplash.com/photo-1583212292454-1fe622960f21?w=800&q=80',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  ],
};

const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
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
  } finally {
    clearTimeout(timer);
  }
};

const normalizeImage = (item) => ({
  id: item.id,
  url: item.url,
  thumb: item.thumb || item.url,
  alt: item.alt || '',
  photographer: item.photographer || null,
  provider: item.provider || 'unknown',
});

const uniqueByUrl = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url || item.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const viaUnsplash = async (query, limit, apiKey) => {
  const url =
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
    `&per_page=${limit}&orientation=landscape`;
  const data = await fetchJson(url, {
    headers: { Authorization: `Client-ID ${apiKey}` },
  });
  return (data?.results || []).map((img) =>
    normalizeImage({
      id: `unsplash-${img.id}`,
      url: img.urls?.regular || img.urls?.full,
      thumb: img.urls?.small || img.urls?.thumb,
      alt: img.alt_description || query,
      photographer: img.user?.name,
      provider: 'unsplash',
    })
  );
};

const viaPexels = async (query, limit, apiKey) => {
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=${limit}&orientation=landscape`;
  const data = await fetchJson(url, {
    headers: { Authorization: apiKey },
  });
  return (data?.photos || []).map((img) =>
    normalizeImage({
      id: `pexels-${img.id}`,
      url: img.src?.large2x || img.src?.large,
      thumb: img.src?.medium || img.src?.small,
      alt: img.alt || query,
      photographer: img.photographer,
      provider: 'pexels',
    })
  );
};

const viaPixabay = async (query, limit, apiKey) => {
  const url =
    `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${limit}`;
  const data = await fetchJson(url);
  return (data?.hits || []).map((img) =>
    normalizeImage({
      id: `pixabay-${img.id}`,
      url: img.largeImageURL || img.webformatURL,
      thumb: img.previewURL || img.webformatURL,
      alt: img.tags || query,
      photographer: img.user,
      provider: 'pixabay',
    })
  );
};

const viaGooglePlacesPhotos = async (query, limit, apiKey) => {
  const findUrl =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
    `input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos,name,place_id` +
    `&key=${encodeURIComponent(apiKey)}`;
  const found = await fetchJson(findUrl);
  const photos = found?.candidates?.[0]?.photos || [];
  return photos.slice(0, limit).map((p, i) => {
    const ref = p.photo_reference;
    const url =
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200` +
      `&photo_reference=${encodeURIComponent(ref)}&key=${encodeURIComponent(apiKey)}`;
    return normalizeImage({
      id: `google-${ref?.slice(0, 24) || i}`,
      url,
      thumb: url,
      alt: query,
      provider: 'google',
    });
  });
};

const viaOpenverse = async (query, limit) => {
  const url =
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}` +
    `&page_size=${limit}&format=json`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (itinerary-images)' },
  });
  return (data?.results || [])
    .filter((img) => img.url || img.thumbnail)
    .map((img, i) =>
      normalizeImage({
        id: `openverse-${img.id || i}`,
        url: img.url || img.thumbnail,
        thumb: img.thumbnail || img.url,
        alt: img.title || query,
        photographer: img.creator || null,
        provider: 'openverse',
      })
    );
};

const viaWikimedia = async (query, limit) => {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&gsrnamespace=6` +
    `&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;
  const data = await fetchJson(url, {
    headers: { 'User-Agent': 'ToursTravelsCRM/1.0 (itinerary-images)' },
  });
  const pages = Object.values(data?.query?.pages || {});
  return pages
    .filter((p) => p.imageinfo?.[0]?.url)
    .filter((p) => String(p.imageinfo[0].mime || '').startsWith('image/'))
    .map((p) =>
      normalizeImage({
        id: `wiki-${p.pageid}`,
        url: p.imageinfo[0].thumburl || p.imageinfo[0].url,
        thumb: p.imageinfo[0].thumburl || p.imageinfo[0].url,
        alt: p.title?.replace(/^File:/, '') || query,
        provider: 'wikimedia',
      })
    );
};

const viaCurated = (eventType, query, limit) => {
  const pool = CURATED[eventType] || CURATED.default;
  const keyword = String(eventType || query || 'travel')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return pool.slice(0, limit).map((url, i) =>
    normalizeImage({
      id: `curated-${keyword}-${i}`,
      url,
      thumb: url,
      alt: `${eventType || 'travel'} ${query || ''}`.trim(),
      provider: 'curated',
    })
  );
};

/**
 * Build search query.
 * When user types a keyword (q), use that as the primary search so "ooty" / "tea factory" match.
 * Otherwise fall back to event type + name + destination.
 */
const buildQuery = ({ q, destination, eventName, eventType }) => {
  const userQ = String(q || '').trim();
  if (userQ) {
    const parts = [userQ];
    if (destination && !userQ.toLowerCase().includes(String(destination).toLowerCase())) {
      parts.push(destination);
    }
    return parts.filter(Boolean).join(' ').trim();
  }

  const parts = [];
  if (eventType && EVENT_TYPE_QUERIES[eventType]) parts.push(EVENT_TYPE_QUERIES[eventType]);
  else if (eventType) parts.push(eventType);
  if (eventName) parts.push(eventName);
  if (destination) parts.push(destination);
  return parts.filter(Boolean).join(' ').trim() || 'travel destination';
};

const searchImages = async (params = {}) => {
  const limit = Math.min(parseInt(params.limit, 10) || 8, 20);
  const eventType = params.eventType || null;
  const userSearch = String(params.q || '').trim();
  const query = buildQuery(params);
  const cacheKey = `v3|${userSearch ? 'search' : eventType || 'none'}|${query.toLowerCase()}|${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  // Seed with type-matched curated images (used as fallback / filler)
  const curated = viaCurated(userSearch ? null : eventType, query, limit);

  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;
  const pixabayKey = process.env.PIXABAY_API_KEY;
  const preferred = (process.env.IMAGE_PROVIDER || '').toLowerCase();

  const providers = [];
  if (preferred === 'google' && googleKey) providers.push(() => viaGooglePlacesPhotos(query, limit, googleKey));
  else if (preferred === 'unsplash' && unsplashKey) providers.push(() => viaUnsplash(query, limit, unsplashKey));
  else if (preferred === 'pexels' && pexelsKey) providers.push(() => viaPexels(query, limit, pexelsKey));
  else if (preferred === 'pixabay' && pixabayKey) providers.push(() => viaPixabay(query, limit, pixabayKey));
  else if (preferred === 'wikimedia') providers.push(() => viaWikimedia(query, limit));
  else if (preferred === 'openverse') providers.push(() => viaOpenverse(query, limit));
  else if (preferred === 'curated') {
    cache.set(cacheKey, { at: Date.now(), data: curated });
    return curated;
  } else {
    if (unsplashKey) providers.push(() => viaUnsplash(query, limit, unsplashKey));
    if (pexelsKey) providers.push(() => viaPexels(query, limit, pexelsKey));
    if (pixabayKey) providers.push(() => viaPixabay(query, limit, pixabayKey));
    if (googleKey) providers.push(() => viaGooglePlacesPhotos(query, limit, googleKey));
    // Free providers help keyword search (ooty, tea factory) when no paid keys
    if (userSearch || !eventType) {
      providers.push(() => viaOpenverse(query, limit));
      providers.push(() => viaWikimedia(query, limit));
    }
  }

  let apiResults = [];
  for (const run of providers) {
    try {
      const results = await run();
      if (results?.length) {
        apiResults = results;
        break;
      }
    } catch {
      // try next
    }
  }

  // Keyword search: API results first. Typed events without search: curated first.
  const merged = userSearch
    ? uniqueByUrl([...apiResults, ...curated]).slice(0, limit)
    : eventType
      ? uniqueByUrl([...curated, ...apiResults]).slice(0, limit)
      : uniqueByUrl([...apiResults, ...curated]).slice(0, limit);

  cache.set(cacheKey, { at: Date.now(), data: merged });
  return merged;
};

module.exports = { searchImages, EVENT_TYPE_QUERIES };
