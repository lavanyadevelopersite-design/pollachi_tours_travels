-- Enquiry Lead Capture enhancements
-- Extends existing `enquiries` table (project naming standard; not tbl_enquiry)
-- Safe to re-run only if columns do not already exist — apply once.

ALTER TABLE `enquiries`
  ADD COLUMN `enquiry_type` VARCHAR(50) NULL AFTER `enquiry_code`,
  ADD COLUMN `country_id` CHAR(36) NULL AFTER `phone`,
  ADD COLUMN `state_id` CHAR(36) NULL AFTER `country_id`,
  ADD COLUMN `city_id` CHAR(36) NULL AFTER `state_id`,
  ADD COLUMN `travel_from_destination` VARCHAR(255) NULL AFTER `travel_to`,
  ADD COLUMN `travel_to_destination` VARCHAR(255) NULL AFTER `travel_from_destination`,
  ADD COLUMN `travel_from_lat` DECIMAL(10, 7) NULL AFTER `travel_to_destination`,
  ADD COLUMN `travel_from_lng` DECIMAL(10, 7) NULL AFTER `travel_from_lat`,
  ADD COLUMN `travel_to_lat` DECIMAL(10, 7) NULL AFTER `travel_from_lng`,
  ADD COLUMN `travel_to_lng` DECIMAL(10, 7) NULL AFTER `travel_to_lat`,
  ADD COLUMN `approx_distance_km` DECIMAL(12, 2) NULL AFTER `travel_to_lng`,
  ADD COLUMN `estimated_trip_cost` DECIMAL(12, 2) NULL AFTER `approx_distance_km`,
  ADD COLUMN `infants` INT NOT NULL DEFAULT 0 AFTER `children`,
  ADD COLUMN `lead_source_id` CHAR(36) NULL AFTER `infants`,
  ADD COLUMN `service_required` VARCHAR(100) NULL AFTER `lead_source_id`,
  ADD COLUMN `lead_status_id` CHAR(36) NULL AFTER `service_required`,
  ADD COLUMN `is_converted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `lead_status_id`;
