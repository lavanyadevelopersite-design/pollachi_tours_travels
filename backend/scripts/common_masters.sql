-- Common Masters tables for Tours & Travels CRM
-- Note: The application uses Sequelize sync in development. Run this script for manual DB setup.

CREATE TABLE IF NOT EXISTS `tt_currency` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `symbol` VARCHAR(10) NOT NULL,
  `decimal_places` INT NOT NULL DEFAULT 2,
  `exchange_rate` DECIMAL(18,6) DEFAULT 1.000000,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_currency_name` (`name`),
  UNIQUE KEY `uq_tt_currency_code` (`code`),
  KEY `idx_tt_currency_is_active` (`is_active`),
  KEY `idx_tt_currency_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_country` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `iso_numeric_code` VARCHAR(10) DEFAULT NULL,
  `currency_id` CHAR(36) NOT NULL,
  `currency_per_rupees` DECIMAL(18,4) NOT NULL DEFAULT 1.0000,
  `nationality` VARCHAR(100) DEFAULT NULL,
  `phone_code` VARCHAR(20) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_country_name` (`name`),
  UNIQUE KEY `uq_tt_country_code` (`code`),
  KEY `idx_tt_country_currency_id` (`currency_id`),
  KEY `idx_tt_country_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_state` (
  `id` CHAR(36) NOT NULL,
  `country_id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_state_country_name` (`country_id`, `name`),
  KEY `idx_tt_state_country_id` (`country_id`),
  KEY `idx_tt_state_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_city` (
  `id` CHAR(36) NOT NULL,
  `country_id` CHAR(36) NOT NULL,
  `state_id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `airport_code` VARCHAR(10) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_city_state_name` (`state_id`, `name`),
  KEY `idx_tt_city_country_id` (`country_id`),
  KEY `idx_tt_city_state_id` (`state_id`),
  KEY `idx_tt_city_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_payment_mode` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `icon` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_payment_mode_name` (`name`),
  UNIQUE KEY `uq_tt_payment_mode_code` (`code`),
  KEY `idx_tt_payment_mode_is_active` (`is_active`),
  KEY `idx_tt_payment_mode_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_tax` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `tax_percentage` DECIMAL(8,2) NOT NULL,
  `tax_type` ENUM('GST','VAT','CGST','SGST','IGST','Service Tax','Other') NOT NULL DEFAULT 'GST',
  `applicable_on` ENUM('Package','Hotel','Transport','Visa','Insurance','Activities','Other') NOT NULL DEFAULT 'Package',
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_tax_name` (`name`),
  UNIQUE KEY `uq_tt_tax_code` (`code`),
  KEY `idx_tt_tax_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_season_pricing` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `price_increase_percent` DECIMAL(8,2) DEFAULT 0.00,
  `price_decrease_percent` DECIMAL(8,2) DEFAULT 0.00,
  `price_per_km` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `priority` INT DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_season_pricing_name` (`name`),
  UNIQUE KEY `uq_tt_season_pricing_code` (`code`),
  KEY `idx_tt_season_pricing_is_active` (`is_active`),
  KEY `idx_tt_season_pricing_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_expenses_type` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_expenses_type_name` (`name`),
  UNIQUE KEY `uq_tt_expenses_type_code` (`code`),
  KEY `idx_tt_expenses_type_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_departments` (
  `id` CHAR(36) NOT NULL,
  `department_code` VARCHAR(50) NOT NULL,
  `department_name` VARCHAR(150) NOT NULL,
  `department_head` CHAR(36) DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_departments_code` (`department_code`),
  UNIQUE KEY `uq_tt_departments_name` (`department_name`),
  KEY `idx_tt_departments_is_active` (`is_active`),
  KEY `idx_tt_departments_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tt_designations` (
  `id` CHAR(36) NOT NULL,
  `designation_code` VARCHAR(50) DEFAULT NULL,
  `designation_name` VARCHAR(150) NOT NULL,
  `department_id` CHAR(36) NOT NULL,
  `hierarchy_level` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tt_designations_code` (`designation_code`),
  UNIQUE KEY `uq_tt_designations_dept_name` (`department_id`, `designation_name`),
  KEY `idx_tt_designations_is_active` (`is_active`),
  KEY `idx_tt_designations_department_id` (`department_id`),
  CONSTRAINT `fk_tt_designations_department`
    FOREIGN KEY (`department_id`) REFERENCES `tt_departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
