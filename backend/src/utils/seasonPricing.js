/**
 * Auto-calculate amount from lead km using season pricing and country currency rate.
 * Example: 10 km × ₹10/km × 90 (currency per rupees) = ₹9,000
 */
const calculateLeadAmountByKm = (km, season = {}, country = {}) => {
  const distance = Number(km) || 0;
  const seasonRate = Number(season.price_per_km ?? season.pricePerKm ?? 0);
  const currencyPerRupees = Number(
    country.currency_per_rupees ?? country.currencyPerRupees ?? 1
  );
  const multiplier = Number.isFinite(currencyPerRupees) ? currencyPerRupees : 1;
  return Number(Math.max(0, distance * seasonRate * multiplier).toFixed(2));
};

module.exports = { calculateLeadAmountByKm };
