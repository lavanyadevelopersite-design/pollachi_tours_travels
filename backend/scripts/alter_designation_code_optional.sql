-- Make designation_code optional on Designation Master

ALTER TABLE `tt_designations`
  MODIFY COLUMN `designation_code` VARCHAR(50) NULL;

UPDATE `tt_designations`
  SET `designation_code` = NULL
  WHERE `designation_code` = '';
