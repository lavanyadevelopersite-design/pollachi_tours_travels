-- Administration Masters: Departments & Designations
-- Run after common_masters.sql (or rely on sequelize.sync for new installs)

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
  `designation_code` VARCHAR(50) NOT NULL,
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
