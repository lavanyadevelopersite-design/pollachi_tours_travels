const { Country, SeasonPricing } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Trip estimated cost = Country currency rate × Season pricing value
 * (currency_per_rupees × price_per_km for the season matching travel date)
 */
const findSeasonForDate = async (travelDate) => {
  if (!travelDate) return null;
  const date = String(travelDate).slice(0, 10);

  const seasons = await SeasonPricing.findAll({
    where: { is_active: true },
    order: [
      ['priority', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });

  const matched = seasons.find((s) => {
    const start = s.start_date ? String(s.start_date).slice(0, 10) : null;
    const end = s.end_date ? String(s.end_date).slice(0, 10) : null;
    if (start && end) return date >= start && date <= end;
    if (start && !end) return date >= start;
    if (!start && end) return date <= end;
    return false;
  });

  if (matched) return matched;

  // Fallback: active season without date bounds, or first active
  return (
    seasons.find((s) => !s.start_date && !s.end_date) ||
    seasons[0] ||
    null
  );
};

const calculateTripCost = async ({ countryId, travelDate }) => {
  if (!countryId) throw new AppError('Country is required for trip cost', 400);

  const country = await Country.findByPk(countryId);
  if (!country) throw new AppError('Country not found', 404);

  const season = await findSeasonForDate(travelDate);
  const currencyRate = Number(country.currency_per_rupees ?? 1);
  const seasonValue = Number(season?.price_per_km ?? 0);
  const estimatedTripCost = Number((currencyRate * seasonValue).toFixed(2));

  return {
    estimatedTripCost,
    currencyRate,
    seasonValue,
    season: season
      ? {
          id: season.id,
          name: season.name,
          price_per_km: season.price_per_km,
          start_date: season.start_date,
          end_date: season.end_date,
        }
      : null,
    country: {
      id: country.id,
      name: country.name,
      currency_per_rupees: country.currency_per_rupees,
    },
  };
};

module.exports = {
  calculateTripCost,
  findSeasonForDate,
};
