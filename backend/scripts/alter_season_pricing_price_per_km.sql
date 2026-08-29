-- Add price_per_km to Season Pricing master (for lead km auto-calculation)
ALTER TABLE `tt_season_pricing`
  ADD COLUMN IF NOT EXISTS `price_per_km` DECIMAL(12,2) NOT NULL DEFAULT 0.00
  AFTER `price_decrease_percent`;
