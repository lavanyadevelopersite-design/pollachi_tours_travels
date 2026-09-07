const itineraryService = require('../services/itinerary.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getFrontendItineraryUrl = (token) => itineraryService.buildFrontendShareUrl(token);

const viewPublic = asyncHandler(async (req, res) => {
  const token = String(req.params.token || '').trim();
  await itineraryService.getPublicByToken(token);

  const targetUrl = getFrontendItineraryUrl(token);
  const safeTarget = targetUrl.replace(/"/g, '&quot;');

  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Show Itinerary | Pollachi Tours and Travels</title>
  <meta property="og:title" content="Show Itinerary" />
  <meta property="og:description" content="Tap to view your travel itinerary preview." />
  <meta http-equiv="refresh" content="0;url=${safeTarget}" />
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; color: #152238; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 32px 28px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 18px 40px rgba(21,34,56,0.12); }
    a { display: inline-block; margin-top: 18px; padding: 12px 20px; border-radius: 999px; background: #128C7E; color: #fff !important; text-decoration: none; font-weight: 700; }
    p { margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <p>Your itinerary preview is ready.</p>
    <a href="${safeTarget}">Show itinerary</a>
  </div>
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</body>
</html>`);
});

const getPublic = asyncHandler(async (req, res) => {
  const data = await itineraryService.getPublicByToken(req.params.token);
  res.json(ApiResponse.success('Itinerary retrieved', data));
});

module.exports = {
  getPublic,
  viewPublic,
};