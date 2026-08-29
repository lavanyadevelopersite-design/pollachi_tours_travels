-- Add currency_per_rupees to country master for km pricing:
-- amount = km × season_price_per_km × currency_per_rupees
-- Safe to skip if column already exists.
ALTER TABLE `tt_country`
  ADD COLUMN `currency_per_rupees` DECIMAL(18,4) NOT NULL DEFAULT 1.0000
  AFTER `currency_id`;
