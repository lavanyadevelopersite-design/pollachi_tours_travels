-- Tours & Travels CRM — MySQL schema generated from Sequelize models
-- Tables:
--   roles, permissions, role_permissions, branches, users,
--   refresh_tokens, token_blacklist, destinations, suppliers, packages,
--   hotels, vehicles, lead_status_master, leads, enquiries, follow_ups,
--   quotations, bookings, invoices, receipts, expenses, cancellations,
--   refunds, feedbacks, itineraries, supplier_payments, hotel_reservations,
--   flight_bookings, vehicle_allocations, notifications, audit_logs, settings
--
-- Soft-delete (deleted_at): enabled by default (database.js paranoid: true)
-- No soft-delete (paranoid: false): permissions, role_permissions, refresh_tokens,
--   token_blacklist, audit_logs, notifications, settings
-- No updated_at (updatedAt: false): role_permissions, token_blacklist, audit_logs
-- Foreign key constraints omitted (Sequelize associations do not declare references)

CREATE DATABASE IF NOT EXISTS tours_travels_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tours_travels_crm;

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`),
  UNIQUE KEY `roles_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- permissions (paranoid: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- role_permissions (paranoid: false, updatedAt: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  `permission_id` CHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branches` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `pincode` VARCHAR(20) NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(150) NULL,
  `manager_name` VARCHAR(150) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `password` VARCHAR(255) NOT NULL,
  `role_id` CHAR(36) NULL,
  `branch_id` CHAR(36) NULL,
  `department_id` CHAR(36) NULL,
  `designation_id` CHAR(36) NULL,
  `avatar` VARCHAR(500) NULL,
  `gender` VARCHAR(20) NULL,
  `blood_group` VARCHAR(10) NULL,
  `aadhar` VARCHAR(20) NULL,
  `permanent_address` TEXT NULL,
  `has_work_experience` TINYINT(1) NOT NULL DEFAULT 0,
  `work_experience_years` INT NULL,
  `previous_company_name` VARCHAR(200) NULL,
  `previous_company_designation` VARCHAR(150) NULL,
  `previous_company_duration` VARCHAR(100) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `last_activity_at` DATETIME NULL,
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expires` DATETIME NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- refresh_tokens (paranoid: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) DEFAULT 0,
  `replaced_by` VARCHAR(500) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_token_unique` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- token_blacklist (paranoid: false, updatedAt: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id` CHAR(36) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `user_id` CHAR(36) NULL,
  `expires_at` DATETIME NOT NULL,
  `reason` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_token_unique` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `destinations` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `country` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `destinations_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- suppliers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NULL COMMENT 'hotel, vehicle, flight, general',
  `contact_person` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(150) NULL,
  `address` TEXT NULL,
  `payment_terms` VARCHAR(255) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `packages` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `destination_id` CHAR(36) NULL,
  `duration_days` INT NOT NULL DEFAULT 1,
  `duration_nights` INT NOT NULL DEFAULT 0,
  `base_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `description` TEXT NULL,
  `inclusions` TEXT NULL,
  `exclusions` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `packages_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- hotels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `destination_id` CHAR(36) NULL,
  `star_rating` INT NULL,
  `address` TEXT NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(150) NULL,
  `price_per_night` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `amenities` TEXT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hotels_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NULL,
  `capacity` INT NULL,
  `registration_number` VARCHAR(50) NULL,
  `price_per_day` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `supplier_id` CHAR(36) NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicles_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- lead_status_master
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lead_status_master` (
  `id` CHAR(36) NOT NULL,
  `lead_status` VARCHAR(100) NOT NULL,
  `button_color` VARCHAR(20) NOT NULL DEFAULT '#007BFF',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- package_terms_master
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `package_terms_master` (
  `id` CHAR(36) NOT NULL,
  `heading` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_terms_master_heading_unique` (`heading`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id` CHAR(36) NOT NULL,
  `lead_code` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NOT NULL,
  `source` VARCHAR(100) NULL,
  `status` ENUM('new','contacted','qualified','converted','lost') DEFAULT 'new',
  `destination_interest` VARCHAR(200) NULL,
  `budget` DECIMAL(12,2) NULL,
  `travel_date` DATE NULL,
  `adults` INT DEFAULT 1,
  `children` INT DEFAULT 0,
  `notes` TEXT NULL,
  `assigned_to` CHAR(36) NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `leads_lead_code_unique` (`lead_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` CHAR(36) NOT NULL,
  `enquiry_code` VARCHAR(50) NOT NULL,
  `enquiry_type` VARCHAR(50) NULL,
  `lead_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NOT NULL,
  `country_id` CHAR(36) NULL,
  `state_id` CHAR(36) NULL,
  `state_name` VARCHAR(150) NULL,
  `city_id` CHAR(36) NULL,
  `city_name` VARCHAR(150) NULL,
  `destination_id` CHAR(36) NULL,
  `package_id` CHAR(36) NULL,
  `travel_from` DATE NULL,
  `travel_to` DATE NULL,
  `travel_from_destination` VARCHAR(255) NULL,
  `travel_to_destination` VARCHAR(255) NULL,
  `travel_from_lat` DECIMAL(10,7) NULL,
  `travel_from_lng` DECIMAL(10,7) NULL,
  `travel_to_lat` DECIMAL(10,7) NULL,
  `travel_to_lng` DECIMAL(10,7) NULL,
  `approx_distance_km` DECIMAL(12,2) NULL,
  `estimated_trip_cost` DECIMAL(12,2) NULL,
  `adults` INT DEFAULT 1,
  `children` INT DEFAULT 0,
  `infants` INT DEFAULT 0,
  `budget` DECIMAL(12,2) NULL,
  `lead_source_id` CHAR(36) NULL,
  `service_required` VARCHAR(100) NULL,
  `vacation_type` VARCHAR(100) NULL,
  `lead_status_id` CHAR(36) NULL,
  `is_converted` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('open','in_progress','quoted','booked','closed','cancelled') DEFAULT 'open',
  `requirements` TEXT NULL,
  `assigned_to` CHAR(36) NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enquiries_enquiry_code_unique` (`enquiry_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `follow_ups` (
  `id` CHAR(36) NOT NULL,
  `lead_id` CHAR(36) NULL,
  `enquiry_id` CHAR(36) NULL,
  `follow_up_date` DATETIME NOT NULL,
  `type` VARCHAR(50) NULL COMMENT 'call, email, visit, whatsapp',
  `status` ENUM('pending','completed','missed','cancelled') DEFAULT 'pending',
  `notes` TEXT NULL,
  `outcome` TEXT NULL,
  `assigned_to` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- quotations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotations` (
  `id` CHAR(36) NOT NULL,
  `quotation_code` VARCHAR(50) NOT NULL,
  `enquiry_id` CHAR(36) NULL,
  `lead_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NULL,
  `package_id` CHAR(36) NULL,
  `destination_id` CHAR(36) NULL,
  `travel_from` DATE NULL,
  `travel_to` DATE NULL,
  `adults` INT DEFAULT 1,
  `children` INT DEFAULT 0,
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('draft','sent','accepted','rejected','expired') DEFAULT 'draft',
  `valid_until` DATE NULL,
  `notes` TEXT NULL,
  `line_items` JSON NULL,
  `assigned_to` CHAR(36) NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotations_quotation_code_unique` (`quotation_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` CHAR(36) NOT NULL,
  `booking_code` VARCHAR(50) NOT NULL,
  `quotation_id` CHAR(36) NULL,
  `enquiry_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NOT NULL,
  `package_id` CHAR(36) NULL,
  `destination_id` CHAR(36) NULL,
  `travel_from` DATE NOT NULL,
  `travel_to` DATE NOT NULL,
  `adults` INT DEFAULT 1,
  `children` INT DEFAULT 0,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('confirmed','pending','cancelled','completed','on_hold') DEFAULT 'pending',
  `notes` TEXT NULL,
  `assigned_to` CHAR(36) NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_booking_code_unique` (`booking_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` CHAR(36) NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL,
  `booking_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NULL,
  `invoice_date` DATE NOT NULL,
  `due_date` DATE NULL,
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('draft','sent','partial','paid','overdue','cancelled') DEFAULT 'draft',
  `line_items` JSON NULL,
  `notes` TEXT NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- receipts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `receipts` (
  `id` CHAR(36) NOT NULL,
  `receipt_number` VARCHAR(50) NOT NULL,
  `invoice_id` CHAR(36) NULL,
  `booking_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_mode` VARCHAR(50) NULL,
  `payment_date` DATE NOT NULL,
  `transaction_ref` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` CHAR(36) NOT NULL,
  `expense_code` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `booking_id` CHAR(36) NULL,
  `supplier_id` CHAR(36) NULL,
  `status` ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
  `payment_mode` VARCHAR(50) NULL,
  `receipt_file` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `expenses_expense_code_unique` (`expense_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- cancellations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cancellations` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `reason` TEXT NULL,
  `cancellation_date` DATE NOT NULL,
  `cancellation_fee` DECIMAL(12,2) DEFAULT 0.00,
  `refundable_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- refunds
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` CHAR(36) NOT NULL,
  `refund_code` VARCHAR(50) NOT NULL,
  `booking_id` CHAR(36) NULL,
  `invoice_id` CHAR(36) NULL,
  `cancellation_id` CHAR(36) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `reason` TEXT NULL,
  `status` ENUM('pending','approved','processed','rejected') DEFAULT 'pending',
  `payment_mode` VARCHAR(50) NULL,
  `processed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `branch_id` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refunds_refund_code_unique` (`refund_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- feedbacks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NULL,
  `enquiry_id` CHAR(36) NULL,
  `share_token` VARCHAR(64) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(20) NULL,
  `rating` INT NULL,
  `transportation_rating` INT NULL,
  `overall_rating` INT NULL,
  `customer_support_rating` INT NULL,
  `staff_behaviour_rating` INT NULL,
  `comments` TEXT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `submitted_at` DATETIME NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feedbacks_share_token_unique` (`share_token`),
  KEY `idx_feedbacks_enquiry` (`enquiry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- itineraries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `itineraries` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `booking_id` CHAR(36) NULL,
  `quotation_id` CHAR(36) NULL,
  `enquiry_id` CHAR(36) NULL,
  `destination_id` CHAR(36) NULL,
  `package_id` CHAR(36) NULL,
  `days` INT NOT NULL DEFAULT 1,
  `nights` INT NOT NULL DEFAULT 0,
  `from_date` DATE NULL,
  `to_date` DATE NULL,
  `cover_image` VARCHAR(500) NULL,
  `package_term_ids` JSON NULL,
  `adults` INT DEFAULT 1,
  `children` INT DEFAULT 0,
  `budget` DECIMAL(12,2) NULL,
  `preferences` JSON NULL,
  `day_wise_plan` JSON NULL,
  `is_ai_generated` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'draft',
  `confirmed_at` DATETIME NULL,
  `confirmed_by` CHAR(36) NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `details` JSON NULL,
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

-- ---------------------------------------------------------------------------
-- supplier_payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `supplier_payments` (
  `id` CHAR(36) NOT NULL,
  `supplier_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_mode` VARCHAR(50) NULL,
  `reference` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- hotel_reservations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hotel_reservations` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `hotel_id` CHAR(36) NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `rooms` INT DEFAULT 1,
  `room_type` VARCHAR(100) NULL,
  `confirmation_number` VARCHAR(100) NULL,
  `amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'confirmed',
  `notes` TEXT NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- flight_bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `flight_bookings` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `airline` VARCHAR(100) NULL,
  `flight_number` VARCHAR(50) NULL,
  `departure_airport` VARCHAR(100) NULL,
  `arrival_airport` VARCHAR(100) NULL,
  `departure_datetime` DATETIME NULL,
  `arrival_datetime` DATETIME NULL,
  `pnr` VARCHAR(50) NULL,
  `passengers` INT DEFAULT 1,
  `amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'booked',
  `notes` TEXT NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- vehicle_allocations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicle_allocations` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `vehicle_id` CHAR(36) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `driver_name` VARCHAR(150) NULL,
  `driver_phone` VARCHAR(20) NULL,
  `amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'allocated',
  `notes` TEXT NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- notifications (paranoid: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info','warning','success','error','reminder') DEFAULT 'info',
  `is_read` TINYINT(1) DEFAULT 0,
  `link` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- audit_logs (paranoid: false, updatedAt: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL,
  `action` VARCHAR(50) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `request_method` VARCHAR(10) NULL,
  `request_url` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- login_history (paranoid: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_history` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `refresh_token_id` CHAR(36) NULL,
  `login_at` DATETIME NOT NULL,
  `logout_at` DATETIME NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `device` VARCHAR(50) NULL,
  `logout_reason` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_login_history_user_id` (`user_id`),
  KEY `idx_login_history_login_at` (`login_at`),
  KEY `idx_login_history_logout_at` (`logout_at`),
  KEY `idx_login_history_refresh_token_id` (`refresh_token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- settings (paranoid: false)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` CHAR(36) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NULL,
  `type` VARCHAR(50) DEFAULT 'string',
  `group` VARCHAR(50) DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
