-- Add department & designation to users (User Master)

SET @db := DATABASE();

SET @has_department := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'department_id'
);
SET @sql := IF(
  @has_department = 0,
  'ALTER TABLE `users` ADD COLUMN `department_id` CHAR(36) NULL AFTER `branch_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_designation := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'designation_id'
);
SET @sql := IF(
  @has_designation = 0,
  'ALTER TABLE `users` ADD COLUMN `designation_id` CHAR(36) NULL AFTER `department_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_dept_idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_department_id'
);
SET @sql := IF(
  @has_dept_idx = 0,
  'ALTER TABLE `users` ADD KEY `idx_users_department_id` (`department_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_desig_idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_designation_id'
);
SET @sql := IF(
  @has_desig_idx = 0,
  'ALTER TABLE `users` ADD KEY `idx_users_designation_id` (`designation_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
