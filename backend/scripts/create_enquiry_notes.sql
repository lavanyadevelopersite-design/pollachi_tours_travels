-- Enquiry notes for view-screen Add Note feature
CREATE TABLE IF NOT EXISTS `enquiry_notes` (
  `id` CHAR(36) NOT NULL,
  `enquiry_id` CHAR(36) NOT NULL,
  `note` TEXT NOT NULL,
  `created_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiry_notes_enquiry_id` (`enquiry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
