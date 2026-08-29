-- Add reminder flag for enquiry follow-up tasks
ALTER TABLE `follow_ups`
  ADD COLUMN `reminder` TINYINT(1) NOT NULL DEFAULT 0 AFTER `assigned_to`;
