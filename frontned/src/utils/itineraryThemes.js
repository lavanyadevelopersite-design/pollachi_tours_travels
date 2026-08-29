import { publicAssetUrl } from './constants';

export const DEFAULT_ITINERARY_THEME = 'classic_voyage';

export const THEME_COVER_IMAGES = [
  publicAssetUrl('themes/cover-explore-world.png'),
  publicAssetUrl('themes/cover-beyond-dreams.png'),
];

export const ITINERARY_THEMES = [
  {
    id: 'dream_vacay',
    name: 'Dream Vacay',
    tagline: 'Hola luxury package',
    description:
      'Luxury greeting brochure: navy “hola!” cover, photo collage, trip summary, hotel options, day-wise plan, EMI banner and GST costing.',
    accent: '#00838f',
    paper: '#0b1220',
    heading: '#0b1220',
  },
  {
    id: 'scenic_escape',
    name: 'Scenic Escape',
    tagline: 'Photo itinerary booklet',
    description:
      'Photo itinerary booklet: full-bleed destination cover, scenic spreads, DAY labels with arrows, and tick / cross inclusions.',
    accent: '#2d6a4f',
    paper: '#f7f3ea',
    heading: '#1b4332',
  },
  {
    id: 'classic_voyage',
    name: 'Classic Voyage',
    tagline: 'Editorial travel dossier',
    description:
      'A refined navy-and-gold share document with letterhead, numbered days and clear costing.',
    accent: '#1e3a5f',
    paper: '#f8f5ee',
    heading: '#152238',
  },
];

export function getItineraryThemeId(itinerary) {
  const prefs =
    typeof itinerary?.preferences === 'string'
      ? (() => {
          try {
            return JSON.parse(itinerary.preferences);
          } catch {
            return {};
          }
        })()
      : itinerary?.preferences || {};
  const raw = prefs.preview_theme || itinerary?.preview_theme || DEFAULT_ITINERARY_THEME;
  return ITINERARY_THEMES.some((t) => t.id === raw) ? raw : DEFAULT_ITINERARY_THEME;
}

export function getItineraryTheme(itinerary) {
  const id = getItineraryThemeId(itinerary);
  return ITINERARY_THEMES.find((t) => t.id === id) || ITINERARY_THEMES[2];
}

export function mergePreviewTheme(preferences, themeId) {
  const prefs =
    typeof preferences === 'string'
      ? (() => {
          try {
            return JSON.parse(preferences);
          } catch {
            return {};
          }
        })()
      : { ...(preferences || {}) };
  return { ...prefs, preview_theme: themeId };
}
