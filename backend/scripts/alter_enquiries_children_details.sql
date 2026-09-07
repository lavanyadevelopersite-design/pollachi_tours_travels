-- Add children_details JSON column for enquiry child name/age capture
-- Apply once on MySQL.

ALTER TABLE `enquiries`
  ADD COLUMN `children_details` JSON NULL AFTER `children`;
