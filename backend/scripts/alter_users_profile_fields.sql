-- Optional employee profile fields on users

SET @db := DATABASE();

SET @has_gender := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'gender'
);
SET @sql := IF(
  @has_gender = 0,
  'ALTER TABLE `users` ADD COLUMN `gender` VARCHAR(20) NULL AFTER `avatar`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_blood_group := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'blood_group'
);
SET @sql := IF(
  @has_blood_group = 0,
  'ALTER TABLE `users` ADD COLUMN `blood_group` VARCHAR(10) NULL AFTER `gender`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_aadhar := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'aadhar'
);
SET @sql := IF(
  @has_aadhar = 0,
  'ALTER TABLE `users` ADD COLUMN `aadhar` VARCHAR(20) NULL AFTER `blood_group`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_permanent_address := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permanent_address'
);
SET @sql := IF(
  @has_permanent_address = 0,
  'ALTER TABLE `users` ADD COLUMN `permanent_address` TEXT NULL AFTER `aadhar`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_work_exp := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'has_work_experience'
);
SET @sql := IF(
  @has_work_exp = 0,
  'ALTER TABLE `users` ADD COLUMN `has_work_experience` TINYINT(1) NOT NULL DEFAULT 0 AFTER `permanent_address`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_work_years := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'work_experience_years'
);
SET @sql := IF(
  @has_work_years = 0,
  'ALTER TABLE `users` ADD COLUMN `work_experience_years` INT NULL AFTER `has_work_experience`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_prev_company := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'previous_company_name'
);
SET @sql := IF(
  @has_prev_company = 0,
  'ALTER TABLE `users` ADD COLUMN `previous_company_name` VARCHAR(200) NULL AFTER `work_experience_years`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_prev_designation := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'previous_company_designation'
);
SET @sql := IF(
  @has_prev_designation = 0,
  'ALTER TABLE `users` ADD COLUMN `previous_company_designation` VARCHAR(150) NULL AFTER `previous_company_name`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_prev_duration := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'previous_company_duration'
);
SET @sql := IF(
  @has_prev_duration = 0,
  'ALTER TABLE `users` ADD COLUMN `previous_company_duration` VARCHAR(100) NULL AFTER `previous_company_designation`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
