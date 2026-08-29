-- Lead Status Master table for Tours & Travels CRM
-- Note: The application uses Sequelize sync in development. Run this script for manual DB setup.

CREATE TABLE IF NOT EXISTS `lead_status_master` (
  `id` CHAR(36) NOT NULL,
  `lead_status` VARCHAR(100) NOT NULL,
  `button_color` VARCHAR(20) NOT NULL DEFAULT '#007BFF',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_by` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lead_status_master_is_active` (`is_active`),
  KEY `idx_lead_status_master_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
