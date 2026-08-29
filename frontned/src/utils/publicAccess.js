/** Customer-facing pages that must work without login or session checks. */
export const isPublicCustomerPage = (pathname = window.location.pathname) =>
  /^\/itinerary\/.+/.test(pathname) ||
  /^\/feedback\/.+/.test(pathname) ||
  pathname === '/enquiries' ||
  pathname.startsWith('/enquiries/');

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
