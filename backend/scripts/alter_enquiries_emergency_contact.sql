-- Add emergency contact number to enquiries
ALTER TABLE `enquiries`
  ADD COLUMN `emergency_contact_number` VARCHAR(20) NULL AFTER `phone`;
