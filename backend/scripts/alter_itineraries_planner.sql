-- Itinerary planner extensions (run via: node scripts/run_alter_itineraries_planner.js)

ALTER TABLE `itineraries`
  ADD COLUMN IF NOT EXISTS `nights` INT NOT NULL DEFAULT 0 AFTER `days`,
  ADD COLUMN IF NOT EXISTS `from_date` DATE NULL AFTER `nights`,
  ADD COLUMN IF NOT EXISTS `to_date` DATE NULL AFTER `from_date`,
  ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) NULL AFTER `to_date`,
  ADD COLUMN IF NOT EXISTS `package_term_ids` JSON NULL AFTER `cover_image`;

CREATE TABLE IF NOT EXISTS `itinerary_destinations` (
  `id` CHAR(36) NOT NULL,
  `itinerary_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `country` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `place_id` VARCHAR(255) NULL,
  `display_order` INT DEFAULT 0,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_itinerary_destinations_itinerary` (`itinerary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `itinerary_days` (
  `id` CHAR(36) NOT NULL,
  `itinerary_id` CHAR(36) NOT NULL,
  `day_number` INT NOT NULL,
  `date` DATE NULL,
  `destination` VARCHAR(255) NULL,
  `subject` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `status` VARCHAR(50) DEFAULT 'planned',
  `display_order` INT DEFAULT 0,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_itinerary_days_itinerary` (`itinerary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `itinerary_events` (
  `id` CHAR(36) NOT NULL,
  `itinerary_id` CHAR(36) NOT NULL,
  `itinerary_day_id` CHAR(36) NOT NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `event_time` VARCHAR(10) NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `display_order` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_itinerary_events_day` (`itinerary_day_id`),
  KEY `idx_itinerary_events_itinerary` (`itinerary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
