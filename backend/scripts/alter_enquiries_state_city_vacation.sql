-- Manual state/city text + vacation type on enquiries
ALTER TABLE `enquiries`
  ADD COLUMN `state_name` VARCHAR(150) NULL AFTER `state_id`,
  ADD COLUMN `city_name` VARCHAR(150) NULL AFTER `city_id`,
  ADD COLUMN `vacation_type` VARCHAR(100) NULL AFTER `service_required`;
