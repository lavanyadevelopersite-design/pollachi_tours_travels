/** Customer-facing pages that must work without login or session checks. */

const normalizePath = (pathname = '') => {
  const raw = String(pathname || '').split('?')[0].split('#')[0];
  const trimmed = raw.replace(/\/+$/, '') || '/';
  return trimmed.toLowerCase();
};

export const isPublicCustomerPage = (pathname = window.location.pathname) => {
  const path = normalizePath(pathname);
  return (
    /^\/itinerary\/.+/.test(path) ||
    /^\/feedback\/.+/.test(path) ||
    /^\/d\/[a-z0-9]+$/.test(path) ||
    path === '/make_your_trip' ||
    path.startsWith('/make_your_trip/') ||
    path === '/enquire' ||
    path.startsWith('/enquire/') ||
    path === '/enquiries' ||
    path === '/enquiries/success'
  );
};

/** Public customer pages should not idle-logout. CRM idle timeout is 20 minutes. */
export const isEnquirySessionExemptPage = (pathname = window.location.pathname) =>
  isPublicCustomerPage(pathname);

/** API paths that must not send auth headers or force login on 401. */
export const isPublicApiRequest = (url = '') => {
  const requestUrl = String(url);
  return (
    requestUrl.includes('/public/feedback') ||
    requestUrl.includes('/public/itineraries') ||
    requestUrl.includes('/public/enquiries') ||
    requestUrl.includes('/auth/branding')
  );
};

export const shouldSkipSessionForRequest = (url = '') =>
  isPublicApiRequest(url) || isPublicCustomerPage();
