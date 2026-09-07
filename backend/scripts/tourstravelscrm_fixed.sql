-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 28, 2026 at 08:05 PM
-- Server version: 8.4.10-10
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

SET FOREIGN_KEY_CHECKS = 0;

--
-- Database: `tourstravelscrm`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quotation_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travel_from` date NOT NULL,
  `travel_to` date NOT NULL,
  `adults` int DEFAULT '1',
  `children` int DEFAULT '0',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `status` enum('confirmed','pending','cancelled','completed','on_hold') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `code`, `address`, `city`, `state`, `country`, `pincode`, `phone`, `email`, `manager_name`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('b063ff31-467f-441b-aea2-2fca204bf8f6', 'Pollachi Tours and Travels POY', 'BR-C72AC8E9', NULL, 'Pollachi', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:09:13', '2026-08-28 17:09:50', NULL),
('df727aac-bbf5-429f-93da-905e9db2c064', 'Pollachi Tours and Travels CBE', 'BR-95BAF6E4', NULL, 'Coimbatore', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:08:47', '2026-08-28 17:09:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cancellations`
--

CREATE TABLE `cancellations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `cancellation_date` date NOT NULL,
  `cancellation_fee` decimal(12,2) DEFAULT '0.00',
  `refundable_amount` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--

CREATE TABLE `destinations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emergency_contact_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travel_from` date DEFAULT NULL,
  `travel_to` date DEFAULT NULL,
  `travel_from_destination` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travel_to_destination` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travel_from_lat` decimal(10,7) DEFAULT NULL,
  `travel_from_lng` decimal(10,7) DEFAULT NULL,
  `travel_to_lat` decimal(10,7) DEFAULT NULL,
  `travel_to_lng` decimal(10,7) DEFAULT NULL,
  `approx_distance_km` decimal(12,2) DEFAULT NULL,
  `estimated_trip_cost` decimal(12,2) DEFAULT NULL,
  `adults` int DEFAULT '1',
  `children` int DEFAULT '0',
  `children_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `infants` int NOT NULL DEFAULT '0',
  `lead_source_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_required` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_status_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_converted` tinyint(1) NOT NULL DEFAULT '0',
  `budget` decimal(12,2) DEFAULT NULL,
  `status` enum('open','in_progress','quoted','booked','closed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `enquiries`
--

INSERT INTO `enquiries` (`id`, `enquiry_code`, `enquiry_type`, `lead_id`, `customer_name`, `email`, `phone`, `emergency_contact_number`, `country_id`, `state_id`, `city_id`, `destination_id`, `package_id`, `travel_from`, `travel_to`, `travel_from_destination`, `travel_to_destination`, `travel_from_lat`, `travel_from_lng`, `travel_to_lat`, `travel_to_lng`, `approx_distance_km`, `estimated_trip_cost`, `adults`, `children`, `children_details`, `infants`, `lead_source_id`, `service_required`, `lead_status_id`, `is_converted`, `budget`, `status`, `requirements`, `assigned_to`, `branch_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0ebddbdc-005f-48c7-8387-dea5aa2f5150', 'ENQ2026-000004', 'agent', '4afdd55b-551b-4f63-b270-348572f5677f', 'Test Bala-2', NULL, '9941004006', NULL, '7fd02122-58c7-49b2-a38d-b78eb4f3e342', '1fa6d7dc-5f6d-48ad-9ced-fc84895233fb', '1048a498-1939-4747-ad3a-40f22986eade', NULL, NULL, '2026-08-29', '2026-08-29', 'Pollachi, Coimbatore, Tamil Nadu, 642001, India', 'Madurai, Madurai South, Madurai, Tamil Nadu, India', 10.6588234, 77.0087300, 9.9261153, 78.1140983, 177.00, 0.00, 5, 2, '[{\"age\":11},{\"age\":12}]', 0, '7bdd481a-b4a9-4d65-a627-e14327a715f5', 'Transport', 'cf40b4e9-c17c-4ace-b814-496eaeaa63c5', 1, 0.00, 'open', '7 seater', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:51:35', '2026-08-28 13:51:35', NULL),
('53decc42-3b0d-43f2-8de4-2d06dee6fd94', 'ENQ2026-000002', 'client', 'ca2f480c-f927-4b9d-8aa1-0706590e7015', 'Bala', 'balachandar.er@gmail.com', '9941004006', NULL, '7fd02122-58c7-49b2-a38d-b78eb4f3e342', '1fa6d7dc-5f6d-48ad-9ced-fc84895233fb', '1048a498-1939-4747-ad3a-40f22986eade', NULL, NULL, '2026-09-04', '2026-09-06', 'Pollachi, Coimbatore, Tamil Nadu, 642001, India', 'Udhagamandalam, Nilgiris, Tamil Nadu, 643001, India', 10.6588234, 77.0087300, 11.4126769, 76.7030504, 143.00, 0.00, 2, 3, '[{\"age\":11},{\"age\":12},{\"age\":16}]', 0, '7bdd481a-b4a9-4d65-a627-e14327a715f5', 'Transport + Hotel', 'cf40b4e9-c17c-4ace-b814-496eaeaa63c5', 1, 0.00, 'open', '4 Star hotel with food, need vehicle Innova H cross.', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 09:10:43', '2026-08-28 09:10:43', NULL),
('81f233bb-4a7f-4c69-b3eb-e814d8539b97', 'ENQ2026-000003', 'client', 'a25b12ff-e37e-4dab-98f8-714982921a0a', 'Test Bala-1', 'balachandar.er@gmail.com', '9941004006', NULL, '7fd02122-58c7-49b2-a38d-b78eb4f3e342', '1fa6d7dc-5f6d-48ad-9ced-fc84895233fb', '1048a498-1939-4747-ad3a-40f22986eade', NULL, NULL, '2026-09-05', '2026-09-08', 'Pollachi, Coimbatore, Tamil Nadu, 642001, India', 'Coimbatore, Tamil Nadu, India', 10.6588234, 77.0087300, 10.8124445, 77.0796084, 23.00, 0.00, 2, 4, '[{\"age\":10},{\"age\":17},{\"age\":13},{\"age\":16}]', 0, '03a04e83-8b13-40d6-8522-b1d49e03ec88', 'Transport + Hotel', '22b5c907-d2ff-45fa-90f3-201c6371e61c', 1, 0.00, 'open', 'Need food', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:34:48', '2026-08-28 13:44:35', NULL),
('93ba5676-fab6-4355-a538-adb43375c144', 'ENQ2026-000005', 'client', '45f50043-94f8-42a9-85a5-7077477212e3', 'HariPrasadh', NULL, '9387211512', NULL, '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'd6bc577a-45c2-42d4-9a29-58525bc9d54e', '1c67d670-2b84-43ea-8abf-fedb91f75058', NULL, NULL, '2026-08-28', '2026-08-28', 'Coimbatore International Airport, Sitra - Kurumbapalayam Road, Civil Aerodrome, Ward 36, East Zone, Coimbatore, Coimbatore North, Coimbatore, Tamil Nadu, 641001, India', 'KSRTC Reservation counter, Shoranur Road, Manjakulam, Palakkad, Kerala, 678001, India', 11.0329077, 77.0427014, 10.7677229, 76.6491544, 61.00, 0.00, 18, 0, '[]', 0, '7bdd481a-b4a9-4d65-a627-e14327a715f5', 'Transport', 'c0d60287-edab-40b8-bae6-3cdad99728fb', 1, 0.00, 'open', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:30:48', '2026-08-28 16:39:21', NULL),
('a6061c1d-c738-469e-9e71-fc9c9bc2fe90', 'ENQ2026-000001', 'client', '5059c327-7b06-4393-b713-e6d23addf97d', 'Prabakaran', 'prabakaran.7009@gmail.com', '9965557009', NULL, '7fd02122-58c7-49b2-a38d-b78eb4f3e342', '1fa6d7dc-5f6d-48ad-9ced-fc84895233fb', '1048a498-1939-4747-ad3a-40f22986eade', NULL, NULL, '2026-08-28', '2026-08-28', 'Madukkarai, Coimbatore South, Coimbatore, Tamil Nadu, 641105, India', 'Udumalapettai, Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India', 10.9148303, 76.9534813, 10.5839000, 77.2500000, 60.00, 0.00, 21, 0, '[]', 0, '03a04e83-8b13-40d6-8522-b1d49e03ec88', 'Transport', '2519c449-7ebb-4fe3-886c-969a73ed2da6', 1, 0.00, 'open', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:44:19', '2026-08-28 11:42:17', NULL);


ALTER TABLE `enquiries`
  ADD COLUMN `state_name` VARCHAR(150) NULL AFTER `state_id`,
  ADD COLUMN `city_name` VARCHAR(150) NULL AFTER `city_id`,
  ADD COLUMN `vacation_type` VARCHAR(100) NULL AFTER `service_required`;
-- --------------------------------------------------------

--
-- Table structure for table `enquiry_notes`
--

CREATE TABLE `enquiry_notes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_payments`
--

CREATE TABLE `enquiry_payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quotation_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'advance',
  `payment_date` date NOT NULL,
  `payment_mode` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `advance_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `advance_percentage` decimal(8,2) DEFAULT '0.00',
  `quotation_amount` decimal(12,2) DEFAULT '0.00',
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `received_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proof_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'received',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_vehicle_assignments`
--

CREATE TABLE `enquiry_vehicle_assignments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `enquiry_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vehicle_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `driver_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `pickup_location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `drop_location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'allocated',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `trip_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `starting_km` decimal(12,2) DEFAULT NULL,
  `closing_km` decimal(12,2) DEFAULT NULL,
  `total_km` decimal(12,2) DEFAULT NULL,
  `driver_update_notes` text COLLATE utf8mb4_general_ci,
  `status_updated_at` datetime DEFAULT NULL,
  `starting_km_photo` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `closing_km_photo` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `trip_status_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ;

--
-- Dumping data for table `enquiry_vehicle_assignments`
--

INSERT INTO `enquiry_vehicle_assignments` (`id`, `enquiry_id`, `vehicle_id`, `driver_id`, `start_date`, `end_date`, `pickup_location`, `drop_location`, `amount`, `status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `trip_status`, `starting_km`, `closing_km`, `total_km`, `driver_update_notes`, `status_updated_at`, `starting_km_photo`, `closing_km_photo`, `trip_status_history`) VALUES
('24af6a8a-ba23-4c37-a732-e58e7ca7ac89', 'a6061c1d-c738-469e-9e71-fc9c9bc2fe90', '50d9924d-60d5-4c65-b601-70eb129e6c60', 'a55d6f5d-8394-45b7-891a-3e0fdf576f75', '2026-08-28', '2026-08-28', 'Madukkarai, Coimbatore South, Coimbatore, Tamil Nadu, 641105, India', 'Udumalapettai, Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India', 6000.00, 'allocated', 'Trip charge', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 11:49:56', '2026-08-28 11:49:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('3c817a36-c79b-40a6-96de-dc3ecc1e9908', '93ba5676-fab6-4355-a538-adb43375c144', '4be97a0a-73b8-4d0b-a9e3-da6e9ae00da1', NULL, '2026-08-28', '2026-08-28', 'Coimbatore International Airport, Sitra - Kurumbapalayam Road, Civil Aerodrome, Ward 36, East Zone, Coimbatore, Coimbatore North, Coimbatore, Tamil Nadu, 641001, India', 'KSRTC Reservation counter, Shoranur Road, Manjakulam, Palakkad, Kerala, 678001, India', 0.00, 'allocated', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:32:32', '2026-08-28 16:32:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_vehicle_assignment_status_logs`
--

CREATE TABLE `enquiry_vehicle_assignment_status_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recorded_at` datetime NOT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expense_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `expense_code`, `category`, `title`, `amount`, `expense_date`, `booking_id`, `supplier_id`, `status`, `payment_mode`, `receipt_file`, `notes`, `branch_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('49a64007-86e5-431d-b177-e543bd49db39', 'EXP-3A97238D', 'Vehicle Fuel', 'TN56 MN9087', 20000.00, '2026-08-28', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 11:59:04', '2026-08-28 11:59:04', NULL),
('9f2112de-2ae2-4ccc-bfa4-7d18ed68ab5b', 'EXP-79615D69', 'Employee Expenses', 'Salary', 20000.00, '2026-08-28', NULL, NULL, 'pending', NULL, NULL, NULL, 'df727aac-bbf5-429f-93da-905e9db2c064', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:09:30', '2026-08-28 17:10:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `share_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transportation_rating` int DEFAULT NULL,
  `overall_rating` int DEFAULT NULL,
  `customer_support_rating` int DEFAULT NULL,
  `staff_behaviour_rating` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `booking_id`, `customer_name`, `email`, `phone`, `rating`, `comments`, `is_published`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `enquiry_id`, `share_token`, `transportation_rating`, `overall_rating`, `customer_support_rating`, `staff_behaviour_rating`, `submitted_at`) VALUES
('0330eae9-4ff5-4cdc-b027-4e514444068f', NULL, 'Prabakaran', 'prabakaran.7009@gmail.com', '9965557009', NULL, NULL, 0, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 12:03:51', '2026-08-28 12:03:51', NULL, 'a6061c1d-c738-469e-9e71-fc9c9bc2fe90', 'bae13c8402398e8419a6009f6109f93b571d993c7222ca34', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `flight_bookings`
--

CREATE TABLE `flight_bookings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `airline` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flight_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_airport` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_airport` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_datetime` datetime DEFAULT NULL,
  `arrival_datetime` datetime DEFAULT NULL,
  `pnr` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passengers` int DEFAULT '1',
  `amount` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'booked',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follow_ups`
--

CREATE TABLE `follow_ups` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `follow_up_date` datetime NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'call, email, visit, whatsapp',
  `status` enum('pending','completed','missed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `outcome` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reminder` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `star_rating` int DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_per_night` decimal(12,2) NOT NULL DEFAULT '0.00',
  `amenities` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `name`, `code`, `destination_id`, `star_rating`, `address`, `phone`, `email`, `price_per_night`, `amenities`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('c523739b-e6f9-4b07-8990-369b8217c526', 'The Tendo Inn', 'HTL-38B5DDF6', NULL, 3, 'Pollachi', NULL, NULL, 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:17:36', '2026-08-28 16:17:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_reservations`
--

CREATE TABLE `hotel_reservations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hotel_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `rooms` int DEFAULT '1',
  `room_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmation_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'confirmed',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inclusions_exclusions_master`
--

CREATE TABLE `inclusions_exclusions_master` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('inclusion','exclusion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `heading` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `status` enum('draft','sent','partial','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `line_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `itineraries`
--

CREATE TABLE `itineraries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quotation_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `days` int NOT NULL DEFAULT '1',
  `nights` int NOT NULL DEFAULT '0',
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `cover_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_term_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `inclusion_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `exclusion_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `adults` int DEFAULT '1',
  `children` int DEFAULT '0',
  `budget` decimal(12,2) DEFAULT NULL,
  `pricing` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `day_wise_plan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `is_ai_generated` tinyint(1) DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `share_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `itinerary_days`
--

CREATE TABLE `itinerary_days` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itinerary_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day_number` int NOT NULL,
  `date` date DEFAULT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'planned',
  `display_order` int DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `itinerary_destinations`
--

CREATE TABLE `itinerary_destinations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itinerary_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `itinerary_events`
--

CREATE TABLE `itinerary_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itinerary_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itinerary_day_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `display_order` int DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('new','contacted','qualified','converted','lost') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `destination_interest` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `travel_date` date DEFAULT NULL,
  `adults` int DEFAULT '1',
  `children` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_code`, `first_name`, `last_name`, `email`, `phone`, `source`, `status`, `destination_interest`, `budget`, `travel_date`, `adults`, `children`, `notes`, `assigned_to`, `branch_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('45f50043-94f8-42a9-85a5-7077477212e3', 'LD-161F619A', 'HariPrasadh', NULL, NULL, '9387211512', 'Instagram', 'new', 'KSRTC Reservation counter, Shoranur Road, Manjakulam, Palakkad, Kerala, 678001, India', NULL, '2026-08-28', 1, 0, 'Created from enquiry ENQ2026-000005\nService: Transport', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:30:48', '2026-08-28 16:30:48', NULL),
('4afdd55b-551b-4f63-b270-348572f5677f', 'LD-DD15BD1D', 'Test', 'Bala-2', NULL, '9941004006', 'Instagram', 'new', 'Madurai, Madurai South, Madurai, Tamil Nadu, India', NULL, '2026-08-29', 5, 2, 'Created from enquiry ENQ2026-000004\nService: Transport\nChildren: 1. undefined (11 yrs), 2. undefined (12 yrs)\n7 seater', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:51:35', '2026-08-28 13:51:35', NULL),
('5059c327-7b06-4393-b713-e6d23addf97d', 'LD-92DDC1D7', 'Prabakaran', NULL, 'prabakaran.7009@gmail.com', '9965557009', 'Facebook', 'new', 'Udumalapettai, Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India', NULL, '2026-08-28', 21, 0, 'Created from enquiry ENQ2026-000001\nService: Transport', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:44:20', '2026-08-28 08:44:20', NULL),
('a25b12ff-e37e-4dab-98f8-714982921a0a', 'LD-E2B8669D', 'Test', 'Bala-1', 'balachandar.er@gmail.com', '9941004006', 'Facebook', 'new', 'Coimbatore, Tamil Nadu, India', NULL, '2026-09-05', 2, 4, 'Created from enquiry ENQ2026-000003\nService: Transport + Hotel\nChildren: 1. undefined (10 yrs), 2. undefined (17 yrs), 3. undefined (13 yrs), 4. undefined (16 yrs)\nNeed food', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:34:48', '2026-08-28 13:34:48', NULL),
('ca2f480c-f927-4b9d-8aa1-0706590e7015', 'LD-9CAA7629', 'Bala', NULL, 'balachandar.er@gmail.com', '9941004006', 'Instagram', 'new', 'Udhagamandalam, Nilgiris, Tamil Nadu, 643001, India', NULL, '2026-09-04', 2, 3, 'Created from enquiry ENQ2026-000002\nService: Transport + Hotel\nChildren: 1. undefined (11 yrs), 2. undefined (12 yrs), 3. undefined (16 yrs)\n4 Star hotel with food, need vehicle Innova H cross.', 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 09:10:43', '2026-08-28 09:10:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_source_type_master`
--

CREATE TABLE `lead_source_type_master` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lead_source_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_source_type_master`
--

INSERT INTO `lead_source_type_master` (`id`, `lead_source_type`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('03a04e83-8b13-40d6-8522-b1d49e03ec88', 'Facebook', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 07:09:38', '2026-08-28 07:09:38', NULL),
('3c171e7e-129a-4e6e-b559-a9270228c22b', 'Existing Customer', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:56:42', '2026-08-28 16:56:42', NULL),
('7118e1b6-69b4-4606-8233-1efbed875985', 'GOOGLE', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:56:09', '2026-08-28 16:56:09', NULL),
('79787b26-d07f-48d9-8ac0-b405063b5770', 'CARESOFT', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:55:52', '2026-08-28 16:55:52', NULL),
('7bdd481a-b4a9-4d65-a627-e14327a715f5', 'Instagram', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 07:09:32', '2026-08-28 07:09:32', NULL),
('8faeff46-e38b-4664-862e-654c54d528c0', 'School Friends', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:56:26', '2026-08-28 16:56:26', NULL),
('e8ad9624-011f-4c9c-b2b7-09e378855dbf', 'BNI', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:55:34', '2026-08-28 16:55:34', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_status_master`
--

CREATE TABLE `lead_status_master` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_status` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#007BFF',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_status_master`
--

INSERT INTO `lead_status_master` (`id`, `lead_status`, `button_color`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0705e7f3-8a40-4b45-94ec-df726ce8c911', 'Fully Paid', '#10B981', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('12b96a39-3b20-4dc5-9e0b-b2cdf9101c5d', 'Contacted Customer', '#06B6D4', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('1d8207c6-893f-4858-b977-14475004f1b1', 'Negotiation', '#FB923C', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('22b5c907-d2ff-45fa-90f3-201c6371e61c', 'Cancelled', '#FF0019', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-21 10:30:36', '2026-08-21 10:30:36', NULL),
('23b7a3d9-3c5a-4f5a-a25b-f21649a45ede', 'Follow up- 2', '#F97316', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('2519c449-7ebb-4fe3-886c-969a73ed2da6', 'Booking Confirmed', '#22C55E', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('34bbf414-bef5-455c-8372-b54a30f9074c', 'Itinerary Preparation', '#8B5CF6', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('70d2dfb2-20c8-48e1-8c4e-2b4f87f6bcdb', 'Assign Enquiry', '#6366F1', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('79eef343-5731-4d0b-85be-b72c2301c602', 'Feedback', '#64748B', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('7e2843e1-2a85-4ca7-914d-5307c5712eb2', 'Booking In progress', '#84CC16', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('821d9d41-e4ca-440e-a384-9b8a27960b74', 'Awaiting Advance', '#EAB308', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('83b0bd1e-5110-4682-a778-9da3414eb5ec', 'Follow up -1', '#F59E0B', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('85636da0-80f8-48c0-b6a8-b54036bc5538', 'Proposal send', '#A855F7', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('c0d60287-edab-40b8-bae6-3cdad99728fb', 'Trip Ongoing', '#0EA5E9', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('c56d3593-b746-4ace-9383-051342de0b0c', 'Trip Completed', '#059669', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('c6257a40-83a7-495e-8b36-927353314201', 'Verified/ Qualified', '#14B8A6', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL),
('cf40b4e9-c17c-4ace-b814-496eaeaa63c5', 'New Enquiry', '#3B82F6', 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', NULL, '2026-08-21 06:53:48', '2026-08-21 06:53:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_status_whatsapp_templates`
--

CREATE TABLE `lead_status_whatsapp_templates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_status_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_US',
  `include_itinerary` tinyint(1) NOT NULL DEFAULT '0',
  `header_media_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('0a472dc6-4205-40f1-8263-249f2f3ab2fa',NULL,'Vehicle_driver_assigned','Dear {{customer_name}}, ?\n\nYour trip vehicle and driver have been successfully assigned. ?\n\nTrip Details:\n? Trip Date: {{trip_date}}\n? Pickup Id: {{trip_id}}\n? Destination: {{trip_to_destination}}\n\nVehicle Details:\n? Vehicle No: {{vehicle_number}}\n? Vehicle Type: {{vehicle_type}}\n\nDriver Details:\n?‍✈️ Driver Name: {{driver_name}}\n? Driver Contact: {{driver_mobile}}\n\nPlease contact the driver directly if required.\n\nHave a safe and comfortable journey! ?\n\nThank you for choosing {{company_name}} ?',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('3295f3a2-547c-41a3-a43f-93b62dd03fb7','70d2dfb2-20c8-48e1-8c4e-2b4f87f6bcdb','Assign Enquiry','Dear {{Customer}}\n\nYour Enquiry has been Verified and Assigned.\n\nYour Trip Id is {{trip_id}}\n\nThanks for reaching Pollachi Tours & Travels',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('63f5ea5a-3974-4acc-9fd3-b45bd7d5ecde',NULL,'driver_login_credentials','? *Driver Login & Trip Details*\n\nDear *{{driver_name}}*,\n\nYour driver login account has been created successfully.\n\n? *Username:* {{username}}\n? *Password:* {{password}}\n? *Login Link:* {{login_link}}\n\n? *Assigned Trip Details:*\n• *Trip ID:* {{trip_id}}\n• *Customer Name:* {{customer_name}}\n• *Trip Date:* {{trip_date}}\n• *Pickup Location:* {{pickup_location}}\n• *Destination:* {{destination}}\n• *Vehicle No:* {{vehicle_number}}\n\nPlease log in using the above credentials and check your complete trip details.\n\n⚠️ Please keep your username and password confidential.\n\nThank you,\n*{{company_name}}*',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('6d4d40a4-64c4-4b06-b989-9a6e6181d633','2519c449-7ebb-4fe3-886c-969a73ed2da6','Booking Confirmed','Dear {{Customer}},\n\nYour Booking has been Confirmed.\n\nYour trip Id is {{trip_id}}\n\nThanks for reaching Pollachi Tours & Travels',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('92e33ecb-1577-4811-8123-36dcd417268b',NULL,'payment_Receipt','Dear {{customer_name}}, ?\n\nThank you for your payment. ?\n\nYour Payment Receipt has been generated successfully.\n\nPayment Details:\n? Receipt No: {{receipt_number}}\n? Payment Date: {{payment_date}}\n? Amount Paid: ₹{{paid_amount}}\n? Payment Mode: {{payment_mode}}\n? Trip Id: {{trip_id}}\n\nPlease find your payment receipt attached to this message. ?\n\nThank you for choosing {{company_name}} ?\nWe look forward to serving you!\n\n{{company_name}}\n? {{company_mobile}}',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('9cff0dab-12ca-42fc-87d8-16f36a1f2b1a','34bbf414-bef5-455c-8372-b54a30f9074c','Itinerary Preparation','Dear {{Customer}}\n\nGreetings from {{company_name}}!\n\nWe are happy to share your travel itinerary for your upcoming trip.\n\nDestination: {{destination}}\nTravel Dates: {{travel_dates}}\nTravellers: {{adults}} Adult(s), {{children}} Child(ren)\n\nYour detailed itinerary includes the day-wise travel plan, destinations, activities, and other trip details.\n\nKindly review the itinerary and let us know if you need any changes or customization. We will be happy to assist you.\n\nThank you for choosing {{company_name}}!\n\nContact us: {{company_phone}}',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('a8592415-2b16-44b2-8c29-ed5eab879689',NULL,'Trip_completed','? *Trip Completed Successfully*\n\nDear *{{Customer Name}}*,\n\nWe are pleased to inform you that your trip has been completed successfully.\n\n? *Trip Details:*\n• *Trip ID:* {{TRIP ID}}\n• *Trip Date:* {{TRIP DATE}}\n• *Pickup:* {{PICKUP LOCATION}}\n• *Destination:* {{DESTINATION}}\n• *Vehicle No:* {{VEHICLE NUMBER}}\n\n? *Invoice Details:*\n• *Invoice No:* {{INVOICE NUMBER}}\n• *Invoice Date:* {{INVOICE DATE}}\n• *Total Amount:* ₹ {{TOTAL AMOUNT}}\n• *Paid Amount:* ₹ {{PAID AMOUNT}}\n• *Balance Amount:* ₹ {{BALANCE AMOUNT}}\n\n? Your invoice has been shared with this message for your reference.\n\nThank you for choosing *{{Company Name}}*. We look forward to serving you again! ?',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);
insert into `lead_status_whatsapp_templates` (`id`, `lead_status_id`, `template_name`, `template_content`, `template_id`, `language_code`, `include_itinerary`, `header_media_url`, `message_notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) values('f38924bf-2eca-4283-8fb3-c34149b7cee2',NULL,'customer_feedback','⭐ *We Value Your Feedback*\n\nDear *{{Customer Name}}*,\n\nThank you for choosing *{{Company Name}}* for your recent trip. ?\n\nWe hope you had a safe and pleasant journey with us. Your feedback is very valuable and helps us improve our services.\n\nPlease take a moment to share your experience by clicking the link below:\n\n? *Feedback Link:* {{FEEDBACK LINK}}\n\nThank you for your valuable time and feedback. We look forward to serving you again! ?✨\n\n*{{Company Name}}*',NULL,'en_US','0',NULL,NULL,'1',NULL,NULL,'2026-08-28 17:45:35','2026-08-28 17:45:35',NULL);

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_at` datetime NOT NULL,
  `logout_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logout_reason` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `refresh_token_id`, `login_at`, `logout_at`, `ip_address`, `user_agent`, `device`, `logout_reason`, `created_at`, `updated_at`) VALUES
('1d6fb2fc-ba3c-4686-8b10-109a364032ff', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'e06df39d-6b65-43bc-91b8-390c7964a529', '2026-08-28 11:39:25', NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 11:39:25', '2026-08-28 11:54:29'),
('2b3947b7-359b-43a6-9ea0-abad5bdf2ade', 'f86a621a-7197-41d2-9395-b53d4205f00c', '945cbf5e-6055-4664-b49e-ef09034876d3', '2026-08-27 11:04:51', NULL, '171.79.55.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', 'Android', NULL, '2026-08-27 11:04:51', '2026-08-27 13:52:29'),
('32d7793b-8ee3-4bf4-8048-f532e8a615df', 'f86a621a-7197-41d2-9395-b53d4205f00c', '9c289764-a3e7-4be7-baa1-add0667b9782', '2026-08-27 09:43:54', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-27 09:43:54', '2026-08-27 09:43:54'),
('57d21439-222d-4239-b14c-a84098a8c232', 'f86a621a-7197-41d2-9395-b53d4205f00c', '13f5ce95-6b74-4193-a4b4-bd26c77d339e', '2026-08-28 12:07:53', NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 12:07:53', '2026-08-28 17:09:29'),
('88aa87b3-fa29-4d49-b6ed-70939631b17b', 'f86a621a-7197-41d2-9395-b53d4205f00c', '890ce962-1ff0-423c-a0fc-edb0ae952b12', '2026-08-27 09:53:01', NULL, '103.148.134.193', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Mac OS', NULL, '2026-08-27 09:53:01', '2026-08-27 09:53:01'),
('9374c6e0-6bce-4186-bada-18fe0fb6dfbe', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'ddb1a11b-f70f-4b72-b8ab-79f49381f360', '2026-08-28 07:09:10', NULL, '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 07:09:10', '2026-08-28 07:09:10'),
('a5beb7e4-6402-46f1-9eab-5bf47d22cafb', 'f86a621a-7197-41d2-9395-b53d4205f00c', '944ecb8f-c21d-4987-9351-4ac758227e75', '2026-08-28 12:06:36', '2026-08-28 12:07:18', '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', 'logout', '2026-08-28 12:06:36', '2026-08-28 12:07:18'),
('a693694d-5770-4426-9ec4-c02e9347d586', 'f86a621a-7197-41d2-9395-b53d4205f00c', '659d9ca9-5c3c-4c9d-bf8a-c50a90af258a', '2026-08-28 06:51:01', NULL, '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', 'Android', NULL, '2026-08-28 06:51:01', '2026-08-28 10:28:01'),
('ba1134b4-9d09-407b-808f-2fcfd46f9cc1', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f7fe511d-65d3-4b6f-9cc5-a4556fb86d61', '2026-08-28 17:15:54', NULL, '157.51.71.203', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 17:15:54', '2026-08-28 17:34:19'),
('c983c33d-8e2d-44a6-926e-2d67313e2f03', 'f86a621a-7197-41d2-9395-b53d4205f00c', '03fa6937-8cc4-4fd4-b6f2-7b5064c40e34', '2026-08-27 10:02:09', NULL, '27.60.166.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-27 10:02:09', '2026-08-27 10:02:09'),
('cf3580ab-fe33-4aff-9755-86793136665e', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'fcb08616-6df0-4e9e-815c-ab9e2f1462f5', '2026-08-27 09:22:21', '2026-08-27 09:26:55', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', 'logout', '2026-08-27 09:22:21', '2026-08-27 09:26:55'),
('d0ea4a12-aec5-409d-84e5-b8759ef9b20b', 'f86a621a-7197-41d2-9395-b53d4205f00c', '40911a96-afa9-4545-ab89-a4973061608b', '2026-08-28 13:14:25', NULL, '182.60.75.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 13:14:25', '2026-08-28 13:45:05'),
('d17deb50-a917-4c69-a23c-d8c3db08ca53', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'be5f4c2a-fd11-4b77-8a6a-24a771173e01', '2026-08-28 08:08:59', '2026-08-28 08:16:56', '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', 'logout', '2026-08-28 08:08:59', '2026-08-28 08:16:56'),
('de056008-7e0f-4740-80a9-9bb45d79b43e', 'f86a621a-7197-41d2-9395-b53d4205f00c', '7ea2bb5c-21c8-4bbf-adf3-b4ea6f36f3a7', '2026-08-27 09:27:22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-27 09:27:22', '2026-08-27 09:43:48'),
('e1ef4acf-4d75-40e7-b866-da7e8bf4eb01', 'f86a621a-7197-41d2-9395-b53d4205f00c', '7aeae909-0727-4535-a2df-0bd45a6d8cca', '2026-08-28 09:40:44', NULL, '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 09:40:44', '2026-08-28 10:48:57'),
('f781342f-97ca-4bd2-8f54-8a5c2e90ec1a', 'f86a621a-7197-41d2-9395-b53d4205f00c', '419b67de-0557-4087-b0f1-6909ae6b9a56', '2026-08-28 08:31:07', NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Windows', NULL, '2026-08-28 08:31:07', '2026-08-28 08:46:14');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('info','warning','success','error','reminder') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`, `metadata`, `created_at`, `updated_at`) VALUES
('1aa6b85d-9c4a-40de-942f-23fdf31ccb0f', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'New Enquiry Received', 'Enquiry ENQ2026-000004 from Test Bala-2 has been submitted.', 'info', 0, '/enquiry/view/0ebddbdc-005f-48c7-8387-dea5aa2f5150', '{\"enquiry_id\":\"0ebddbdc-005f-48c7-8387-dea5aa2f5150\",\"enquiry_code\":\"ENQ2026-000004\",\"channels\":[\"inApp\"]}', '2026-08-28 13:51:35', '2026-08-28 13:51:35'),
('7065c6cc-3266-4c64-91ce-882489729210', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'New Enquiry Received', 'Enquiry ENQ2026-000001 from Prabakaran has been submitted.', 'info', 0, '/enquiry/view/a6061c1d-c738-469e-9e71-fc9c9bc2fe90', '{\"enquiry_id\":\"a6061c1d-c738-469e-9e71-fc9c9bc2fe90\",\"enquiry_code\":\"ENQ2026-000001\",\"channels\":[\"inApp\"]}', '2026-08-28 08:44:20', '2026-08-28 08:44:20'),
('9a496573-86c3-45ea-91f4-44827c237b2e', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'New Enquiry Received', 'Enquiry ENQ2026-000002 from Bala has been submitted.', 'info', 0, '/enquiry/view/53decc42-3b0d-43f2-8de4-2d06dee6fd94', '{\"enquiry_id\":\"53decc42-3b0d-43f2-8de4-2d06dee6fd94\",\"enquiry_code\":\"ENQ2026-000002\",\"channels\":[\"inApp\"]}', '2026-08-28 09:10:43', '2026-08-28 09:10:43'),
('e0994865-6ab8-4817-9bef-90c6aa23c715', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'New Enquiry Received', 'Enquiry ENQ2026-000003 from Test Bala-1 has been submitted.', 'info', 0, '/enquiry/view/81f233bb-4a7f-4c69-b3eb-e814d8539b97', '{\"enquiry_id\":\"81f233bb-4a7f-4c69-b3eb-e814d8539b97\",\"enquiry_code\":\"ENQ2026-000003\",\"channels\":[\"inApp\"]}', '2026-08-28 13:34:48', '2026-08-28 13:34:48'),
('fb21f94d-bd05-4ab3-8e53-783edeba150c', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'New Enquiry Received', 'Enquiry ENQ2026-000005 from HariPrasadh has been submitted.', 'info', 0, '/enquiry/view/93ba5676-fab6-4355-a538-adb43375c144', '{\"enquiry_id\":\"93ba5676-fab6-4355-a538-adb43375c144\",\"enquiry_code\":\"ENQ2026-000005\",\"channels\":[\"inApp\"]}', '2026-08-28 16:30:48', '2026-08-28 16:30:48');

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_days` int NOT NULL DEFAULT '1',
  `duration_nights` int NOT NULL DEFAULT '0',
  `base_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `inclusions` text COLLATE utf8mb4_unicode_ci,
  `exclusions` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_terms_master`
--

CREATE TABLE `package_terms_master` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `heading` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `code`, `module`, `action`, `description`, `created_at`, `updated_at`) VALUES
('01c93b86-3b37-40d4-92fd-f0c08e18a34a', 'View driver_trips', 'driver_trips.view', 'driver_trips', 'view', 'Permission to view driver_trips', '2026-08-07 18:01:40', '2026-08-07 18:01:40'),
('032a2335-f104-429c-8421-43609d1c6958', 'Delete cities', 'cities.delete', 'cities', 'delete', 'Permission to delete cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('03bf664f-85aa-4dbe-9371-f85ab6704cb5', 'Print invoices', 'invoices.print', 'invoices', 'print', 'Permission to print invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('05e8764d-cb30-43ed-98a3-a5e7fee7bd10', 'Delete permissions', 'permissions.delete', 'permissions', 'delete', 'Permission to delete permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('06dec6e1-e9fb-4bab-9b63-76cbd480cefc', 'Edit audit_logs', 'audit_logs.edit', 'audit_logs', 'edit', 'Permission to edit audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('06e6363b-27be-4230-9ca2-61ab1b3401b6', 'Delete taxes', 'taxes.delete', 'taxes', 'delete', 'Permission to delete taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('0a26ba7e-fd46-460d-82bb-e01dd23c37ff', 'Delete lead_source_types', 'lead_source_types.delete', 'lead_source_types', 'delete', 'Permission to delete lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('0afed44d-f1b4-4bfd-97a0-f05e9f6593b6', 'Delete suppliers', 'suppliers.delete', 'suppliers', 'delete', 'Permission to delete suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('0b126dcf-48c3-45ec-b012-68cea3073772', 'Edit branches', 'branches.edit', 'branches', 'edit', 'Permission to edit branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('0d0c1958-8e45-40f6-9633-589b315bd941', 'Approve season_pricing', 'season_pricing.approve', 'season_pricing', 'approve', 'Permission to approve season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('0d1aed2c-72db-4456-b2af-b0454a5c73c9', 'Create designations', 'designations.create', 'designations', 'create', 'Permission to create designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('0db07fef-bad1-4f68-ab2a-70261ac6c7ed', 'View audit_logs', 'audit_logs.view', 'audit_logs', 'view', 'Permission to view audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('0efc95de-5491-4efb-a6f4-5aa3bf6c9dac', 'Edit taxes', 'taxes.edit', 'taxes', 'edit', 'Permission to edit taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('0f5ce52e-375f-4aeb-8271-1797325c74e9', 'View notifications', 'notifications.view', 'notifications', 'view', 'Permission to view notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('0fdd129f-2574-4a8f-84ba-922ded8448db', 'Delete dashboard', 'dashboard.delete', 'dashboard', 'delete', 'Permission to delete dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('1021ecaf-c74a-4383-9580-d48cf8715912', 'Approve enquiries', 'enquiries.approve', 'enquiries', 'approve', 'Permission to approve enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('105929f0-fc3c-4320-92ee-5bc3f4f6a80b', 'Edit login_history', 'login_history.edit', 'login_history', 'edit', 'Permission to edit login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('105afbf0-0769-4bd9-bab3-88562fca4cf6', 'View settings', 'settings.view', 'settings', 'view', 'Permission to view settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('12168a8e-be07-48d9-b7ee-126be39a3669', 'Edit invoices', 'invoices.edit', 'invoices', 'edit', 'Permission to edit invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('122e2687-03e8-4007-891c-63927fabc4d3', 'Print suppliers', 'suppliers.print', 'suppliers', 'print', 'Permission to print suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('12ce1dc4-27a5-4fa0-9499-3b10901f332a', 'Create currencies', 'currencies.create', 'currencies', 'create', 'Permission to create currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('1352caad-89fc-4bf1-8d9a-dc6538e51eb2', 'Edit settings', 'settings.edit', 'settings', 'edit', 'Permission to edit settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('13fa71ed-332f-4e22-883d-518a9e211c30', 'Print packages', 'packages.print', 'packages', 'print', 'Permission to print packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('15d67707-4848-4a12-872a-6057668a4242', 'Print season_pricing', 'season_pricing.print', 'season_pricing', 'print', 'Permission to print season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('1a2e3bb0-81ef-4467-a302-eaf830bad96c', 'Print refunds', 'refunds.print', 'refunds', 'print', 'Permission to print refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('1c6db917-a09b-4fff-aca0-763ce3c796b1', 'Create driver_trips', 'driver_trips.create', 'driver_trips', 'create', 'Permission to create driver_trips', '2026-08-21 06:53:44', '2026-08-21 06:53:44'),
('1d53bacb-1244-4023-9eaa-5f770020e1dd', 'View quotations', 'quotations.view', 'quotations', 'view', 'Permission to view quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('1d7923e1-5f6a-4c05-bccd-89c8ef25d18c', 'Print leads', 'leads.print', 'leads', 'print', 'Permission to print leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('1e09f584-09ef-4215-ac55-b1120c918f9e', 'Delete notifications', 'notifications.delete', 'notifications', 'delete', 'Permission to delete notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('1efd4937-5221-441a-9369-2f216c3a9a51', 'Export taxes', 'taxes.export', 'taxes', 'export', 'Permission to export taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('1f010364-f05e-49ea-afbc-76e493cab807', 'Export hotels', 'hotels.export', 'hotels', 'export', 'Permission to export hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('1f027a2c-752e-48e5-88b0-00bf045baef5', 'Create refunds', 'refunds.create', 'refunds', 'create', 'Permission to create refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('1f8a00b4-980b-45c1-8484-088000eb321d', 'Edit users', 'users.edit', 'users', 'edit', 'Permission to edit users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('203ef56a-c578-40ca-adab-f81aac07f25d', 'Create hotels', 'hotels.create', 'hotels', 'create', 'Permission to create hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('2075a865-a223-442b-8d86-ca391f318c05', 'Print settings', 'settings.print', 'settings', 'print', 'Permission to print settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('212d08d9-85f5-482a-8d5a-564b216b093a', 'Approve users', 'users.approve', 'users', 'approve', 'Permission to approve users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('21813b1c-42df-4445-967f-ecfc4b7c9875', 'Create expenses_types', 'expenses_types.create', 'expenses_types', 'create', 'Permission to create expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('224b5da4-9c04-4d34-9253-ae9fa91f070b', 'Delete branches', 'branches.delete', 'branches', 'delete', 'Permission to delete branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('2265cb3f-72ab-4264-a708-f62d98df8a4d', 'View taxes', 'taxes.view', 'taxes', 'view', 'Permission to view taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('23be7b45-6a5e-4451-9a16-d125986a9c2b', 'Edit hotels', 'hotels.edit', 'hotels', 'edit', 'Permission to edit hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('24955386-a05e-4756-9fee-de707ceaf8b7', 'Print departments', 'departments.print', 'departments', 'print', 'Permission to print departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('24b306c9-3df0-4921-8476-13757f36d623', 'Export designations', 'designations.export', 'designations', 'export', 'Permission to export designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('24daa47d-4926-40c4-8771-dc118b1bc71c', 'Delete calendar', 'calendar.delete', 'calendar', 'delete', 'Permission to delete calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('26462164-bb04-4dcd-a660-5f573027911c', 'Approve payment_modes', 'payment_modes.approve', 'payment_modes', 'approve', 'Permission to approve payment_modes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('281c909f-ed2a-4a0c-8d7e-ff3c14d78262', 'Delete login_history', 'login_history.delete', 'login_history', 'delete', 'Permission to delete login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('290d49ad-f87a-462f-982f-b399c539cc14', 'Export feedback', 'feedback.export', 'feedback', 'export', 'Permission to export feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('29255f46-ba83-4475-ac02-fd451f121c1a', 'Edit currencies', 'currencies.edit', 'currencies', 'edit', 'Permission to edit currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('29befea9-d7e5-48e0-8af8-95863048525d', 'Edit calendar', 'calendar.edit', 'calendar', 'edit', 'Permission to edit calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('2b28550b-7eec-445f-b619-8fbdc69a66da', 'Print driver_trips', 'driver_trips.print', 'driver_trips', 'print', 'Permission to print driver_trips', '2026-08-21 06:53:45', '2026-08-21 06:53:45'),
('2b5a917f-ed9a-4d50-8def-270526518353', 'Create season_pricing', 'season_pricing.create', 'season_pricing', 'create', 'Permission to create season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('2c342d11-18c4-4697-bec4-152f2d67062d', 'Edit departments', 'departments.edit', 'departments', 'edit', 'Permission to edit departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('2de5797a-66e0-47ab-a123-1f39d34dccfe', 'Delete reports', 'reports.delete', 'reports', 'delete', 'Permission to delete reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('30651ef0-7eeb-42f2-a1b1-28732c4cef3b', 'Print itineraries', 'itineraries.print', 'itineraries', 'print', 'Permission to print itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('308e2792-c6e3-4fac-bce9-4cc3a3bcf33f', 'Export calendar', 'calendar.export', 'calendar', 'export', 'Permission to export calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('30af8b43-66c0-4cfd-95d0-bc0a47818938', 'Delete enquiries', 'enquiries.delete', 'enquiries', 'delete', 'Permission to delete enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('310182d5-3205-4884-b8d4-fdcc3e01fc9a', 'Delete currencies', 'currencies.delete', 'currencies', 'delete', 'Permission to delete currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('33ddfb52-fae9-4d4a-8a45-9544e4b5129a', 'View dashboard', 'dashboard.view', 'dashboard', 'view', 'Permission to view dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('34d70bb3-7571-4dc2-b04b-a0da09373eab', 'Export reports', 'reports.export', 'reports', 'export', 'Permission to export reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('3589519f-9305-4102-879d-3996bfeb0b66', 'Approve notifications', 'notifications.approve', 'notifications', 'approve', 'Permission to approve notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('35ab40bb-a62e-48d4-a05d-8defcd40f0e7', 'Print designations', 'designations.print', 'designations', 'print', 'Permission to print designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('35b1e503-0947-4f66-bf1f-0dc45576dd98', 'Create package_terms', 'package_terms.create', 'package_terms', 'create', 'Permission to create package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('36f132b9-a8f8-425d-bca0-09213b85b436', 'Export departments', 'departments.export', 'departments', 'export', 'Permission to export departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('371c8933-8695-4446-8048-b40b42cbee2a', 'Create payment_modes', 'payment_modes.create', 'payment_modes', 'create', 'Permission to create payment_modes', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('3725ab57-4fa3-4226-9b7e-d0d8217c2859', 'Print login_history', 'login_history.print', 'login_history', 'print', 'Permission to print login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('396f1a98-e470-4a53-892d-8c2de5baa959', 'View calendar', 'calendar.view', 'calendar', 'view', 'Permission to view calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('39d4518f-852a-430c-b0db-3e2729af93f9', 'Approve suppliers', 'suppliers.approve', 'suppliers', 'approve', 'Permission to approve suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('3b8aaf13-51b9-4dca-be02-69bb992e62bb', 'View destinations', 'destinations.view', 'destinations', 'view', 'Permission to view destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('3c0c2bcf-c33c-4f70-8a58-609943f21c4a', 'Create guides', 'guides.create', 'guides', 'create', 'Permission to create guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('3c66489b-9227-4b5a-97d5-4f1f7eb4f474', 'Approve permissions', 'permissions.approve', 'permissions', 'approve', 'Permission to approve permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('3c6f6fd9-6e7e-4be8-bea3-0ef37c433f29', 'Export countries', 'countries.export', 'countries', 'export', 'Permission to export countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('3e8ecd17-906c-47bd-b2ce-f4b9dfc1bf69', 'Export package_terms', 'package_terms.export', 'package_terms', 'export', 'Permission to export package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('40a24208-5a30-4754-9659-1eca439b85e8', 'Export branches', 'branches.export', 'branches', 'export', 'Permission to export branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('410d39f0-4d29-4d63-9707-fe313bb8f6fc', 'View vehicles', 'vehicles.view', 'vehicles', 'view', 'Permission to view vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('4144dff5-946b-4a3d-8d91-598157b072ad', 'Create reports', 'reports.create', 'reports', 'create', 'Permission to create reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('4399f0fd-d0d8-4253-82ea-1fb3a8294158', 'Delete refunds', 'refunds.delete', 'refunds', 'delete', 'Permission to delete refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('44bfa82b-c0c9-43df-93e7-9850cc9b7f1e', 'Print bookings', 'bookings.print', 'bookings', 'print', 'Permission to print bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('44f6cbd1-8814-429f-b3a4-a24cb5d7b486', 'Approve designations', 'designations.approve', 'designations', 'approve', 'Permission to approve designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('452fc3a7-b3ba-4e05-a3b5-e3a2765c4a5e', 'View bookings', 'bookings.view', 'bookings', 'view', 'Permission to view bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('45f69355-4ab8-4d83-bb55-31e2eef099ea', 'View packages', 'packages.view', 'packages', 'view', 'Permission to view packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('4678f593-39a7-4b4f-b75e-88dd5c548818', 'Export permissions', 'permissions.export', 'permissions', 'export', 'Permission to export permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('4a91dc67-d8d2-40cc-a3fa-8465ebf3de7e', 'View leads', 'leads.view', 'leads', 'view', 'Permission to view leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('4ab9efcd-2ddb-4bc7-ae9a-3a82f15bbc1a', 'View follow_ups', 'follow_ups.view', 'follow_ups', 'view', 'Permission to view follow_ups', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('4bb4ed94-6fa8-42f0-b3e7-55417344048c', 'Export leads', 'leads.export', 'leads', 'export', 'Permission to export leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('4c1ed60f-15bd-4e45-80ac-7d8f1a2bd2aa', 'View season_pricing', 'season_pricing.view', 'season_pricing', 'view', 'Permission to view season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('4f96ccd5-5397-4485-af9a-28a0bc72c2f3', 'Print inclusion_exclusions', 'inclusion_exclusions.print', 'inclusion_exclusions', 'print', 'Permission to print inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('5046e477-7274-4af2-8334-d0ef0fd33dbf', 'Edit roles', 'roles.edit', 'roles', 'edit', 'Permission to edit roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('5228bee0-01b1-4a83-b074-273e77351c95', 'Edit permissions', 'permissions.edit', 'permissions', 'edit', 'Permission to edit permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('52820974-0d73-48b6-95ff-10e8d305c14c', 'Print taxes', 'taxes.print', 'taxes', 'print', 'Permission to print taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('53743a66-4c7f-408b-b936-c25b1c5d78a4', 'Print cities', 'cities.print', 'cities', 'print', 'Permission to print cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('544a0929-56a8-4ab3-a151-12104308726c', 'Delete season_pricing', 'season_pricing.delete', 'season_pricing', 'delete', 'Permission to delete season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('5459082f-153e-4069-af15-b7648f490606', 'Create lead_statuses', 'lead_statuses.create', 'lead_statuses', 'create', 'Permission to create lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('5519f9c1-895b-4f4b-875a-910162571e5d', 'Export destinations', 'destinations.export', 'destinations', 'export', 'Permission to export destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('569d92f8-a32c-4d50-bdcb-5d6d214a3b84', 'Delete drivers', 'drivers.delete', 'drivers', 'delete', 'Permission to delete drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('56e76980-3c37-4757-85e6-b40ce6924886', 'Edit cities', 'cities.edit', 'cities', 'edit', 'Permission to edit cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('573a594a-4faf-46a2-aa8e-385c97e82111', 'Export quotations', 'quotations.export', 'quotations', 'export', 'Permission to export quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('574855e7-441e-465e-aade-d5664d85fc01', 'Approve hotels', 'hotels.approve', 'hotels', 'approve', 'Permission to approve hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('5769c961-b25e-4344-bc6a-c802d30faabe', 'Delete vehicles', 'vehicles.delete', 'vehicles', 'delete', 'Permission to delete vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('57ca9c01-0d43-4361-a5a9-bd34c733b929', 'Print vehicles', 'vehicles.print', 'vehicles', 'print', 'Permission to print vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('5800f805-96a0-4195-842d-df5d052fbf68', 'Approve roles', 'roles.approve', 'roles', 'approve', 'Permission to approve roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('586d78c8-aee8-480a-be94-2f6acb087f7d', 'Export season_pricing', 'season_pricing.export', 'season_pricing', 'export', 'Permission to export season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('59138b17-11e0-469f-ae8f-678c81795208', 'Create roles', 'roles.create', 'roles', 'create', 'Permission to create roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('5a5631c9-abaa-4c02-b7c2-d7b9e87060d9', 'Edit guides', 'guides.edit', 'guides', 'edit', 'Permission to edit guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('5a640330-ef26-49ad-b4c1-47033bf147b5', 'Edit reports', 'reports.edit', 'reports', 'edit', 'Permission to edit reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('5b62467c-a822-4663-9ddd-cab998fa8acf', 'Print follow_ups', 'follow_ups.print', 'follow_ups', 'print', 'Permission to print follow_ups', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('5d021491-1967-49f2-af47-8774c5521dc4', 'Edit expenses_types', 'expenses_types.edit', 'expenses_types', 'edit', 'Permission to edit expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('5e1ef951-9f89-4cc1-b433-b177a4c7a5ee', 'Approve cities', 'cities.approve', 'cities', 'approve', 'Permission to approve cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('5e4eb3fc-b8c4-4e0c-8628-4625fed1104d', 'Edit lead_source_types', 'lead_source_types.edit', 'lead_source_types', 'edit', 'Permission to edit lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('5f09c30a-a7df-4e92-8d0c-9c09e282baf9', 'Export receipts', 'receipts.export', 'receipts', 'export', 'Permission to export receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('60c9e024-2fe2-4281-b40f-c27d914035a8', 'Delete settings', 'settings.delete', 'settings', 'delete', 'Permission to delete settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('6105a0fb-f468-4bfb-9fc3-307f110f48f0', 'View permissions', 'permissions.view', 'permissions', 'view', 'Permission to view permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('613f9c9b-29c2-4e1d-a781-0d6223ac39ed', 'Export dashboard', 'dashboard.export', 'dashboard', 'export', 'Permission to export dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('6148bd0d-5775-44aa-a287-ab8b598aea80', 'Print package_terms', 'package_terms.print', 'package_terms', 'print', 'Permission to print package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('61e9cf30-7ea6-48f5-9f92-418f056ca432', 'Create vehicles', 'vehicles.create', 'vehicles', 'create', 'Permission to create vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('62865581-a269-4338-a62a-63ac5958f665', 'Delete hotels', 'hotels.delete', 'hotels', 'delete', 'Permission to delete hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('6596e6c9-5b17-43b7-9590-91c6daf13a15', 'Create settings', 'settings.create', 'settings', 'create', 'Permission to create settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('65df02a7-3f96-40ed-9068-7bc79a41962e', 'Edit vehicles', 'vehicles.edit', 'vehicles', 'edit', 'Permission to edit vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('66c2096c-ae85-4c2a-9d2e-9ab31b74a606', 'Export driver_trips', 'driver_trips.export', 'driver_trips', 'export', 'Permission to export driver_trips', '2026-08-21 06:53:45', '2026-08-21 06:53:45'),
('67213852-8a74-47a0-9208-31f94984e3e2', 'Create countries', 'countries.create', 'countries', 'create', 'Permission to create countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('675072cd-1d35-44b0-8c8c-bc8c32b1d0d0', 'Approve vehicles', 'vehicles.approve', 'vehicles', 'approve', 'Permission to approve vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('6ae8ce97-7980-41dd-b897-b0d31a4799e8', 'View expenses', 'expenses.view', 'expenses', 'view', 'Permission to view expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('6bc3d79e-290c-46bf-85bf-21befcc5362e', 'Edit inclusion_exclusions', 'inclusion_exclusions.edit', 'inclusion_exclusions', 'edit', 'Permission to edit inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('6c23cb35-8f83-40d9-a684-28b1b9a6b9a7', 'Export cities', 'cities.export', 'cities', 'export', 'Permission to export cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('6c9cd548-9276-44fe-8f88-8bc8de282bfc', 'Export vehicles', 'vehicles.export', 'vehicles', 'export', 'Permission to export vehicles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('6d2db5b0-d769-4d67-bc72-c5546674b237', 'Delete destinations', 'destinations.delete', 'destinations', 'delete', 'Permission to delete destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('708362aa-823f-4c35-8f1f-36ad44153df7', 'Edit enquiries', 'enquiries.edit', 'enquiries', 'edit', 'Permission to edit enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('70c78767-d830-4749-9233-7e6238ba33c7', 'Create quotations', 'quotations.create', 'quotations', 'create', 'Permission to create quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('70f6c7b3-b637-4ea5-ad23-bdf3d6340563', 'Create expenses', 'expenses.create', 'expenses', 'create', 'Permission to create expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('720fe2f9-3ade-42e3-821d-d0ddf37d7753', 'Create cities', 'cities.create', 'cities', 'create', 'Permission to create cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('725306bd-b774-4bb1-a868-8f35410a6d4c', 'Print payment_modes', 'payment_modes.print', 'payment_modes', 'print', 'Permission to print payment_modes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('726199d9-84c1-4143-9bcb-06e4be9da8f7', 'Approve feedback', 'feedback.approve', 'feedback', 'approve', 'Permission to approve feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('7283d62c-db03-43b5-b220-2d65691afd1c', 'Print drivers', 'drivers.print', 'drivers', 'print', 'Permission to print drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('73d1f2ca-3ee8-4c84-910f-9aca46c28ced', 'View roles', 'roles.view', 'roles', 'view', 'Permission to view roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('73ddd1e1-a4bc-429d-91e9-a6f15852c724', 'Edit designations', 'designations.edit', 'designations', 'edit', 'Permission to edit designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('7793348e-61f2-4b49-b262-434d13c2fd65', 'Approve reports', 'reports.approve', 'reports', 'approve', 'Permission to approve reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('77b3d103-9980-47ce-ba7e-1524f25ae946', 'Edit notifications', 'notifications.edit', 'notifications', 'edit', 'Permission to edit notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('78a2ecbf-cfa7-4e72-a171-ef86a5b83d9e', 'Export packages', 'packages.export', 'packages', 'export', 'Permission to export packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('7911fe4d-2469-45b8-ba5d-116f86dd94e1', 'Approve follow_ups', 'follow_ups.approve', 'follow_ups', 'approve', 'Permission to approve follow_ups', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('7a2ee08b-65b1-40c7-9798-18a453ed869c', 'Approve packages', 'packages.approve', 'packages', 'approve', 'Permission to approve packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('7a3da6fe-ab4d-421a-a2c7-e4e4fbc01a12', 'Create leads', 'leads.create', 'leads', 'create', 'Permission to create leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('7ba6e693-7f25-4745-8b1e-1dae81158fd9', 'Print expenses', 'expenses.print', 'expenses', 'print', 'Permission to print expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('7ceafee9-45dd-44bb-a5d4-3eb5e6cece4c', 'Approve lead_source_types', 'lead_source_types.approve', 'lead_source_types', 'approve', 'Permission to approve lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('7e07d1f0-dc24-446c-9456-5cc3def467c9', 'Print calendar', 'calendar.print', 'calendar', 'print', 'Permission to print calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('7e7927d6-812f-4d4a-83ce-9b46b339c77f', 'Approve expenses', 'expenses.approve', 'expenses', 'approve', 'Permission to approve expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('7e99e95e-010d-4ab9-a1a3-897812b44dc5', 'Create enquiries', 'enquiries.create', 'enquiries', 'create', 'Permission to create enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('803c50ec-8ac3-44b0-a1fc-efbef148bb57', 'Print hotels', 'hotels.print', 'hotels', 'print', 'Permission to print hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('804e56aa-5975-403e-9a0f-52739a0a5003', 'Export currencies', 'currencies.export', 'currencies', 'export', 'Permission to export currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('808ee7ab-af7e-463c-8d1e-2ac51dcdb739', 'Approve calendar', 'calendar.approve', 'calendar', 'approve', 'Permission to approve calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('815a0083-e027-4b2c-b62a-64535154863e', 'View refunds', 'refunds.view', 'refunds', 'view', 'Permission to view refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8163bd26-7817-4414-bb20-93ea6c6eff3e', 'Edit lead_statuses', 'lead_statuses.edit', 'lead_statuses', 'edit', 'Permission to edit lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('818c7179-baaf-4121-8010-db85ed5abae5', 'Create calendar', 'calendar.create', 'calendar', 'create', 'Permission to create calendar', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('81de98cd-b04f-40ce-94c8-e7a7d56d9f05', 'Export login_history', 'login_history.export', 'login_history', 'export', 'Permission to export login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('827db1c2-8c32-4d0d-9e81-c3f433306e61', 'Edit payment_modes', 'payment_modes.edit', 'payment_modes', 'edit', 'Permission to edit payment_modes', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('836f11f1-2c28-47c0-9a04-e3d8e6368d71', 'Delete audit_logs', 'audit_logs.delete', 'audit_logs', 'delete', 'Permission to delete audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('83ab3aca-62a1-4168-9e30-839a9deb1bdb', 'Create users', 'users.create', 'users', 'create', 'Permission to create users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('83bce96a-fdc9-4f24-b315-b8ecc00207a5', 'Create taxes', 'taxes.create', 'taxes', 'create', 'Permission to create taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('840dd320-6982-4193-a927-198e75da9d66', 'View departments', 'departments.view', 'departments', 'view', 'Permission to view departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('8475464d-22d3-4f36-b7dc-ec4a18cc9b6c', 'View package_terms', 'package_terms.view', 'package_terms', 'view', 'Permission to view package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('85daaed1-2450-4a50-ab86-cc30c896bc77', 'Print states', 'states.print', 'states', 'print', 'Permission to print states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('869d1162-1364-4fba-a402-93f135294baa', 'Print currencies', 'currencies.print', 'currencies', 'print', 'Permission to print currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('8767a628-aeb9-4870-b8f1-fd4206b214c1', 'View lead_statuses', 'lead_statuses.view', 'lead_statuses', 'view', 'Permission to view lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('878d097d-9574-415e-85b1-5641c3e212b4', 'Delete guides', 'guides.delete', 'guides', 'delete', 'Permission to delete guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('87ca124a-bf16-4015-a774-ec820d2b7a12', 'Print notifications', 'notifications.print', 'notifications', 'print', 'Permission to print notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8812de35-5a49-481c-a859-28a6422479be', 'Export itineraries', 'itineraries.export', 'itineraries', 'export', 'Permission to export itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8918d238-5444-451d-8328-a8b58c284651', 'Approve departments', 'departments.approve', 'departments', 'approve', 'Permission to approve departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('89e1627a-c3b7-4224-a4f6-b5b2bcfd1ee4', 'Edit suppliers', 'suppliers.edit', 'suppliers', 'edit', 'Permission to edit suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('89f97d05-124d-426d-84d6-27d72076e223', 'Edit package_terms', 'package_terms.edit', 'package_terms', 'edit', 'Permission to edit package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('8aca1f7f-82ff-4b89-aa3a-749dc7bfa187', 'Create states', 'states.create', 'states', 'create', 'Permission to create states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('8c1edbf9-bb2a-4bba-8272-7ca88a19c601', 'View feedback', 'feedback.view', 'feedback', 'view', 'Permission to view feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8cf5415c-2adf-47bb-a08b-04257be53901', 'Export enquiries', 'enquiries.export', 'enquiries', 'export', 'Permission to export enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('8d5ad96f-f451-4b8e-9e8d-fd5408502b12', 'Print quotations', 'quotations.print', 'quotations', 'print', 'Permission to print quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8d64993c-42f4-4333-a92b-e4c9343cdd80', 'Create bookings', 'bookings.create', 'bookings', 'create', 'Permission to create bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('8e5eb848-9b11-4578-81f4-79e13c07d02b', 'View enquiries', 'enquiries.view', 'enquiries', 'view', 'Permission to view enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('8f14aa52-6256-43c6-a2ac-3a4073537a30', 'View cities', 'cities.view', 'cities', 'view', 'Permission to view cities', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('8f2496ba-f918-4de6-9c38-8fbfc92db009', 'Approve driver_trips', 'driver_trips.approve', 'driver_trips', 'approve', 'Permission to approve driver_trips', '2026-08-21 06:53:45', '2026-08-21 06:53:45'),
('8fa47852-26ff-4acb-82e5-534a378fbccc', 'View hotels', 'hotels.view', 'hotels', 'view', 'Permission to view hotels', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('8fac81b2-a84a-4259-86ba-23d7f42f26eb', 'Edit states', 'states.edit', 'states', 'edit', 'Permission to edit states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('8fbc08ba-e370-43b3-804e-42ffe64f74e9', 'Edit expenses', 'expenses.edit', 'expenses', 'edit', 'Permission to edit expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('90ddeae9-2062-4b37-bbca-903f64fa382b', 'Create follow_ups', 'follow_ups.create', 'follow_ups', 'create', 'Permission to create follow_ups', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('90e4884e-48e5-4435-bdc7-475ffdf1f2a4', 'View suppliers', 'suppliers.view', 'suppliers', 'view', 'Permission to view suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('93b92c12-07fe-4fd7-a7b7-30b2d17304ad', 'Delete states', 'states.delete', 'states', 'delete', 'Permission to delete states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('93ec72f5-4e26-4927-a466-2e662732afcd', 'Approve destinations', 'destinations.approve', 'destinations', 'approve', 'Permission to approve destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('94a1de54-74c4-41a4-9f7f-5e7d84949602', 'Print dashboard', 'dashboard.print', 'dashboard', 'print', 'Permission to print dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('94c040ff-25c9-4d88-a5d2-24db8143e4ca', 'Approve drivers', 'drivers.approve', 'drivers', 'approve', 'Permission to approve drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('94c4c9a3-c9fd-4664-94f5-80a684deb62d', 'Delete countries', 'countries.delete', 'countries', 'delete', 'Permission to delete countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('9561ac3e-90ae-4f99-9928-9ed02770c82f', 'Delete bookings', 'bookings.delete', 'bookings', 'delete', 'Permission to delete bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('95d95148-6b2f-493f-9d3f-26673d28b43f', 'Approve package_terms', 'package_terms.approve', 'package_terms', 'approve', 'Permission to approve package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('96f2eed5-c429-44cb-9580-e8957f09aac1', 'Approve states', 'states.approve', 'states', 'approve', 'Permission to approve states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('98dc541a-172f-4f91-8ab7-cd2869cc13db', 'Export payment_modes', 'payment_modes.export', 'payment_modes', 'export', 'Permission to export payment_modes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('992e6265-74c1-49ab-97b2-2a44938c397a', 'Delete receipts', 'receipts.delete', 'receipts', 'delete', 'Permission to delete receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('9963aeaa-e619-4e72-b805-cbc6d7a736ed', 'Create drivers', 'drivers.create', 'drivers', 'create', 'Permission to create drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('9970f296-0f1e-431a-9f76-022a0a1b8ee5', 'Delete expenses_types', 'expenses_types.delete', 'expenses_types', 'delete', 'Permission to delete expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('99d21172-5e16-4e13-8edc-214b958e69aa', 'Print permissions', 'permissions.print', 'permissions', 'print', 'Permission to print permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('9a3691f0-2198-4860-a9e4-2a338ada09e2', 'Export suppliers', 'suppliers.export', 'suppliers', 'export', 'Permission to export suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('9aca190b-deaf-4780-84a4-14eeb7d37e31', 'Delete roles', 'roles.delete', 'roles', 'delete', 'Permission to delete roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('9b55906d-afe0-44f1-b6b1-097520cfe6d6', 'Delete departments', 'departments.delete', 'departments', 'delete', 'Permission to delete departments', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('9c78aad6-cbf5-4087-8d2c-71b1428b1ff1', 'Export follow_ups', 'follow_ups.export', 'follow_ups', 'export', 'Permission to export follow_ups', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('9d6d4bb2-ff1f-4d35-9dcb-3aee8504820d', 'View receipts', 'receipts.view', 'receipts', 'view', 'Permission to view receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('9f47edfd-5d1b-421a-a485-fe6a8c99b759', 'View currencies', 'currencies.view', 'currencies', 'view', 'Permission to view currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('9f4eeff5-88c2-11f1-accc-00ff5530513d', 'View login_history', 'login_history.view', 'login_history', 'view', 'Permission to view login_history', '2026-07-26 12:51:21', '2026-07-26 12:51:21'),
('a092aa34-f77d-4ef0-9344-c37f34004bdf', 'View branches', 'branches.view', 'branches', 'view', 'Permission to view branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('a138ada3-0b4f-4e96-8770-8f47c373b922', 'View guides', 'guides.view', 'guides', 'view', 'Permission to view guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('a1ddf548-91c7-43eb-9db0-6f461c884f5e', 'Export settings', 'settings.export', 'settings', 'export', 'Permission to export settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('a25b4cb3-4755-49f6-85c5-35e52eb106fb', 'View countries', 'countries.view', 'countries', 'view', 'Permission to view countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('a2a6f4e3-60db-4861-b36d-ac75cdf0dadc', 'Delete users', 'users.delete', 'users', 'delete', 'Permission to delete users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('a41f9a15-38ff-4333-9555-1e04ded3148a', 'Create inclusion_exclusions', 'inclusion_exclusions.create', 'inclusion_exclusions', 'create', 'Permission to create inclusion_exclusions', '2026-08-01 15:07:43', '2026-08-01 15:07:43'),
('a5a636d2-7d30-4114-9892-ed64199ce70e', 'Delete lead_statuses', 'lead_statuses.delete', 'lead_statuses', 'delete', 'Permission to delete lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('a63ab29b-6823-4fa3-b516-ed6195da9ab2', 'Approve inclusion_exclusions', 'inclusion_exclusions.approve', 'inclusion_exclusions', 'approve', 'Permission to approve inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('a6fd4d35-16b4-41e3-9662-243aa8d48d3d', 'View drivers', 'drivers.view', 'drivers', 'view', 'Permission to view drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('a70acaab-66f4-442d-9477-3003b7853f36', 'Print roles', 'roles.print', 'roles', 'print', 'Permission to print roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('a7f2c7e6-a823-4d4e-b106-f2edb9357752', 'Edit dashboard', 'dashboard.edit', 'dashboard', 'edit', 'Permission to edit dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('a88964f7-d2c7-47e6-8e40-140aa7d01dc5', 'Approve expenses_types', 'expenses_types.approve', 'expenses_types', 'approve', 'Permission to approve expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('a9752f05-ca0d-46b9-9ff4-bd809146918c', 'View reports', 'reports.view', 'reports', 'view', 'Permission to view reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('a9def816-f4e5-45c0-b120-4da7f065b361', 'View expenses_types', 'expenses_types.view', 'expenses_types', 'view', 'Permission to view expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('a9e81bd9-22d9-42c6-963a-3d1ae92e44a0', 'Delete invoices', 'invoices.delete', 'invoices', 'delete', 'Permission to delete invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('a9e8ba80-9c5e-4b78-8725-10433594e405', 'Create branches', 'branches.create', 'branches', 'create', 'Permission to create branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('ab3602f2-5542-45c4-8812-18079c8165c1', 'Create departments', 'departments.create', 'departments', 'create', 'Permission to create departments', '2026-07-26 06:56:13', '2026-07-26 06:56:13'),
('ab510438-cdad-4f93-b9bd-407174bd8983', 'Print receipts', 'receipts.print', 'receipts', 'print', 'Permission to print receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('abbdbc0f-2f7f-4987-9783-68bc51f7bc44', 'Delete follow_ups', 'follow_ups.delete', 'follow_ups', 'delete', 'Permission to delete follow_ups', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('ad03fb83-0e5e-4010-9e38-e3d68fbd1c9e', 'Print branches', 'branches.print', 'branches', 'print', 'Permission to print branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('ad360ee8-e13a-479e-9171-a803f627a4be', 'Create login_history', 'login_history.create', 'login_history', 'create', 'Permission to create login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('ae633e62-8170-43df-9587-5e03fcd3d0a0', 'Delete payment_modes', 'payment_modes.delete', 'payment_modes', 'delete', 'Permission to delete payment_modes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('aea1dc1c-f2d5-48a2-bda8-0b19ed7af5fd', 'Approve itineraries', 'itineraries.approve', 'itineraries', 'approve', 'Permission to approve itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('af4393bd-7dad-4b1b-b311-b065ce1db315', 'Approve settings', 'settings.approve', 'settings', 'approve', 'Permission to approve settings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('af9db6f8-04a1-48d4-8caa-4f3799ebc6a2', 'Approve invoices', 'invoices.approve', 'invoices', 'approve', 'Permission to approve invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('afb4b719-9541-45d3-a422-433f4fa43174', 'Export inclusion_exclusions', 'inclusion_exclusions.export', 'inclusion_exclusions', 'export', 'Permission to export inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('afb650a7-f5f4-4db2-9c8c-c2704d2acaef', 'Export expenses', 'expenses.export', 'expenses', 'export', 'Permission to export expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b209348b-1349-4ce5-8d32-1d38aee48d66', 'Edit follow_ups', 'follow_ups.edit', 'follow_ups', 'edit', 'Permission to edit follow_ups', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('b264529b-9879-4314-a540-52ba356b1539', 'Export refunds', 'refunds.export', 'refunds', 'export', 'Permission to export refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b29948c6-2f66-4999-a19f-08798ac58565', 'Export roles', 'roles.export', 'roles', 'export', 'Permission to export roles', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('b38189b3-d6d1-4f08-8059-52eb410f32ad', 'Print users', 'users.print', 'users', 'print', 'Permission to print users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('b49f809e-db14-4fd0-89fa-ab4a2e254c05', 'Edit receipts', 'receipts.edit', 'receipts', 'edit', 'Permission to edit receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b5115b3d-f88b-404a-8b93-bbee2e59c7c3', 'Approve quotations', 'quotations.approve', 'quotations', 'approve', 'Permission to approve quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b5ade342-e540-484b-ab92-c725bcf7b7ac', 'Print countries', 'countries.print', 'countries', 'print', 'Permission to print countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('b6cd8bce-6139-49b2-876f-698fb1b5db27', 'View itineraries', 'itineraries.view', 'itineraries', 'view', 'Permission to view itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b78d760c-830e-4be9-afbf-9dbe7f08da9f', 'Delete quotations', 'quotations.delete', 'quotations', 'delete', 'Permission to delete quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b7e1cc92-372d-4dd1-bdc2-17b3768519cc', 'Edit refunds', 'refunds.edit', 'refunds', 'edit', 'Permission to edit refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b82e9c6f-d073-4cde-bde3-1b918302d247', 'Delete expenses', 'expenses.delete', 'expenses', 'delete', 'Permission to delete expenses', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b88033ed-5c02-4e45-8642-71440bf763bb', 'Create permissions', 'permissions.create', 'permissions', 'create', 'Permission to create permissions', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('b9031706-6fc2-41a9-8410-5136b01c7099', 'View invoices', 'invoices.view', 'invoices', 'view', 'Permission to view invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('b9da96e6-4b10-43a9-90df-443701c1f821', 'Edit season_pricing', 'season_pricing.edit', 'season_pricing', 'edit', 'Permission to edit season_pricing', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('ba039e37-aa78-4377-a1ef-cf7e5ebc77dd', 'Export notifications', 'notifications.export', 'notifications', 'export', 'Permission to export notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('baf5bd69-922c-4e81-b9d9-b52f21fbd216', 'Approve bookings', 'bookings.approve', 'bookings', 'approve', 'Permission to approve bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('bb741b8b-3a8b-4828-ac3a-e64c710fb2ba', 'Export users', 'users.export', 'users', 'export', 'Permission to export users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('bbc4616b-cdc7-40f0-b06f-5f473c2d950e', 'View inclusion_exclusions', 'inclusion_exclusions.view', 'inclusion_exclusions', 'view', 'Permission to view inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('bbe4be5d-a318-4ab3-9ac6-9cb473f0165c', 'Create packages', 'packages.create', 'packages', 'create', 'Permission to create packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('bbe98d1c-7740-44eb-9d64-e0d6135cd532', 'Delete feedback', 'feedback.delete', 'feedback', 'delete', 'Permission to delete feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('bc16c159-d24d-4102-91e3-0bb325d2326f', 'Create destinations', 'destinations.create', 'destinations', 'create', 'Permission to create destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('bc4bfffd-5102-40c2-a647-0335f0fee869', 'Edit itineraries', 'itineraries.edit', 'itineraries', 'edit', 'Permission to edit itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('bfa80490-2d0d-4085-bd24-efbf59678ba9', 'Export lead_statuses', 'lead_statuses.export', 'lead_statuses', 'export', 'Permission to export lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('c458c788-210b-4852-b9c6-abb42e4c63ac', 'Edit packages', 'packages.edit', 'packages', 'edit', 'Permission to edit packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('c5008f10-c80c-4e2d-830a-53307e034882', 'Export bookings', 'bookings.export', 'bookings', 'export', 'Permission to export bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('c64c8265-971b-462b-b87d-ec328f7e8f62', 'Approve guides', 'guides.approve', 'guides', 'approve', 'Permission to approve guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('c7c1a111-b9d1-4f1f-a23c-4d81b541a070', 'Export expenses_types', 'expenses_types.export', 'expenses_types', 'export', 'Permission to export expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('c82cc2f6-4b2a-4ee2-9824-537ac50d45f1', 'Approve taxes', 'taxes.approve', 'taxes', 'approve', 'Permission to approve taxes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('c86c981a-fcd7-4085-92d8-dee7439d86d8', 'Export audit_logs', 'audit_logs.export', 'audit_logs', 'export', 'Permission to export audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('c9d212f6-1b49-4b80-ba99-5e5856b3f02e', 'Export states', 'states.export', 'states', 'export', 'Permission to export states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('cac534ca-d27f-42c7-a417-35df3b291ddd', 'Print guides', 'guides.print', 'guides', 'print', 'Permission to print guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('cc07cfaf-6b26-4faa-bc0f-1f20e7b072a0', 'Print feedback', 'feedback.print', 'feedback', 'print', 'Permission to print feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('cd698b5e-5c82-43ef-ab43-c0c07e01ce99', 'Delete inclusion_exclusions', 'inclusion_exclusions.delete', 'inclusion_exclusions', 'delete', 'Permission to delete inclusion_exclusions', '2026-08-01 15:07:44', '2026-08-01 15:07:44'),
('d0188a5d-78e6-46fd-a803-ffcc83fcf319', 'Approve lead_statuses', 'lead_statuses.approve', 'lead_statuses', 'approve', 'Permission to approve lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('d052d947-1d7d-43c5-a277-0cfb3c52261f', 'Create invoices', 'invoices.create', 'invoices', 'create', 'Permission to create invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('d0b2ff71-52c5-4c64-8c40-a744d058ec6a', 'Approve login_history', 'login_history.approve', 'login_history', 'approve', 'Permission to approve login_history', '2026-07-26 08:22:11', '2026-07-26 08:22:11'),
('d35a091d-4beb-4387-9498-38ea68870772', 'Create itineraries', 'itineraries.create', 'itineraries', 'create', 'Permission to create itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('d3aee415-6fad-4aff-a40e-c9188f1efc5f', 'Delete package_terms', 'package_terms.delete', 'package_terms', 'delete', 'Permission to delete package_terms', '2026-08-05 15:12:46', '2026-08-05 15:12:46'),
('d8680057-1fb4-4e93-b73b-2959ac886049', 'Print lead_source_types', 'lead_source_types.print', 'lead_source_types', 'print', 'Permission to print lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('da4f4699-b42e-4108-991a-8656e5371c0b', 'Approve receipts', 'receipts.approve', 'receipts', 'approve', 'Permission to approve receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('dae12302-16b2-4a07-80d0-609eb8a068dc', 'View states', 'states.view', 'states', 'view', 'Permission to view states', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('db97ff5b-5788-4287-bc48-c6adbd0e6505', 'Export invoices', 'invoices.export', 'invoices', 'export', 'Permission to export invoices', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('dc81f7c6-6b17-4761-8285-b9756f71ee24', 'Create notifications', 'notifications.create', 'notifications', 'create', 'Permission to create notifications', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('dda66109-6528-4d6d-9ce9-0241f898c820', 'Print audit_logs', 'audit_logs.print', 'audit_logs', 'print', 'Permission to print audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('de4dca4b-5c30-4d2b-81ca-bcc55f2c57e3', 'Delete leads', 'leads.delete', 'leads', 'delete', 'Permission to delete leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('de8fbadb-a992-436c-a4be-731375924430', 'Edit feedback', 'feedback.edit', 'feedback', 'edit', 'Permission to edit feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('dea098c6-2cb9-43e8-8f7a-0914ffba3b57', 'Delete packages', 'packages.delete', 'packages', 'delete', 'Permission to delete packages', '2026-07-23 13:05:58', '2026-07-23 13:05:58');
INSERT INTO `permissions` (`id`, `name`, `code`, `module`, `action`, `description`, `created_at`, `updated_at`) VALUES
('defe78e5-4b05-4958-9714-6d87297916e5', 'Delete designations', 'designations.delete', 'designations', 'delete', 'Permission to delete designations', '2026-07-26 06:56:14', '2026-07-26 06:56:14'),
('e0f0706a-354a-4281-95fd-749753f082ca', 'Create dashboard', 'dashboard.create', 'dashboard', 'create', 'Permission to create dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('e2e3f9bc-ce19-4e92-85ee-bdae36f2b658', 'Edit bookings', 'bookings.edit', 'bookings', 'edit', 'Permission to edit bookings', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('e411f750-ee69-4d79-81f3-7578b5954d8a', 'Approve dashboard', 'dashboard.approve', 'dashboard', 'approve', 'Permission to approve dashboard', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('e496a7aa-ee31-4e4c-b0e1-c3a0d35884f4', 'Approve branches', 'branches.approve', 'branches', 'approve', 'Permission to approve branches', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('e53195cc-19b3-463d-afe8-0f6852c64821', 'Print reports', 'reports.print', 'reports', 'print', 'Permission to print reports', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('e54b3393-126f-490d-9553-82209d2d107b', 'Approve refunds', 'refunds.approve', 'refunds', 'approve', 'Permission to approve refunds', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('e63b79ea-c4fe-48a5-88fc-dba3a76bce51', 'Edit countries', 'countries.edit', 'countries', 'edit', 'Permission to edit countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('e6aa73ee-afd4-44c7-8090-79c37182b9f2', 'Export lead_source_types', 'lead_source_types.export', 'lead_source_types', 'export', 'Permission to export lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('e7eb1560-1d21-4fa2-b8cc-5d77944c6f35', 'Approve leads', 'leads.approve', 'leads', 'approve', 'Permission to approve leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('e9410fea-8f0c-498e-9322-7ef5a5f9be03', 'Create suppliers', 'suppliers.create', 'suppliers', 'create', 'Permission to create suppliers', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('e9f51a00-1d76-4329-a696-45ca52c147b5', 'Delete itineraries', 'itineraries.delete', 'itineraries', 'delete', 'Permission to delete itineraries', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('eae66fb3-2bdc-4c68-8782-09d17c543965', 'Create feedback', 'feedback.create', 'feedback', 'create', 'Permission to create feedback', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('eb97d225-4127-4420-88c4-5f4a4f8ac125', 'View lead_source_types', 'lead_source_types.view', 'lead_source_types', 'view', 'Permission to view lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('ebc77f50-6ba9-4d43-8972-99b66c7a57d9', 'Print expenses_types', 'expenses_types.print', 'expenses_types', 'print', 'Permission to print expenses_types', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('ef931ac3-b21a-4932-a7ff-2a63b276ed9c', 'Print destinations', 'destinations.print', 'destinations', 'print', 'Permission to print destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('f0006737-330e-48cd-9e3f-9241dae1f061', 'Create audit_logs', 'audit_logs.create', 'audit_logs', 'create', 'Permission to create audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('f02dedd0-2ddf-4a35-bffc-763cbff38438', 'View payment_modes', 'payment_modes.view', 'payment_modes', 'view', 'Permission to view payment_modes', '2026-07-25 17:05:10', '2026-07-25 17:05:10'),
('f078df46-2ff0-4725-a1e4-58642788b59a', 'Export drivers', 'drivers.export', 'drivers', 'export', 'Permission to export drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('f0891dfc-7f01-488a-9689-a36736129288', 'Create receipts', 'receipts.create', 'receipts', 'create', 'Permission to create receipts', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('f222471c-e8ad-4dff-b79d-4babf841ec24', 'Export guides', 'guides.export', 'guides', 'export', 'Permission to export guides', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('f2c2b811-0cd1-46f8-8eb7-12c8ba1b3513', 'Approve currencies', 'currencies.approve', 'currencies', 'approve', 'Permission to approve currencies', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('f406d2bb-94bd-4eb6-9e36-ae2bae0b66d1', 'View users', 'users.view', 'users', 'view', 'Permission to view users', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('f4ba338a-d86d-4d29-b0c1-e86578270b24', 'Print lead_statuses', 'lead_statuses.print', 'lead_statuses', 'print', 'Permission to print lead_statuses', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('f5b6284d-2603-4e5c-b0a7-80f61db93d74', 'Edit driver_trips', 'driver_trips.edit', 'driver_trips', 'edit', 'Permission to edit driver_trips', '2026-08-07 18:01:40', '2026-08-07 18:01:40'),
('f605e6a2-ac16-4198-8b87-7644da761fce', 'Edit leads', 'leads.edit', 'leads', 'edit', 'Permission to edit leads', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('f77257a2-91f1-4efc-95ac-dd6df7f8c64a', 'Print enquiries', 'enquiries.print', 'enquiries', 'print', 'Permission to print enquiries', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('f7ae0121-aed4-41e1-a2cd-6d7755a36ae6', 'View designations', 'designations.view', 'designations', 'view', 'Permission to view designations', '2026-07-26 06:56:15', '2026-07-26 06:56:15'),
('f7d458c0-c453-40ac-aaf6-51871abb2c98', 'Create lead_source_types', 'lead_source_types.create', 'lead_source_types', 'create', 'Permission to create lead_source_types', '2026-07-26 14:52:11', '2026-07-26 14:52:11'),
('f8d86787-a536-42f9-85c3-8f72b1e1caf9', 'Edit destinations', 'destinations.edit', 'destinations', 'edit', 'Permission to edit destinations', '2026-07-23 13:05:58', '2026-07-23 13:05:58'),
('fb039733-089a-44ac-88bb-a6f9f369668f', 'Approve audit_logs', 'audit_logs.approve', 'audit_logs', 'approve', 'Permission to approve audit_logs', '2026-07-23 13:05:59', '2026-07-23 13:05:59'),
('fb5b9eab-b771-4916-9548-372170f5ad25', 'Delete driver_trips', 'driver_trips.delete', 'driver_trips', 'delete', 'Permission to delete driver_trips', '2026-08-21 06:53:45', '2026-08-21 06:53:45'),
('fd3584fd-550c-482f-9b16-5139a4234527', 'Approve countries', 'countries.approve', 'countries', 'approve', 'Permission to approve countries', '2026-07-25 17:05:09', '2026-07-25 17:05:09'),
('fe721392-7da9-4e1a-a47f-10a2bb2e12d2', 'Edit drivers', 'drivers.edit', 'drivers', 'edit', 'Permission to edit drivers', '2026-07-26 08:22:10', '2026-07-26 08:22:10'),
('ffc8367f-19e9-4a0a-96f0-95549d5767e3', 'Edit quotations', 'quotations.edit', 'quotations', 'edit', 'Permission to edit quotations', '2026-07-23 13:05:59', '2026-07-23 13:05:59');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quotation_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enquiry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `package_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travel_from` date DEFAULT NULL,
  `travel_to` date DEFAULT NULL,
  `adults` int DEFAULT '1',
  `children` int DEFAULT '0',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `status` enum('draft','sent','accepted','rejected','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `valid_until` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `line_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `itinerary_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pricing` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `quotation_code`, `enquiry_id`, `lead_id`, `customer_name`, `email`, `phone`, `package_id`, `destination_id`, `travel_from`, `travel_to`, `adults`, `children`, `subtotal`, `tax_amount`, `discount`, `total_amount`, `status`, `valid_until`, `notes`, `line_items`, `assigned_to`, `branch_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `itinerary_id`, `pricing`) VALUES
('668ba271-83a6-4146-b44d-9b66d8c6d3fc', 'QT2026-000002', '93ba5676-fab6-4355-a538-adb43375c144', NULL, 'HariPrasadh', NULL, '9387211512', NULL, NULL, '2026-08-28', '2026-08-28', 1, 0, 6500.00, 0.00, 0.00, 6500.00, 'draft', NULL, NULL, '[{\"key\":\"manual:1787934796609\",\"item\":\"Transportation\",\"option\":\"\",\"type\":\"Transportation\",\"event_type\":\"transportation\",\"net\":6500,\"markup_percent\":0,\"gross\":6500}]', NULL, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:33:26', '2026-08-28 16:33:26', NULL, NULL, '{\"gst_mode\":\"no_gst\",\"base_markup_percent\":0,\"extra_markup\":0,\"cgst_percent\":0,\"sgst_percent\":0,\"igst_percent\":0,\"tcs_percent\":0,\"discount\":0,\"line_items\":[{\"key\":\"manual:1787934796609\",\"item\":\"Transportation\",\"option\":\"\",\"type\":\"Transportation\",\"event_type\":\"transportation\",\"net\":6500,\"markup_percent\":0,\"gross\":6500}]}'),
('bc66a696-6432-4b8e-8123-4f89b564d993', 'QT2026-000001', 'a6061c1d-c738-469e-9e71-fc9c9bc2fe90', NULL, 'Prabakaran', 'prabakaran.7009@gmail.com', '9965557009', NULL, NULL, '2026-08-28', '2026-08-28', 21, 0, 6000.00, 0.00, 0.00, 6000.00, 'draft', NULL, NULL, '[{\"key\":\"manual:1787906830701\",\"item\":\"Transportation\",\"option\":\"\",\"type\":\"Transportation\",\"event_type\":\"transportation\",\"net\":6000,\"markup_percent\":0,\"gross\":6000}]', NULL, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:47:21', '2026-08-28 08:47:21', NULL, NULL, '{\"gst_mode\":\"gst_on_total\",\"base_markup_percent\":0,\"extra_markup\":0,\"cgst_percent\":0,\"sgst_percent\":0,\"igst_percent\":0,\"tcs_percent\":0,\"discount\":0,\"line_items\":[{\"key\":\"manual:1787906830701\",\"item\":\"Transportation\",\"option\":\"\",\"type\":\"Transportation\",\"event_type\":\"transportation\",\"net\":6000,\"markup_percent\":0,\"gross\":6000}]}');

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date NOT NULL,
  `transaction_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `replaced_by` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `is_revoked`, `replaced_by`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
('03fa6937-8cc4-4fd4-b6f2-7b5064c40e34', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyNDkyOSwiZXhwIjoxNzkwNDE2OTI5fQ.cuvAg1G5JGjx7n-E4maDADXi7MEp2pJbXOwVQlaS3SY', '2026-09-26 10:02:09', 0, NULL, '27.60.166.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 10:02:09', '2026-08-27 10:02:09'),
('068037c0-9af3-4fff-84f7-6b07063859f1', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNzkwMSwiZXhwIjoxNzg4NTEyNzAxfQ.skopDZ8jGE3z1lrBJq2-fgap7L5f8qWOZnWpdXV_Zvo', '2026-09-04 09:05:01', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMjg4MSwiZXhwIjoxNzg4NTE3NjgxfQ.Bm2Q8wL-5emQtjMsmRDMqubRbfdULScEq35-0t3il-g', '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-28 09:05:01', '2026-08-28 10:28:01'),
('07b7e40a-ed9d-4bd7-b966-4f77ec185ff3', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4Nzg5OTg2MSwiZXhwIjoxNzkwNDkxODYxfQ.bfHCtJJslFgGigLeCn_eAoVEiqnQwVyl90iXyEKco2U', '2026-09-27 06:51:01', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwMDc2MywiZXhwIjoxNzg4NTA1NTYzfQ.pBcRhEGTq1Z-OhPc3jZ4aIb7iuNBz0PsdMm-vQvTDMU', '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-28 06:51:01', '2026-08-28 07:06:03'),
('12c177fc-b1bd-4527-815c-623568fc8943', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNjA0MSwiZXhwIjoxNzg4NTQwODQxfQ.a4-rhkEhAI1F2JYbIraODPVQlV3SKSq84rA0iD7T_Jo', '2026-09-04 16:54:01', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNjk2OSwiZXhwIjoxNzg4NTQxNzY5fQ.2XBN6bgOPD8_buIEGRAbrKt_0ubeHbdc9BM07kpMQCU', '122.167.158.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 16:54:01', '2026-08-28 17:09:29'),
('13f5ce95-6b74-4193-a4b4-bd26c77d339e', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNjk2OSwiZXhwIjoxNzg4NTQxNzY5fQ.2XBN6bgOPD8_buIEGRAbrKt_0ubeHbdc9BM07kpMQCU', '2026-09-04 17:09:29', 0, NULL, '122.167.158.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 17:09:29', '2026-08-28 17:09:29'),
('2bbdb4db-b7fa-4a89-8d3a-e6881b95e7bd', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyMjg0MiwiZXhwIjoxNzkwNDE0ODQyfQ.jh8wfkvlBiWO7ZI-aALCvaD6tbfoxoAd2yikMIYA7oY', '2026-09-26 09:27:22', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyMzgyNywiZXhwIjoxNzg4NDI4NjI3fQ.RYtzP1o9zwopsEsUCST2A-GpF7gJ1KKZKZ3EPOL7s5o', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 09:27:22', '2026-08-27 09:43:47'),
('3ea7e69d-a2cb-4663-8b80-d0f6414e4a19', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkyMjg2NSwiZXhwIjoxNzkwNTE0ODY1fQ.8PAUoYhhOwHz-6nv_j1JP_3H8fOMappsbkG7n7RwW7g', '2026-09-27 13:14:25', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkyMzc5NCwiZXhwIjoxNzg4NTI4NTk0fQ.v5r5xg1Nk6HeRqgPeS7vLxh6DD38Mvn9D7mGHzPz86I', '182.60.75.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 13:14:25', '2026-08-28 13:29:54'),
('40911a96-afa9-4545-ab89-a4973061608b', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkyNDcwNSwiZXhwIjoxNzg4NTI5NTA1fQ.2jsvllYf2Rnd6mWHmsJtg4whm7z6qMCqdpRTizHhzaQ', '2026-09-04 13:45:05', 0, NULL, '182.60.75.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 13:45:05', '2026-08-28 13:45:05'),
('419b67de-0557-4087-b0f1-6909ae6b9a56', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNjc3NCwiZXhwIjoxNzg4NTExNTc0fQ.H5bcidejHgk0R0UmdyWnVq_BdBbKkbDpGlKZ7TO1C2U', '2026-09-04 08:46:14', 0, NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 08:46:14', '2026-08-28 08:46:14'),
('5c671068-1139-483d-97c9-47702b8618c7', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNTAzNSwiZXhwIjoxNzg4NTA5ODM1fQ.9f2oT-mwqYtry2naSAmOp0M_s6yaoBKki3fUratlB0c', '2026-09-04 08:17:15', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNzkwMSwiZXhwIjoxNzg4NTEyNzAxfQ.skopDZ8jGE3z1lrBJq2-fgap7L5f8qWOZnWpdXV_Zvo', '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-28 08:17:15', '2026-08-28 09:05:01'),
('5e370d3d-a43a-48bc-9f72-dcfd0db9e811', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNTg2NywiZXhwIjoxNzkwNDk3ODY3fQ.JpMNjynBDP6i00Vi70fGN25UEO9nSWMH8QtF-DM8Nw4', '2026-09-27 08:31:07', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNjc3NCwiZXhwIjoxNzg4NTExNTc0fQ.H5bcidejHgk0R0UmdyWnVq_BdBbKkbDpGlKZ7TO1C2U', '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 08:31:07', '2026-08-28 08:46:14'),
('659d9ca9-5c3c-4c9d-bf8a-c50a90af258a', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMjg4MSwiZXhwIjoxNzg4NTE3NjgxfQ.Bm2Q8wL-5emQtjMsmRDMqubRbfdULScEq35-0t3il-g', '2026-09-04 10:28:01', 0, NULL, '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-28 10:28:01', '2026-08-28 10:28:01'),
('75886099-ec47-4363-ad15-9aac5e6d01de', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzNTQ3MSwiZXhwIjoxNzg4NDQwMjcxfQ.C0uFUnUGyWrpUij7JWKMpot8yU34xjLFXfapU0v3PJ8', '2026-09-03 12:57:51', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzODc0OSwiZXhwIjoxNzg4NDQzNTQ5fQ.7MGZgDBC_RkGNst10A5wfJztm-8UnJ7_YGibVhXyfF4', '171.79.49.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-27 12:57:51', '2026-08-27 13:52:29'),
('7aeae909-0727-4535-a2df-0bd45a6d8cca', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxNDEzNywiZXhwIjoxNzg4NTE4OTM3fQ.oGjkWhIfNXdQiMGEJZ6wrL992UCwMqpJtVWXBHmk-Gw', '2026-09-04 10:48:57', 0, NULL, '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 10:48:57', '2026-08-28 10:48:57'),
('7ea2bb5c-21c8-4bbf-adf3-b4ea6f36f3a7', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyMzgyNywiZXhwIjoxNzg4NDI4NjI3fQ.RYtzP1o9zwopsEsUCST2A-GpF7gJ1KKZKZ3EPOL7s5o', '2026-09-03 09:43:47', 0, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 09:43:47', '2026-08-27 09:43:47'),
('890ce962-1ff0-423c-a0fc-edb0ae952b12', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyNDM4MSwiZXhwIjoxNzkwNDE2MzgxfQ.7ZW10iGRT3xwLNyi_raB5TG-YbCE_4VO2hRUtSn9KYw', '2026-09-26 09:53:01', 0, NULL, '103.148.134.193', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 09:53:01', '2026-08-27 09:53:01'),
('8b20900c-11e1-4b5e-aa9e-c1596a756dbb', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyODY5MSwiZXhwIjoxNzkwNDIwNjkxfQ.b4dWykwRWKRAT7ISIPZ-RpXifJLnG_EWj3CT9i_MzXU', '2026-09-26 11:04:51', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzNDUzOSwiZXhwIjoxNzg4NDM5MzM5fQ.5-6LIM9uxkQy0788gve5eOFtWyl6HjhWvJqlikLlsbs', '171.79.55.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-27 11:04:51', '2026-08-27 12:42:19'),
('944ecb8f-c21d-4987-9351-4ac758227e75', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxODc5NiwiZXhwIjoxNzkwNTEwNzk2fQ._f04OHqT6YIaErJbk_di7p7AsPkuH6W6JfCGKjEdKlc', '2026-09-27 12:06:36', 1, NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 12:06:36', '2026-08-28 12:07:18'),
('945cbf5e-6055-4664-b49e-ef09034876d3', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzODc0OSwiZXhwIjoxNzg4NDQzNTQ5fQ.7MGZgDBC_RkGNst10A5wfJztm-8UnJ7_YGibVhXyfF4', '2026-09-03 13:52:29', 0, NULL, '171.79.62.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-27 13:52:29', '2026-08-27 13:52:29'),
('95e611b0-f69e-4819-b508-16d0aeceb9b3', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxNzE2NSwiZXhwIjoxNzkwNTA5MTY1fQ.PIsjxNs7os9iNLzHSsfe3r4oUTBRvhj3Wf-z7iRT2Gs', '2026-09-27 11:39:25', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxODA2OSwiZXhwIjoxNzg4NTIyODY5fQ.E3fxIOMC50_4F9asqNxXMlT8RyP6dipwCHx0Svro98Y', '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 11:39:25', '2026-08-28 11:54:29'),
('9a550e60-c12c-4cf9-b070-db7404e49b9e', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMjgzNywiZXhwIjoxNzg4NTE3NjM3fQ.XiMJjbVhoOr13KqhHOxxrgmWB7Gd4ipJv_WVjDp6aCU', '2026-09-04 10:27:17', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxNDEzNywiZXhwIjoxNzg4NTE4OTM3fQ.oGjkWhIfNXdQiMGEJZ6wrL992UCwMqpJtVWXBHmk-Gw', '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 10:27:17', '2026-08-28 10:48:57'),
('9c289764-a3e7-4be7-baa1-add0667b9782', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyMzgzNCwiZXhwIjoxNzkwNDE1ODM0fQ.J1CCSXa-SyhuHNEekCfyzc3CPIdIkeHwGGRoWY-B-Gg', '2026-09-26 09:43:54', 0, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 09:43:54', '2026-08-27 09:43:54'),
('a515e356-de45-4a00-924f-653ef5451fa7', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwMDc2MywiZXhwIjoxNzg4NTA1NTYzfQ.pBcRhEGTq1Z-OhPc3jZ4aIb7iuNBz0PsdMm-vQvTDMU', '2026-09-04 07:06:03', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNTAzNSwiZXhwIjoxNzg4NTA5ODM1fQ.9f2oT-mwqYtry2naSAmOp0M_s6yaoBKki3fUratlB0c', '223.181.218.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-28 07:06:03', '2026-08-28 08:17:15'),
('ada8beb2-9c38-4198-896a-717d370b3c29', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxODg3MywiZXhwIjoxNzkwNTEwODczfQ.CcKpUXKHlwyJULzDjpqN2IGKuelimFzRBwsFtfwiKOw', '2026-09-27 12:07:53', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzMzI3OSwiZXhwIjoxNzg4NTM4MDc5fQ.7jhWL_tmma9sNFOR6hNBZtQLo9LoaSs-7Mpvqjl82Lc', '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 12:07:53', '2026-08-28 16:07:59'),
('be5f4c2a-fd11-4b77-8a6a-24a771173e01', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwNDUzOSwiZXhwIjoxNzkwNDk2NTM5fQ._Fbz4Dfn_y6DqKHefAPCiROP9d3_hcY3JR3GXU0Px-Y', '2026-09-27 08:08:59', 1, NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 08:08:59', '2026-08-28 08:16:56'),
('d413ff41-ab1a-489b-a12f-f8acc44c01e2', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzMzI3OSwiZXhwIjoxNzg4NTM4MDc5fQ.7jhWL_tmma9sNFOR6hNBZtQLo9LoaSs-7Mpvqjl82Lc', '2026-09-04 16:07:59', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNDIwOCwiZXhwIjoxNzg4NTM5MDA4fQ.Jfl4CNw_mJCkpeF0JHSA_dCYEW2lp9-afRE2BxzMAhI', '122.167.158.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 16:07:59', '2026-08-28 16:23:28'),
('dca3b6e6-93d0-4458-afc5-652e5918d68d', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNzM1NCwiZXhwIjoxNzkwNTI5MzU0fQ.rzn-CkCaBjNq3ilLA51tyhLB5Yrnq5r5c7wxnJdHFoE', '2026-09-27 17:15:54', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzODQ1OSwiZXhwIjoxNzg4NTQzMjU5fQ.Tux9IwY-FzDrWulsgYfsWPd-XIVfRGTSm7pUdbv8DL0', '157.51.71.203', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 17:15:54', '2026-08-28 17:34:19'),
('dd8ff4bd-f58c-4847-899e-c3284a84f251', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNTEzMCwiZXhwIjoxNzg4NTM5OTMwfQ.eFZNHjqW_sFxTCR8sgL21FYX4ZYjuuNtBxMlf-6YUv8', '2026-09-04 16:38:50', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNjA0MSwiZXhwIjoxNzg4NTQwODQxfQ.a4-rhkEhAI1F2JYbIraODPVQlV3SKSq84rA0iD7T_Jo', '122.167.158.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 16:38:50', '2026-08-28 16:54:01'),
('ddb1a11b-f70f-4b72-b8ab-79f49381f360', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkwMDk1MCwiZXhwIjoxNzkwNDkyOTUwfQ.SDKYyj_mVJuZEWIATsgejYdE0nCw5AHuqX9Xhuf2T5I', '2026-09-27 07:09:10', 0, NULL, '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 07:09:10', '2026-08-28 07:09:10'),
('de339b97-e4d7-456c-bd1a-5735c07ab8ba', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkyMzc5NCwiZXhwIjoxNzg4NTI4NTk0fQ.v5r5xg1Nk6HeRqgPeS7vLxh6DD38Mvn9D7mGHzPz86I', '2026-09-04 13:29:54', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkyNDcwNSwiZXhwIjoxNzg4NTI5NTA1fQ.2jsvllYf2Rnd6mWHmsJtg4whm7z6qMCqdpRTizHhzaQ', '182.60.75.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 13:29:54', '2026-08-28 13:45:05'),
('de66fc8f-c59a-4c2b-8cb6-b7ce907d3a03', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzNDUzOSwiZXhwIjoxNzg4NDM5MzM5fQ.5-6LIM9uxkQy0788gve5eOFtWyl6HjhWvJqlikLlsbs', '2026-09-03 12:42:19', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgzNTQ3MSwiZXhwIjoxNzg4NDQwMjcxfQ.C0uFUnUGyWrpUij7JWKMpot8yU34xjLFXfapU0v3PJ8', '171.79.49.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-27 12:42:19', '2026-08-27 12:57:51'),
('e06df39d-6b65-43bc-91b8-390c7964a529', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxODA2OSwiZXhwIjoxNzg4NTIyODY5fQ.E3fxIOMC50_4F9asqNxXMlT8RyP6dipwCHx0Svro98Y', '2026-09-04 11:54:29', 0, NULL, '223.185.26.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 11:54:29', '2026-08-28 11:54:29'),
('e89d90db-2e34-496e-90de-04c9fe54815e', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMDA0NCwiZXhwIjoxNzkwNTAyMDQ0fQ.weQzhXwJGDp0Wtq2-EwpMbkut6nEejcBSsBPDDSbU8E', '2026-09-27 09:40:44', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMTc3NCwiZXhwIjoxNzg4NTE2NTc0fQ.slycFl-sIRquEM0mx2YazAFYnWPVLPIOy94bL1Tv0j8', '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 09:40:44', '2026-08-28 10:09:34'),
('ebef2cc8-779d-4a02-bef5-1615e83dc6a9', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMTc3NCwiZXhwIjoxNzg4NTE2NTc0fQ.slycFl-sIRquEM0mx2YazAFYnWPVLPIOy94bL1Tv0j8', '2026-09-04 10:09:34', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkxMjgzNywiZXhwIjoxNzg4NTE3NjM3fQ.XiMJjbVhoOr13KqhHOxxrgmWB7Gd4ipJv_WVjDp6aCU', '106.192.172.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 10:09:34', '2026-08-28 10:27:17'),
('f7fe511d-65d3-4b6f-9cc5-a4556fb86d61', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzODQ1OSwiZXhwIjoxNzg4NTQzMjU5fQ.Tux9IwY-FzDrWulsgYfsWPd-XIVfRGTSm7pUdbv8DL0', '2026-09-04 17:34:19', 0, NULL, '157.51.71.203', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 17:34:19', '2026-08-28 17:34:19'),
('fcb08616-6df0-4e9e-815c-ab9e2f1462f5', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzgyMjU0MCwiZXhwIjoxNzkwNDE0NTQwfQ.RYRkS5dCM9aTwXRjEHtbbrU9rkC5RmabA29rxsR_EEo', '2026-09-26 09:22:20', 0, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-27 09:22:20', '2026-08-27 09:22:20'),
('ff653d67-7eed-4c8a-901f-35ef7ec95659', 'f86a621a-7197-41d2-9395-b53d4205f00c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNDIwOCwiZXhwIjoxNzg4NTM5MDA4fQ.Jfl4CNw_mJCkpeF0JHSA_dCYEW2lp9-afRE2BxzMAhI', '2026-09-04 16:23:28', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NzkzNTEzMCwiZXhwIjoxNzg4NTM5OTMwfQ.eFZNHjqW_sFxTCR8sgL21FYX4ZYjuuNtBxMlf-6YUv8', '122.167.158.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 16:23:28', '2026-08-28 16:38:50');

-- --------------------------------------------------------

--
-- Table structure for table `refunds`
--

CREATE TABLE `refunds` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refund_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','processed','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `code`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'Sales Agent', 'sales_agent', 'Sales and lead management', 1, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-07-23 13:05:59', '2026-07-25 17:35:50', NULL),
('1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'Super Admin', 'super_admin', 'Full system access', 1, NULL, NULL, '2026-07-23 13:05:59', '2026-07-23 13:05:59', NULL),
('cf3a3b3a-6aeb-4037-916d-8056565c1f70', 'Driver', 'driver', 'Driver portal access for assigned trips', 1, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-07 18:01:40', '2026-08-28 11:57:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
('00b62ef7-33b4-45a4-8548-12f480341ab0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '93b92c12-07fe-4fd7-a7b7-30b2d17304ad', '2026-08-21 06:53:46'),
('01c35c49-8676-4e7b-9e34-f9d48b5d9c4e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '87ca124a-bf16-4015-a774-ec820d2b7a12', '2026-08-21 06:53:46'),
('01e04385-be1d-41d7-aaaf-993855d6b8f7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '105929f0-fc3c-4320-92ee-5bc3f4f6a80b', '2026-08-21 06:53:46'),
('024ffafb-a4b9-45c8-b1a6-d165f9d89310', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6c23cb35-8f83-40d9-a684-28b1b9a6b9a7', '2026-08-21 06:53:46'),
('053f955e-0d80-4734-aa23-f73c92eae5ce', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7e99e95e-010d-4ab9-a1a3-897812b44dc5', '2026-08-21 06:53:46'),
('05784701-6b57-4f6a-9d47-2aff556a6d39', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'defe78e5-4b05-4958-9714-6d87297916e5', '2026-08-21 06:53:46'),
('05803672-1533-4fda-a6f5-551d3a3843e5', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'fb039733-089a-44ac-88bb-a6f9f369668f', '2026-08-21 06:53:46'),
('05e2e9f4-ac2f-4213-a09c-bd6d318808c3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '94c4c9a3-c9fd-4664-94f5-80a684deb62d', '2026-08-21 06:53:46'),
('060003af-da0a-457b-ba7f-43f765edfe3a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '73d1f2ca-3ee8-4c84-910f-9aca46c28ced', '2026-08-21 06:53:46'),
('06fd2dd7-a149-40e0-8f6d-ee0a008e9efe', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f0891dfc-7f01-488a-9689-a36736129288', '2026-08-21 06:53:46'),
('0774fa2d-ab21-47a3-86fd-6851f5980285', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3725ab57-4fa3-4226-9b7e-d0d8217c2859', '2026-08-21 06:53:46'),
('07dee409-bb10-4657-aafb-011865d63a64', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2265cb3f-72ab-4264-a708-f62d98df8a4d', '2026-08-21 06:53:46'),
('09575e99-016d-4d55-9d00-b57a25ddefdf', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9d6d4bb2-ff1f-4d35-9dcb-3aee8504820d', '2026-08-21 06:53:46'),
('09e7f635-7d65-4288-ac4f-498b2dfb20fc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5519f9c1-895b-4f4b-875a-910162571e5d', '2026-08-21 06:53:46'),
('0b1d7f36-ce6c-4e5f-b7f8-89b2082f71d1', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '66c2096c-ae85-4c2a-9d2e-9ab31b74a606', '2026-08-21 06:53:46'),
('0bbb6e7b-8789-43e1-bcb7-12841fb424dd', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '613f9c9b-29c2-4e1d-a781-0d6223ac39ed', '2026-08-21 06:53:46'),
('0bbdbe7e-7fb9-4954-805c-2bd522e5c0da', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ba039e37-aa78-4377-a1ef-cf7e5ebc77dd', '2026-08-21 06:53:46'),
('0c2d8080-f3bf-468e-80db-c26653edb3b8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f02dedd0-2ddf-4a35-bffc-763cbff38438', '2026-08-21 06:53:46'),
('0d0f82f7-d128-42bc-8ccb-4e05ca6ed04a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c5008f10-c80c-4e2d-830a-53307e034882', '2026-08-21 06:53:46'),
('0dc543a4-da24-4a49-887e-958a88645d1b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1e09f584-09ef-4215-ac55-b1120c918f9e', '2026-08-21 06:53:46'),
('0ea0aab4-64aa-4459-8e53-1c9e6eb2b3c1', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b7e1cc92-372d-4dd1-bdc2-17b3768519cc', '2026-08-21 06:53:46'),
('0ff416ee-2f25-4042-8de0-a8b2ab6b83c7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8475464d-22d3-4f36-b7dc-ec4a18cc9b6c', '2026-08-21 06:53:46'),
('1019b21e-37bb-4fc8-9973-d540238bd223', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5a640330-ef26-49ad-b4c1-47033bf147b5', '2026-08-21 06:53:46'),
('1145ecef-61e0-4f42-bbe7-aa89add03002', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bbe98d1c-7740-44eb-9d64-e0d6135cd532', '2026-08-21 06:53:46'),
('11ee567d-dc13-41f8-93dd-cc20529cf4ce', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '89f97d05-124d-426d-84d6-27d72076e223', '2026-08-21 06:53:46'),
('12bf4341-24ec-4f0f-a2d5-5bc5f9b5e51a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ad03fb83-0e5e-4010-9e38-e3d68fbd1c9e', '2026-08-21 06:53:46'),
('14926eab-3120-4947-b410-8a69a3b99d97', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6ae8ce97-7980-41dd-b897-b0d31a4799e8', '2026-08-21 06:53:46'),
('14ae4bc6-7f3e-4e9d-9a4a-5a48fcd9cbff', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '122e2687-03e8-4007-891c-63927fabc4d3', '2026-08-21 06:53:46'),
('156ea067-5488-4f34-a9e5-009020235079', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6148bd0d-5775-44aa-a287-ab8b598aea80', '2026-08-21 06:53:46'),
('15949fdf-f34d-4146-ab61-ebdea22bc569', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '26462164-bb04-4dcd-a660-5f573027911c', '2026-08-21 06:53:46'),
('162d74b2-f346-4358-8add-d76ca9a3ac9a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '808ee7ab-af7e-463c-8d1e-2ac51dcdb739', '2026-08-21 06:53:46'),
('16c643d1-6dc8-442b-b26d-9a1e53555f9f', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'ffc8367f-19e9-4a0a-96f0-95549d5767e3', '2026-08-21 06:53:47'),
('16d4272c-e14b-4830-b091-0d3a2fbc6df3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd3aee415-6fad-4aff-a40e-c9188f1efc5f', '2026-08-21 06:53:46'),
('17fa8212-deeb-45d2-a6d5-2cf4bba47cdd', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9a3691f0-2198-4860-a9e4-2a338ada09e2', '2026-08-21 06:53:46'),
('1806a20d-5436-4db6-884a-c470179bddb6', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ab3602f2-5542-45c4-8812-18079c8165c1', '2026-08-21 06:53:46'),
('193cbe16-ab6f-41b3-9a5e-65faf19423c9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e0f0706a-354a-4281-95fd-749753f082ca', '2026-08-21 06:53:46'),
('1a28c3a6-b017-4084-9e9a-939ce0bbac8a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a9e8ba80-9c5e-4b78-8725-10433594e405', '2026-08-21 06:53:46'),
('1ea970e5-5cf0-4fc6-ac9c-4b0dffd3b588', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '992e6265-74c1-49ab-97b2-2a44938c397a', '2026-08-21 06:53:46'),
('1f36b981-ded4-4e02-bd34-6837117a1a65', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '85daaed1-2450-4a50-ab86-cc30c896bc77', '2026-08-21 06:53:46'),
('1f7a0818-895a-45b6-8e8f-2556771349d3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '33ddfb52-fae9-4d4a-8a45-9544e4b5129a', '2026-08-21 06:53:46'),
('202c98ca-69b1-4978-8dc1-aef54a852b40', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '15d67707-4848-4a12-872a-6057668a4242', '2026-08-21 06:53:46'),
('20449bab-a8f4-4e70-88da-4be870dc4799', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4ab9efcd-2ddb-4bc7-ae9a-3a82f15bbc1a', '2026-08-21 06:53:46'),
('2170108b-f0f8-4b25-a23f-255af1373bf8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '24955386-a05e-4756-9fee-de707ceaf8b7', '2026-08-21 06:53:46'),
('22c95993-395b-4609-b6f2-b3ea3ff50681', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a092aa34-f77d-4ef0-9344-c37f34004bdf', '2026-08-21 06:53:46'),
('237bd45f-bd78-45e2-ad19-c4349c34dd74', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5228bee0-01b1-4a83-b074-273e77351c95', '2026-08-21 06:53:46'),
('24956dc1-da4c-43cb-a837-554a3dead23d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a9752f05-ca0d-46b9-9ff4-bd809146918c', '2026-08-21 06:53:46'),
('25329a83-950e-4d62-919c-d393c574ea9a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e9f51a00-1d76-4329-a696-45ca52c147b5', '2026-08-21 06:53:46'),
('26966126-8041-4901-8454-8014256d91ca', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '21813b1c-42df-4445-967f-ecfc4b7c9875', '2026-08-21 06:53:46'),
('26c1e1f2-9d01-4ae7-8407-650f962bb6b3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '93ec72f5-4e26-4927-a466-2e662732afcd', '2026-08-21 06:53:46'),
('2733fea5-3bdd-48e3-9e8a-828c76f0d036', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e411f750-ee69-4d79-81f3-7578b5954d8a', '2026-08-21 06:53:46'),
('27882f5d-9976-40d1-8fce-db87faa4f6b8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '61e9cf30-7ea6-48f5-9f92-418f056ca432', '2026-08-21 06:53:46'),
('27d8b168-99b8-4264-be17-bab5505fb523', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f0006737-330e-48cd-9e3f-9241dae1f061', '2026-08-21 06:53:46'),
('281a1956-5d98-4457-87de-7cb9c8eaf7aa', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4a91dc67-d8d2-40cc-a3fa-8465ebf3de7e', '2026-08-21 06:53:46'),
('2a18ae6c-361c-4f8c-a727-70047ec702f4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '24daa47d-4926-40c4-8771-dc118b1bc71c', '2026-08-21 06:53:46'),
('2a5945f9-534e-4ac3-8758-c5a7bf595896', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8cf5415c-2adf-47bb-a08b-04257be53901', '2026-08-21 06:53:46'),
('2afa8af9-49d5-4d74-9f4b-9621ab91048e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f7ae0121-aed4-41e1-a2cd-6d7755a36ae6', '2026-08-21 06:53:46'),
('2b60dab4-7d8c-402c-af43-0c4527c1dba9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9970f296-0f1e-431a-9f76-022a0a1b8ee5', '2026-08-21 06:53:46'),
('2d2dcfc9-b2c8-4401-885d-76243e5ea2f9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'baf5bd69-922c-4e81-b9d9-b52f21fbd216', '2026-08-21 06:53:46'),
('2d867ce1-6cc3-4fe9-8c96-16f7808f88cc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '24b306c9-3df0-4921-8476-13757f36d623', '2026-08-21 06:53:46'),
('2db13c4f-f006-48a1-921e-ace3d9560aed', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a5a636d2-7d30-4114-9892-ed64199ce70e', '2026-08-21 06:53:46'),
('2e8ecddc-a2ad-4ef8-9bd1-5c8166a3c817', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a25b4cb3-4755-49f6-85c5-35e52eb106fb', '2026-08-21 06:53:46'),
('2f876cfd-6dcc-4eaa-bbe3-61289f19cae9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6d2db5b0-d769-4d67-bc72-c5546674b237', '2026-08-21 06:53:46'),
('2f8a10cb-f1e3-4360-bf35-03bf1a8cffef', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '77b3d103-9980-47ce-ba7e-1524f25ae946', '2026-08-21 06:53:47'),
('2fb8f634-03cc-40de-86e0-83a0f3e59852', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '032a2335-f104-429c-8421-43609d1c6958', '2026-08-21 06:53:46'),
('30d0677f-2286-4299-b8ff-6fc126b671bc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1efd4937-5221-441a-9369-2f216c3a9a51', '2026-08-21 06:53:46'),
('30dbcf0a-32b8-458f-8a38-aef0c69c036b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9b55906d-afe0-44f1-b6b1-097520cfe6d6', '2026-08-21 06:53:46'),
('316767e6-62bf-4ee9-8e6a-a93c87d1526c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7e7927d6-812f-4d4a-83ce-9b46b339c77f', '2026-08-21 06:53:46'),
('31a6e92c-d823-40d0-b2ea-07c32b8cec67', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5b62467c-a822-4663-9ddd-cab998fa8acf', '2026-08-21 06:53:46'),
('31f70f4f-82a6-44fd-a4b7-8f16e9b8d15e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'eae66fb3-2bdc-4c68-8782-09d17c543965', '2026-08-21 06:53:46'),
('338203de-df4e-4f34-96ec-308cb437cc92', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '726199d9-84c1-4143-9bcb-06e4be9da8f7', '2026-08-21 06:53:46'),
('341c8b97-4ef5-4643-949a-8089c5d509ee', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ad360ee8-e13a-479e-9171-a803f627a4be', '2026-08-21 06:53:46'),
('3466a407-8de1-4211-a300-96f8b281790f', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '70c78767-d830-4749-9233-7e6238ba33c7', '2026-08-21 06:53:47'),
('358e982d-743e-4c55-b8df-ce7e0108ae70', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b38189b3-d6d1-4f08-8059-52eb410f32ad', '2026-08-21 06:53:46'),
('35a0aea5-f6b6-4dd0-87b1-84cedd2b952d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f222471c-e8ad-4dff-b79d-4babf841ec24', '2026-08-21 06:53:46'),
('361ef300-312b-4583-b9ce-15d0b3aa2b83', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '836f11f1-2c28-47c0-9a04-e3d8e6368d71', '2026-08-21 06:53:46'),
('36b0c8df-3171-48d6-869a-2b895ad63b0b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8fac81b2-a84a-4259-86ba-23d7f42f26eb', '2026-08-21 06:53:46'),
('3785f4f1-2dfe-448e-bfcf-d65f1a2bd15f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f406d2bb-94bd-4eb6-9e36-ae2bae0b66d1', '2026-08-21 06:53:46'),
('37d6952d-442c-423f-b9f8-a2527f597c14', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '06dec6e1-e9fb-4bab-9b63-76cbd480cefc', '2026-08-21 06:53:46'),
('37dd9d6e-af01-4c2f-9b0d-c1cdd7aebe85', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9c78aad6-cbf5-4087-8d2c-71b1428b1ff1', '2026-08-21 06:53:46'),
('38bbc546-9796-4da5-b645-843552e9b546', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3589519f-9305-4102-879d-3996bfeb0b66', '2026-08-21 06:53:46'),
('3aa6a843-cb8d-4f94-8ee9-331730f085df', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '29befea9-d7e5-48e0-8af8-95863048525d', '2026-08-21 06:53:46'),
('3b1fc7b1-d67a-408b-ace2-f2a7b07e7413', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'da4f4699-b42e-4108-991a-8656e5371c0b', '2026-08-21 06:53:46'),
('3bdb441f-32c3-4ac6-be53-40928fe7d78f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '70c78767-d830-4749-9233-7e6238ba33c7', '2026-08-21 06:53:46'),
('3c5c90d1-ce1c-4192-a22c-06c184d668df', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '56e76980-3c37-4757-85e6-b40ce6924886', '2026-08-21 06:53:46'),
('3c77d48f-5134-4cee-b602-10340e450702', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '8d64993c-42f4-4333-a92b-e4c9343cdd80', '2026-08-21 06:53:47'),
('3c847a94-0d47-48ee-ad27-3042d33d3b9d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '827db1c2-8c32-4d0d-9e81-c3f433306e61', '2026-08-21 06:53:46'),
('3d1a4a94-4b3e-48a5-97fe-b4a770233bdb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7a3da6fe-ab4d-421a-a2c7-e4e4fbc01a12', '2026-08-21 06:53:46'),
('3e5a296f-e734-421f-82bb-2812a99d9af7', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '4ab9efcd-2ddb-4bc7-ae9a-3a82f15bbc1a', '2026-08-21 06:53:47'),
('3e988fbd-d8dd-45f7-aa97-c26722fb85bc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '310182d5-3205-4884-b8d4-fdcc3e01fc9a', '2026-08-21 06:53:46'),
('3e9de20a-ec62-45d3-a972-8a80c8a960f3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '77b3d103-9980-47ce-ba7e-1524f25ae946', '2026-08-21 06:53:46'),
('3f53216d-a7e2-45df-a25a-9d3f478f67ee', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7e07d1f0-dc24-446c-9456-5cc3def467c9', '2026-08-21 06:53:46'),
('3f7ca05e-14d6-4ea7-b9c5-c124048a4241', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b209348b-1349-4ce5-8d32-1d38aee48d66', '2026-08-21 06:53:46'),
('400d12cf-43ff-40e5-b3f1-fdf7d628ff81', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '73ddd1e1-a4bc-429d-91e9-a6f15852c724', '2026-08-21 06:53:46'),
('4102e85c-54a3-4dd9-a789-7116fafcd387', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '05e8764d-cb30-43ed-98a3-a5e7fee7bd10', '2026-08-21 06:53:46'),
('41a43ca9-31dc-4d7d-b808-30740b838368', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f2c2b811-0cd1-46f8-8eb7-12c8ba1b3513', '2026-08-21 06:53:46'),
('4200d294-0ea0-4989-9f2c-0d9af53227d7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7ceafee9-45dd-44bb-a5d4-3eb5e6cece4c', '2026-08-21 06:53:46'),
('4213d23c-33ff-4679-84da-2d965cc2afc8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '65df02a7-3f96-40ed-9068-7bc79a41962e', '2026-08-21 06:53:46'),
('425adea1-e0fd-404a-a761-cf07538b4602', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '0f5ce52e-375f-4aeb-8271-1797325c74e9', '2026-08-21 06:53:47'),
('42af159a-ecf8-4480-a35a-0cee99fe9701', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e9410fea-8f0c-498e-9322-7ef5a5f9be03', '2026-08-21 06:53:46'),
('45f05759-2c90-410c-b165-1406cfedc012', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '59138b17-11e0-469f-ae8f-678c81795208', '2026-08-21 06:53:46'),
('47eafc41-cfee-4106-bd21-51b3658bc792', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f7d458c0-c453-40ac-aaf6-51871abb2c98', '2026-08-21 06:53:46'),
('484f9301-4972-4e2e-b0a6-1e9cfecf1458', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ef931ac3-b21a-4932-a7ff-2a63b276ed9c', '2026-08-21 06:53:46'),
('4a7d3421-cd87-4b9f-8302-83f4a02c20f0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '281c909f-ed2a-4a0c-8d7e-ff3c14d78262', '2026-08-21 06:53:46'),
('4a81accf-dc6a-45e8-a4eb-6601511103e3', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '708362aa-823f-4c35-8f1f-36ad44153df7', '2026-08-21 06:53:47'),
('4a868072-c0bc-4f38-91f5-f9e7b0cf95eb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '212d08d9-85f5-482a-8d5a-564b216b093a', '2026-08-21 06:53:46'),
('4a9afba1-b3b3-4e33-a443-6f555e62cf7e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a70acaab-66f4-442d-9477-3003b7853f36', '2026-08-21 06:53:46'),
('4b11d99f-5e32-418f-b1ea-313bc311b975', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4f96ccd5-5397-4485-af9a-28a0bc72c2f3', '2026-08-21 06:53:46'),
('4bdfe14b-5dfd-4b46-b46d-2a73ee477716', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '01c93b86-3b37-40d4-92fd-f0c08e18a34a', '2026-08-21 06:53:46'),
('4c7d95de-7250-4d4e-a913-95f4acaa4378', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd35a091d-4beb-4387-9498-38ea68870772', '2026-08-21 06:53:46'),
('4cc59bae-1217-49e5-bc11-d2eea90eeac2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1a2e3bb0-81ef-4467-a302-eaf830bad96c', '2026-08-21 06:53:46'),
('4d09c66e-d35f-4d91-bccb-0ad51a196fad', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'cac534ca-d27f-42c7-a417-35df3b291ddd', '2026-08-21 06:53:46'),
('4d37dc5d-037f-410d-968b-de2f6db4ef04', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a9e81bd9-22d9-42c6-963a-3d1ae92e44a0', '2026-08-21 06:53:46'),
('4e64c785-3e5c-4be2-9f12-91b43ceeb046', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2b28550b-7eec-445f-b619-8fbdc69a66da', '2026-08-21 06:53:46'),
('4e87a2f7-06a4-4acc-ba6f-7ab660980c7e', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '4a91dc67-d8d2-40cc-a3fa-8465ebf3de7e', '2026-08-21 06:53:47'),
('4ee5f6d3-e068-4de1-b712-d1ef96c34eab', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8f2496ba-f918-4de6-9c38-8fbfc92db009', '2026-08-21 06:53:46'),
('4fb1b722-9874-45a1-9b45-63489e018be6', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '7e99e95e-010d-4ab9-a1a3-897812b44dc5', '2026-08-21 06:53:47'),
('51577632-5801-4d86-8767-2bfb00986089', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bfa80490-2d0d-4085-bd24-efbf59678ba9', '2026-08-21 06:53:46'),
('51606739-c903-457d-848e-0c60c73b4ed5', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '203ef56a-c578-40ca-adab-f81aac07f25d', '2026-08-21 06:53:46'),
('5230565b-7125-4ded-8dd6-bb277673d1dc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bbe4be5d-a318-4ab3-9ac6-9cb473f0165c', '2026-08-21 06:53:46'),
('529a1eb1-ee99-43b9-ab7b-178ec6f4ec25', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '675072cd-1d35-44b0-8c8c-bc8c32b1d0d0', '2026-08-21 06:53:46'),
('52bb5120-a28d-4743-9a62-690c1ce2c763', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8163bd26-7817-4414-bb20-93ea6c6eff3e', '2026-08-21 06:53:46'),
('531c215e-b3f2-46bd-b362-da1e5fa5e430', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'cc07cfaf-6b26-4faa-bc0f-1f20e7b072a0', '2026-08-21 06:53:46'),
('5443d126-be4a-4575-aa4b-84ea1d381869', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '78a2ecbf-cfa7-4e72-a171-ef86a5b83d9e', '2026-08-21 06:53:46'),
('54e4d35e-3a02-40e1-b59d-b63c83c827c4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '544a0929-56a8-4ab3-a151-12104308726c', '2026-08-21 06:53:46'),
('54e53633-f77a-4ac8-9e6e-28043c05d80d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'fb5b9eab-b771-4916-9548-372170f5ad25', '2026-08-21 06:53:46'),
('57f0de41-be52-46c5-952a-1ab4bcf03611', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c64c8265-971b-462b-b87d-ec328f7e8f62', '2026-08-21 06:53:46'),
('5854f2ac-9f11-4fbe-8866-a14a5ecb7522', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8d64993c-42f4-4333-a92b-e4c9343cdd80', '2026-08-21 06:53:46'),
('5c3e822f-ffe0-434a-a60c-60f272c93706', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '35ab40bb-a62e-48d4-a05d-8defcd40f0e7', '2026-08-21 06:53:46'),
('5cf09f18-45f3-4f95-9778-bfe7a732b65e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8fbc08ba-e370-43b3-804e-42ffe64f74e9', '2026-08-21 06:53:46'),
('5d6f2c00-a490-415e-b14c-4b4666d8c4be', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bbc4616b-cdc7-40f0-b06f-5f473c2d950e', '2026-08-21 06:53:46'),
('5dcdd18b-4081-4c5d-b346-18f7c041e51a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8aca1f7f-82ff-4b89-aa3a-749dc7bfa187', '2026-08-21 06:53:46'),
('5ddaabe0-0448-4110-a909-6fcc1b78163a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4399f0fd-d0d8-4253-82ea-1fb3a8294158', '2026-08-21 06:53:46'),
('5effc676-c363-4882-baf6-38a13cc22756', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b5115b3d-f88b-404a-8b93-bbee2e59c7c3', '2026-08-21 06:53:46'),
('5f0be4be-a91f-4666-a2fb-8110fc193850', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd052d947-1d7d-43c5-a277-0cfb3c52261f', '2026-08-21 06:53:46'),
('5fc7266d-c7b8-48b7-89b1-032f88161f33', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5800f805-96a0-4195-842d-df5d052fbf68', '2026-08-21 06:53:46'),
('6025c4dd-76de-4baa-a47b-3536930b76ac', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a6fd4d35-16b4-41e3-9662-243aa8d48d3d', '2026-08-21 06:53:46'),
('60e2c58f-497e-4bd6-87ac-1e8a5a8693d2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '708362aa-823f-4c35-8f1f-36ad44153df7', '2026-08-21 06:53:46'),
('62ce0ed5-2988-4021-8923-119ab2967255', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '44f6cbd1-8814-429f-b3a4-a24cb5d7b486', '2026-08-21 06:53:46'),
('63c39c1e-94c8-46ad-b967-decee6f5ce1f', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'e0f0706a-354a-4281-95fd-749753f082ca', '2026-08-21 06:53:47'),
('645f8549-9992-4264-b489-9fc6f1105acc', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b88033ed-5c02-4e45-8642-71440bf763bb', '2026-08-21 06:53:46'),
('649025df-80d9-41a4-b05b-41394793678b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'cd698b5e-5c82-43ef-ab43-c0c07e01ce99', '2026-08-21 06:53:46'),
('652cad67-c282-417c-bc74-f7dccccb69d4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '29255f46-ba83-4475-ac02-fd451f121c1a', '2026-08-21 06:53:46'),
('6557f2f7-addd-4715-a53b-1b0abc07b7c9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '12ce1dc4-27a5-4fa0-9499-3b10901f332a', '2026-08-21 06:53:46'),
('66ac6e6e-cd2c-4825-9e9e-de2e75e74f24', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '396f1a98-e470-4a53-892d-8c2de5baa959', '2026-08-21 06:53:46'),
('67bc59be-daf4-4d82-a65a-689baac2b7fe', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c458c788-210b-4852-b9c6-abb42e4c63ac', '2026-08-21 06:53:46'),
('686e309c-cab3-46fa-95c6-d89bae9ff49d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c9d212f6-1b49-4b80-ba99-5e5856b3f02e', '2026-08-21 06:53:46'),
('69e1266e-2a14-4859-9d12-db6c8862cc6d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '67213852-8a74-47a0-9208-31f94984e3e2', '2026-08-21 06:53:46'),
('6a791470-8134-478c-b8a9-52ed1e216408', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9963aeaa-e619-4e72-b805-cbc6d7a736ed', '2026-08-21 06:53:46'),
('6ca8cd65-7601-4e81-aabf-e11eba770989', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '06e6363b-27be-4230-9ca2-61ab1b3401b6', '2026-08-21 06:53:46'),
('6d240d8e-6b95-4a3c-be6f-6c1d0736dc0c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '89e1627a-c3b7-4224-a4f6-b5b2bcfd1ee4', '2026-08-21 06:53:46'),
('70528732-a24b-4ec7-88b4-d94267be3f07', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0afed44d-f1b4-4bfd-97a0-f05e9f6593b6', '2026-08-21 06:53:46'),
('71b0234f-6451-470e-b0c8-6c32beb9feb7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5046e477-7274-4af2-8334-d0ef0fd33dbf', '2026-08-21 06:53:46'),
('73da7414-c394-4d42-816a-97f1e49aba99', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '35b1e503-0947-4f66-bf1f-0dc45576dd98', '2026-08-21 06:53:46'),
('74b2ebac-7073-411f-a7f7-6efd37118bb8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5459082f-153e-4069-af15-b7648f490606', '2026-08-21 06:53:46'),
('759d1f76-9764-491f-875a-a52163fdb991', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'db97ff5b-5788-4287-bc48-c6adbd0e6505', '2026-08-21 06:53:46'),
('77cf8750-ccf9-4f36-a44d-eced3470f965', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ab510438-cdad-4f93-b9bd-407174bd8983', '2026-08-21 06:53:46'),
('78024b37-84a0-4434-91b2-06faf2aeac3a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4144dff5-946b-4a3d-8d91-598157b072ad', '2026-08-21 06:53:46'),
('7890bfe3-6bf0-4903-9f0e-b5f2a7b23eca', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd0188a5d-78e6-46fd-a803-ffcc83fcf319', '2026-08-21 06:53:46'),
('78d23261-97f4-40d0-b26c-1f444bf88e56', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'af9db6f8-04a1-48d4-8caa-4f3799ebc6a2', '2026-08-21 06:53:46'),
('79386333-e787-4120-b60e-09defe74af06', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e63b79ea-c4fe-48a5-88fc-dba3a76bce51', '2026-08-21 06:53:46'),
('7ac17f8f-18d0-44b7-8adb-9f0e6ea0d216', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '98dc541a-172f-4f91-8ab7-cd2869cc13db', '2026-08-21 06:53:46'),
('7c633263-3628-4b0b-a9fd-b076aaff97c7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6105a0fb-f468-4bfb-9fc3-307f110f48f0', '2026-08-21 06:53:46'),
('7c8e7922-995d-46af-a1cf-74282d9e867a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2075a865-a223-442b-8d86-ca391f318c05', '2026-08-21 06:53:46'),
('7d3c04e6-ad44-46e0-9278-d90f1bf674c8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '224b5da4-9c04-4d34-9253-ae9fa91f070b', '2026-08-21 06:53:46'),
('7e45fa24-2bf4-4468-8cf1-9d90a9168b5f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '573a594a-4faf-46a2-aa8e-385c97e82111', '2026-08-21 06:53:46'),
('7eb8e23c-4490-401b-9713-c51596ce93b0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a9def816-f4e5-45c0-b120-4da7f065b361', '2026-08-21 06:53:46'),
('7f379987-e302-4169-a6ec-fa33851fd1ca', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2c342d11-18c4-4697-bec4-152f2d67062d', '2026-08-21 06:53:46'),
('7f98f8ea-1b4f-4ba6-b003-5447f5f99f54', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '94c040ff-25c9-4d88-a5d2-24db8143e4ca', '2026-08-21 06:53:46'),
('808d7cef-ee1a-40cb-b688-bb5e2eb4445c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '878d097d-9574-415e-85b1-5641c3e212b4', '2026-08-21 06:53:46'),
('813281c4-cfaa-49fa-9165-0fc9a96228da', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e53195cc-19b3-463d-afe8-0f6852c64821', '2026-08-21 06:53:46'),
('81bfcafd-1170-4c6b-ba9e-57c0a4fc26f0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0db07fef-bad1-4f68-ab2a-70261ac6c7ed', '2026-08-21 06:53:46'),
('81cf9391-8b59-4294-8bfd-5f420ac4cbc4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '81de98cd-b04f-40ce-94c8-e7a7d56d9f05', '2026-08-21 06:53:46'),
('82d0e350-8004-432d-adea-7adf1e255ec1', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0a26ba7e-fd46-460d-82bb-e01dd23c37ff', '2026-08-21 06:53:46'),
('83358a17-db28-4f68-b947-9b7215648c6f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c86c981a-fcd7-4085-92d8-dee7439d86d8', '2026-08-21 06:53:46'),
('833dfcaa-0f67-4d86-b5a9-f5854ad6d920', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ae633e62-8170-43df-9587-5e03fcd3d0a0', '2026-08-21 06:53:46'),
('83fbd14f-28b1-4439-b488-35866acfb51c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '62865581-a269-4338-a62a-63ac5958f665', '2026-08-21 06:53:46'),
('854ab4bc-ea57-4a98-bf0e-8dd77b23fc4f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0d1aed2c-72db-4456-b2af-b0454a5c73c9', '2026-08-21 06:53:46'),
('8594b83d-6a4f-4a2f-8f9b-679bd2eeca86', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5a5631c9-abaa-4c02-b7c2-d7b9e87060d9', '2026-08-21 06:53:46'),
('85d92c74-d7a8-43d1-b1e6-f3825fb70ade', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e7eb1560-1d21-4fa2-b8cc-5d77944c6f35', '2026-08-21 06:53:46'),
('85ed7915-3a17-4136-b83c-5ea3864978b2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '12168a8e-be07-48d9-b7ee-126be39a3669', '2026-08-21 06:53:46'),
('8674e608-cbe4-4e63-a3df-0c531c2e1d7b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a41f9a15-38ff-4333-9555-1e04ded3148a', '2026-08-21 06:53:46'),
('88b2442f-9015-4fa7-a548-4561b9aa1d6a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8767a628-aeb9-4870-b8f1-fd4206b214c1', '2026-08-21 06:53:46'),
('8ae0f0c1-0429-433c-9cdb-ef0604a99062', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9561ac3e-90ae-4f99-9928-9ed02770c82f', '2026-08-21 06:53:46'),
('8b318749-1ff0-48f3-af1f-60c081ed969c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8812de35-5a49-481c-a859-28a6422479be', '2026-08-21 06:53:46'),
('8bdb05b8-0502-4e9f-b2f2-eb7c712aa2e1', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '410d39f0-4d29-4d63-9707-fe313bb8f6fc', '2026-08-21 06:53:46'),
('8bf396ec-f5ae-487d-ae8d-774f10f41c58', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '105afbf0-0769-4bd9-bab3-88562fca4cf6', '2026-08-21 06:53:46'),
('8da7c71a-6dea-4687-81d0-65ee8c08d361', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e54b3393-126f-490d-9553-82209d2d107b', '2026-08-21 06:53:46'),
('8e3f5810-fccb-4ecf-984b-6f6b161b0bfe', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'af4393bd-7dad-4b1b-b311-b065ce1db315', '2026-08-21 06:53:46'),
('8e62de12-560b-4da7-b09f-54ff2dd10f03', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a63ab29b-6823-4fa3-b516-ed6195da9ab2', '2026-08-21 06:53:46'),
('8e73dfaf-8a8b-43cc-9b2c-03d7b7c12d49', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'dc81f7c6-6b17-4761-8285-b9756f71ee24', '2026-08-21 06:53:46'),
('8ec69724-ee9d-405e-9105-155694fabd8e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3b8aaf13-51b9-4dca-be02-69bb992e62bb', '2026-08-21 06:53:46'),
('8f087366-cc4e-4a25-8437-f348f2b2dc01', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '57ca9c01-0d43-4361-a5a9-bd34c733b929', '2026-08-21 06:53:46'),
('8f2f1e62-7767-4436-b731-9fd6d14f3b06', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '869d1162-1364-4fba-a402-93f135294baa', '2026-08-21 06:53:46'),
('8f4b6c78-7068-4e25-84eb-c64fb3c5c7fb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0b126dcf-48c3-45ec-b012-68cea3073772', '2026-08-21 06:53:46'),
('9057c2b5-6e7b-49e7-a3ef-79a67f847ab6', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '83ab3aca-62a1-4168-9e30-839a9deb1bdb', '2026-08-21 06:53:46'),
('90e94ec2-eecb-4ce9-8a82-5d4b6e1de7bd', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9aca190b-deaf-4780-84a4-14eeb7d37e31', '2026-08-21 06:53:46'),
('91c88501-65ff-49e2-bd51-224027211cfb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8fa47852-26ff-4acb-82e5-534a378fbccc', '2026-08-21 06:53:46'),
('93042fa5-36f8-4f13-b263-aa34dce52899', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '23be7b45-6a5e-4451-9a16-d125986a9c2b', '2026-08-21 06:53:46'),
('936c6877-4091-4c5e-b86d-03fa91722a7b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '94a1de54-74c4-41a4-9f7f-5e7d84949602', '2026-08-21 06:53:46'),
('93c8d399-fbb4-4583-b0ab-edf81711f3bd', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7911fe4d-2469-45b8-ba5d-116f86dd94e1', '2026-08-21 06:53:46'),
('94a4a139-d993-412f-abfe-08c5ef293813', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1d53bacb-1244-4023-9eaa-5f770020e1dd', '2026-08-21 06:53:46'),
('95bb2396-c64b-4e1b-996a-68307ccf4614', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '40a24208-5a30-4754-9659-1eca439b85e8', '2026-08-21 06:53:46'),
('96a4c675-8a17-47f8-808a-41b6fca2f378', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'eb97d225-4127-4420-88c4-5f4a4f8ac125', '2026-08-21 06:53:46'),
('96a7be6c-1fbd-45d3-9fab-6fd5ce79946a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3e8ecd17-906c-47bd-b2ce-f4b9dfc1bf69', '2026-08-21 06:53:46'),
('97180b47-352c-4d97-9ec3-377b2166966f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a1ddf548-91c7-43eb-9db0-6f461c884f5e', '2026-08-21 06:53:46'),
('972d27ec-e80d-462e-af1f-501fec0ae95e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e496a7aa-ee31-4e4c-b0e1-c3a0d35884f4', '2026-08-21 06:53:46'),
('97868a9a-b1b5-47f5-99a1-6f3ac0516851', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'abbdbc0f-2f7f-4987-9783-68bc51f7bc44', '2026-08-21 06:53:46'),
('9877291e-68b1-46aa-9c28-f4caffdf9b72', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'b209348b-1349-4ce5-8d32-1d38aee48d66', '2026-08-21 06:53:47'),
('98807f2a-3c24-4ed8-94ce-6b48fd494b36', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8918d238-5444-451d-8328-a8b58c284651', '2026-08-21 06:53:46'),
('99995f35-fa9a-4d6a-8484-fd8cb69bf514', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5769c961-b25e-4344-bc6a-c802d30faabe', '2026-08-21 06:53:46'),
('9a7f1153-fc3a-442e-b066-c42018858c48', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '818c7179-baaf-4121-8010-db85ed5abae5', '2026-08-21 06:53:46'),
('9bb3417e-b599-4470-b2ba-4c814df3f43a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '586d78c8-aee8-480a-be94-2f6acb087f7d', '2026-08-21 06:53:46'),
('9be8f433-2089-445e-820d-21a4059a38a2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bc4bfffd-5102-40c2-a647-0335f0fee869', '2026-08-21 06:53:46'),
('9d04c03a-0104-40b7-a5e4-91c0a0005a63', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'de4dca4b-5c30-4d2b-81ca-bcc55f2c57e3', '2026-08-21 06:53:46'),
('9d52e7a8-e771-4abd-a1e9-a667bd3e9a11', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '90ddeae9-2062-4b37-bbca-903f64fa382b', '2026-08-21 06:53:46'),
('9e3b09ea-fd53-44fc-9e51-19d4205920b2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7ba6e693-7f25-4745-8b1e-1dae81158fd9', '2026-08-21 06:53:46'),
('9e794759-8638-4def-9a3a-a451c056906a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3c66489b-9227-4b5a-97d5-4f1f7eb4f474', '2026-08-21 06:53:46'),
('9f770285-ec26-411e-a8f0-8216158535c3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '290d49ad-f87a-462f-982f-b399c539cc14', '2026-08-21 06:53:46'),
('a002ad14-b3fa-48ea-bdc9-1d08c3a6c062', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'e2e3f9bc-ce19-4e92-85ee-bdae36f2b658', '2026-08-21 06:53:47'),
('a0639f0b-48e5-4beb-bcbd-ef46de790888', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6596e6c9-5b17-43b7-9590-91c6daf13a15', '2026-08-21 06:53:46'),
('a15a9513-af64-4cc5-aaaf-423797d14b39', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '569d92f8-a32c-4d50-bdcb-5d6d214a3b84', '2026-08-21 06:53:46'),
('a3a1330a-6cba-4250-8f58-21c5a55cc9ce', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'a7f2c7e6-a823-4d4e-b106-f2edb9357752', '2026-08-21 06:53:47'),
('a3df1b3d-8004-430b-82cf-32dbcc3a2649', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b5ade342-e540-484b-ab92-c725bcf7b7ac', '2026-08-21 06:53:46'),
('a4b432fd-555d-4521-90aa-574c73e669cb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5e1ef951-9f89-4cc1-b433-b177a4c7a5ee', '2026-08-21 06:53:46'),
('a4cf91de-e0a1-4946-9e8f-120c6489b9ad', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '33ddfb52-fae9-4d4a-8a45-9544e4b5129a', '2026-08-21 06:53:47'),
('a503350a-9c8a-4a28-8488-300530d9ec44', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a2a6f4e3-60db-4861-b36d-ac75cdf0dadc', '2026-08-21 06:53:46'),
('a5885443-473b-426f-9e06-cb448879aa2a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1352caad-89fc-4bf1-8d9a-dc6538e51eb2', '2026-08-21 06:53:46'),
('a6dc47d9-e901-4e6d-bfb7-b6d8ac986887', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2de5797a-66e0-47ab-a123-1f39d34dccfe', '2026-08-21 06:53:46'),
('aa8c1594-0e2b-409f-a3b8-1f0ccacb8d81', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '45f69355-4ab8-4d83-bb55-31e2eef099ea', '2026-08-21 06:53:46'),
('acd96193-904b-4b6b-bcaf-26011899e2e0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '95d95148-6b2f-493f-9d3f-26673d28b43f', '2026-08-21 06:53:46'),
('ad8a90af-5db0-430d-b35b-4032b4338128', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '452fc3a7-b3ba-4e05-a3b5-e3a2765c4a5e', '2026-08-21 06:53:46'),
('adad0d7e-5ccd-4f4b-90d7-d069326c9a43', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b9031706-6fc2-41a9-8410-5136b01c7099', '2026-08-21 06:53:46'),
('aedc0f98-cc49-4748-9e1b-61c27b4e67fb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '720fe2f9-3ade-42e3-821d-d0ddf37d7753', '2026-08-21 06:53:46'),
('afb17142-7a9c-4419-a69f-eced11eb0748', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '39d4518f-852a-430c-b0db-3e2729af93f9', '2026-08-21 06:53:46'),
('b0ce86b4-ac72-4c65-bed7-ccf9c0fa7d1c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a88964f7-d2c7-47e6-8e40-140aa7d01dc5', '2026-08-21 06:53:46'),
('b1522074-4958-48fa-9610-c08d1fedaa0d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3c0c2bcf-c33c-4f70-8a58-609943f21c4a', '2026-08-21 06:53:46'),
('b1af0299-5cc1-4740-9a48-48e4d7a733fb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'afb650a7-f5f4-4db2-9c8c-c2704d2acaef', '2026-08-21 06:53:46'),
('b4707bea-394a-45ac-a355-9992ac3d2146', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ffc8367f-19e9-4a0a-96f0-95549d5767e3', '2026-08-21 06:53:46'),
('b4a273bf-bac0-4e2b-b010-360d039ac00f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '83bce96a-fdc9-4f24-b315-b8ecc00207a5', '2026-08-21 06:53:46'),
('b5043f63-ace2-4ed9-9a04-265954dcc14e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f4ba338a-d86d-4d29-b0c1-e86578270b24', '2026-08-21 06:53:46'),
('b576ddf2-ed8f-444d-8ec3-39d4949746bc', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '90ddeae9-2062-4b37-bbca-903f64fa382b', '2026-08-21 06:53:47'),
('b75a2457-9f44-4ea3-bcff-adb230b62857', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1f027a2c-752e-48e5-88b0-00bf045baef5', '2026-08-21 06:53:46'),
('b80bd78a-9642-43aa-8500-7d99e54b470d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '34d70bb3-7571-4dc2-b04b-a0da09373eab', '2026-08-21 06:53:46'),
('b853831b-8fcf-4b2a-859c-66593ba03008', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '2b5a917f-ed9a-4d50-8def-270526518353', '2026-08-21 06:53:46'),
('b8eba99a-7ae4-4ca6-abd5-209fea10c44f', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '29befea9-d7e5-48e0-8af8-95863048525d', '2026-08-21 06:53:47'),
('b9671d8a-c2ee-46f1-90cf-2af71d2bf7df', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5f09c30a-a7df-4e92-8d0c-9c09e282baf9', '2026-08-21 06:53:46'),
('b9ade866-e405-44f5-96ca-69b182aa49c0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8f14aa52-6256-43c6-a2ac-3a4073537a30', '2026-08-21 06:53:46'),
('b9ba9803-1fa9-4d0e-8ff8-4f66b0fa8e24', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0f5ce52e-375f-4aeb-8271-1797325c74e9', '2026-08-21 06:53:46'),
('bbd9740d-0495-4fc3-86ba-a3ff9516e54d', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '7a3da6fe-ab4d-421a-a2c7-e4e4fbc01a12', '2026-08-21 06:53:47'),
('bd789753-8454-4a0e-ae5c-f1da363e7fe0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '308e2792-c6e3-4fac-bce9-4cc3a3bcf33f', '2026-08-21 06:53:46'),
('bd8ef89b-d4e2-4a6e-a2e9-c1189c357aa4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1f010364-f05e-49ea-afbc-76e493cab807', '2026-08-21 06:53:46'),
('bdcb00a7-db04-4ca6-af7a-72cd62030e4d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'de8fbadb-a992-436c-a4be-731375924430', '2026-08-21 06:53:46'),
('beedef67-cf32-4c64-9c51-dca1968b0b00', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'dae12302-16b2-4a07-80d0-609eb8a068dc', '2026-08-21 06:53:46'),
('c000499a-e9db-4918-a500-e4ebfc442e22', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0d0c1958-8e45-40f6-9633-589b315bd941', '2026-08-21 06:53:46'),
('c0adc121-76ab-44e7-b9cf-e25e73168428', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a138ada3-0b4f-4e96-8770-8f47c373b922', '2026-08-21 06:53:46'),
('c0bd429a-f081-41e0-b732-723b69cde687', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f605e6a2-ac16-4198-8b87-7644da761fce', '2026-08-21 06:53:46'),
('c1899935-1fc6-4228-8ac3-6ea9cc832379', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4c1ed60f-15bd-4e45-80ac-7d8f1a2bd2aa', '2026-08-21 06:53:46'),
('c24a2974-12a1-45a3-8606-7941b7723157', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '803c50ec-8ac3-44b0-a1fc-efbef148bb57', '2026-08-21 06:53:46'),
('c2b3eda1-2f36-4f4c-bd6d-7bbcb7b5fb80', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '818c7179-baaf-4121-8010-db85ed5abae5', '2026-08-21 06:53:47'),
('c2cf8647-d01f-4c89-8b43-a54b10bd0281', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0fdd129f-2574-4a8f-84ba-922ded8448db', '2026-08-21 06:53:46'),
('c4364051-ea06-4d9d-8625-41565c318e85', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f078df46-2ff0-4725-a1e4-58642788b59a', '2026-08-21 06:53:46'),
('c443531c-ea46-411c-8da7-dded4eb534a7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '3c6f6fd9-6e7e-4be8-bea3-0ef37c433f29', '2026-08-21 06:53:46'),
('c6acf965-e83b-4ea1-b5d8-115b6ddaa2d8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b78d760c-830e-4be9-afbf-9dbe7f08da9f', '2026-08-21 06:53:46'),
('c7171688-732a-4541-8149-f39421784bb4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'dea098c6-2cb9-43e8-8f7a-0914ffba3b57', '2026-08-21 06:53:46'),
('c7a220c5-0c16-46ec-ad7f-126cd73fae3c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b264529b-9879-4314-a540-52ba356b1539', '2026-08-21 06:53:46'),
('c9b196ba-9e9c-4091-bac9-a0bae91dff85', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4678f593-39a7-4b4f-b75e-88dd5c548818', '2026-08-21 06:53:46'),
('c9f3d0f6-2aed-4577-a286-32339007e9ca', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8c1edbf9-bb2a-4bba-8272-7ca88a19c601', '2026-08-21 06:53:46'),
('cafeb75c-b035-41b6-8000-7f51a751b933', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '30651ef0-7eeb-42f2-a1b1-28732c4cef3b', '2026-08-21 06:53:46'),
('cbfdb910-5a4c-4217-862f-cd2281af6436', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '52820974-0d73-48b6-95ff-10e8d305c14c', '2026-08-21 06:53:46'),
('cc05542a-addc-4a38-8f8f-bb219ef85a92', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1f8a00b4-980b-45c1-8484-088000eb321d', '2026-08-21 06:53:46'),
('cc5dbfa7-52cf-4817-827a-4ef7565ce61f', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd0b2ff71-52c5-4c64-8c40-a744d058ec6a', '2026-08-21 06:53:46'),
('cd5fb04f-a705-461c-8030-adc39c8234eb', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '44bfa82b-c0c9-43df-93e7-9850cc9b7f1e', '2026-08-21 06:53:46'),
('cdfee699-9e02-4ea6-bf0b-8688b0e119ef', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5e4eb3fc-b8c4-4e0c-8628-4625fed1104d', '2026-08-21 06:53:46'),
('ce0154ca-c1f7-4ba4-aad0-d7c6e8ce155c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '13fa71ed-332f-4e22-883d-518a9e211c30', '2026-08-21 06:53:46'),
('d07d818e-9a42-4539-a42c-bed9d4474d2b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f8d86787-a536-42f9-85c3-8f72b1e1caf9', '2026-08-21 06:53:46'),
('d07e7222-74a3-4789-b8e0-0491a6654ff3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f77257a2-91f1-4efc-95ac-dd6df7f8c64a', '2026-08-21 06:53:46'),
('d120af05-f095-4634-8f04-cbc5ae45c236', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b29948c6-2f66-4999-a19f-08798ac58565', '2026-08-21 06:53:46'),
('d14f8c48-480e-4d46-9a25-72c996871eb8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '815a0083-e027-4b2c-b62a-64535154863e', '2026-08-21 06:53:46'),
('d24b08c9-4683-4c58-8fc7-9e0695b016c7', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'dc81f7c6-6b17-4761-8285-b9756f71ee24', '2026-08-21 06:53:47'),
('d27f11eb-2265-4df6-9beb-5750ea3880dd', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b9da96e6-4b10-43a9-90df-443701c1f821', '2026-08-21 06:53:46'),
('d390efa7-7beb-4426-b7c8-3b86716ccdf8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b82e9c6f-d073-4cde-bde3-1b918302d247', '2026-08-21 06:53:46'),
('d42608fa-6d7d-497e-bcd6-5574e28e3da5', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'f5b6284d-2603-4e5c-b0a7-80f61db93d74', '2026-08-21 06:53:46'),
('d7b0f9e6-6e73-4a06-8eef-132b53bfa452', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8e5eb848-9b11-4578-81f4-79e13c07d02b', '2026-08-21 06:53:46'),
('d7e95f72-82bb-4598-a903-7df17f15eb6b', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'dda66109-6528-4d6d-9ce9-0241f898c820', '2026-08-21 06:53:46'),
('d8d06d23-3a0f-487e-bee0-f8be53831ce2', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '1d53bacb-1244-4023-9eaa-5f770020e1dd', '2026-08-21 06:53:47'),
('d90a9376-c11e-4c31-bc24-513bd28c94b8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9f47edfd-5d1b-421a-a485-fe6a8c99b759', '2026-08-21 06:53:46'),
('db67b09e-760e-4ec5-a227-a9742a164eb3', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '452fc3a7-b3ba-4e05-a3b5-e3a2765c4a5e', '2026-08-21 06:53:47'),
('db71562c-690f-4973-bc66-909d573e3566', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bc16c159-d24d-4102-91e3-0bb325d2326f', '2026-08-21 06:53:46'),
('dc59ce6a-9484-49ab-9962-822349b61ab3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'bb741b8b-3a8b-4828-ac3a-e64c710fb2ba', '2026-08-21 06:53:46'),
('dc5b069e-d334-4240-b6f6-80f1c3a955b7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '840dd320-6982-4193-a927-198e75da9d66', '2026-08-21 06:53:46'),
('dc9773c6-1afc-4014-8049-26d857bdd7a5', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6c9cd548-9276-44fe-8f88-8bc8de282bfc', '2026-08-21 06:53:46'),
('dd017fb9-352d-4220-8d59-95671356c7da', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '4bb4ed94-6fa8-42f0-b3e7-55417344048c', '2026-08-21 06:53:46'),
('dd063620-4696-4596-80e8-92bd947b9ab3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '36f132b9-a8f8-425d-bca0-09213b85b436', '2026-08-21 06:53:46'),
('ddda8222-8af3-47b5-b063-46102a5f9103', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1021ecaf-c74a-4383-9580-d48cf8715912', '2026-08-21 06:53:46'),
('debc8d18-495e-4bf1-be88-6f9ad248bee3', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'fd3584fd-550c-482f-9b16-5139a4234527', '2026-08-21 06:53:46'),
('df027428-8eb6-48b6-abc6-df6c3a2f5fa0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '90e4884e-48e5-4435-bdc7-475ffdf1f2a4', '2026-08-21 06:53:46'),
('e3b9d2e4-b419-43c1-91ce-4fae81501c9d', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '574855e7-441e-465e-aade-d5664d85fc01', '2026-08-21 06:53:46'),
('e3df1ef6-54d0-4346-8a72-e03c6f9fa1b9', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '70f6c7b3-b637-4ea5-ad23-bdf3d6340563', '2026-08-21 06:53:46'),
('e3fb6b62-d92a-4714-a9e7-ded99dfb5e22', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '30af8b43-66c0-4cfd-95d0-bc0a47818938', '2026-08-21 06:53:46'),
('e6e434c7-1566-4e3e-93c7-62934afe8022', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '53743a66-4c7f-408b-b936-c25b1c5d78a4', '2026-08-21 06:53:46'),
('e70bbf0d-233b-486a-8953-a2a1cd15ac0e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'fe721392-7da9-4e1a-a47f-10a2bb2e12d2', '2026-08-21 06:53:46'),
('e73ad771-ab3a-40a5-9bf4-785157282d87', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b6cd8bce-6139-49b2-876f-698fb1b5db27', '2026-08-21 06:53:46'),
('e7494c7f-af2f-41b9-8f6b-493d56e106c4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e2e3f9bc-ce19-4e92-85ee-bdae36f2b658', '2026-08-21 06:53:46'),
('eb5075e4-5f96-4c5f-a044-4f072cedd973', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '8d5ad96f-f451-4b8e-9e8d-fd5408502b12', '2026-08-21 06:53:46'),
('eb75cbdc-6139-44f8-b941-4b348dade3a8', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1c6db917-a09b-4fff-aca0-763ce3c796b1', '2026-08-21 06:53:46'),
('ec06a753-c992-4943-a405-676d6ff638cf', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'aea1dc1c-f2d5-48a2-bda8-0b19ed7af5fd', '2026-08-21 06:53:46'),
('ec20f6a6-6d13-4275-83e1-7ca15ac80941', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '60c9e024-2fe2-4281-b40f-c27d914035a8', '2026-08-21 06:53:46'),
('ec96a092-5c8a-432c-95eb-91a96ab1c809', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'e6aa73ee-afd4-44c7-8090-79c37182b9f2', '2026-08-21 06:53:46'),
('ecbaa90a-e7f6-4983-9c6e-df1c8788bb4a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '804e56aa-5975-403e-9a0f-52739a0a5003', '2026-08-21 06:53:46'),
('ed7cfc99-b30a-4ee5-a17f-4bc6d5b982f2', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7793348e-61f2-4b49-b262-434d13c2fd65', '2026-08-21 06:53:46'),
('eddf13d4-215d-43b4-818e-97d896bf6753', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'ebc77f50-6ba9-4d43-8972-99b66c7a57d9', '2026-08-21 06:53:46'),
('ef1d3410-920c-4aeb-864b-aca609261267', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '1d7923e1-5f6a-4c05-bccd-89c8ef25d18c', '2026-08-21 06:53:46'),
('eff67fa5-11da-4ce9-bbee-cdfaba396286', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '99d21172-5e16-4e13-8edc-214b958e69aa', '2026-08-21 06:53:46'),
('f0c846d8-5f79-4022-85bc-ff4ede0bad28', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '371c8933-8695-4446-8048-b40b42cbee2a', '2026-08-21 06:53:46'),
('f1983b42-66aa-4010-9518-e30fea5e7755', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c82cc2f6-4b2a-4ee2-9824-537ac50d45f1', '2026-08-21 06:53:46'),
('f1e65c44-08b8-4f4d-8594-be22f889006e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '03bf664f-85aa-4dbe-9371-f85ab6704cb5', '2026-08-21 06:53:46'),
('f2a61c02-3c01-4d39-a2ec-6e5a38ed151d', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '8e5eb848-9b11-4578-81f4-79e13c07d02b', '2026-08-21 06:53:47'),
('f50705ab-80bf-4f58-a838-9c60ac4dc858', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '725306bd-b774-4bb1-a868-8f35410a6d4c', '2026-08-21 06:53:46'),
('f5170fc0-ecdc-46ef-82de-b19be59626d7', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7a2ee08b-65b1-40c7-9798-18a453ed869c', '2026-08-21 06:53:46'),
('f51c6dc2-ae3f-452c-a63a-58a0ae6c11f8', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', 'f605e6a2-ac16-4198-8b87-7644da761fce', '2026-08-21 06:53:47'),
('f52d49dd-29ff-4aaa-95d1-eb10b6c9aa47', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '0efc95de-5491-4efb-a6f4-5aa3bf6c9dac', '2026-08-21 06:53:46'),
('f74f4f9e-53a0-45f2-870a-2eb295030699', '0b9a5262-3a7d-471b-9b53-7f63afce8b78', '396f1a98-e470-4a53-892d-8c2de5baa959', '2026-08-21 06:53:47'),
('f7717da0-6f15-480e-a268-0910738dd87e', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'b49f809e-db14-4fd0-89fa-ab4a2e254c05', '2026-08-21 06:53:46'),
('f7be8969-96cb-41b9-9a56-06494d6c2246', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'c7c1a111-b9d1-4f1f-a23c-4d81b541a070', '2026-08-21 06:53:46'),
('f7d34105-07ab-4bd3-a31b-5451e978f8b0', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '6bc3d79e-290c-46bf-85bf-21befcc5362e', '2026-08-21 06:53:46'),
('fa41562c-ce7c-40f9-aea6-e1ee0d254539', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'd8680057-1fb4-4e93-b73b-2959ac886049', '2026-08-21 06:53:46'),
('fb0c61f5-a6ce-4ddb-b160-53f3bda99ee5', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '7283d62c-db03-43b5-b220-2d65691afd1c', '2026-08-21 06:53:46'),
('fc821a0f-8605-4301-973a-4d299875267a', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '5d021491-1967-49f2-af47-8774c5521dc4', '2026-08-21 06:53:46'),
('fca22576-8695-4a70-a554-0eeb2f3f7f98', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '96f2eed5-c429-44cb-9580-e8957f09aac1', '2026-08-21 06:53:46'),
('fe0f57bc-79da-4bad-8ae8-03956d2f629c', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'afb4b719-9541-45d3-a422-433f4fa43174', '2026-08-21 06:53:46'),
('ff1c9b42-ab35-444e-becb-62bfa21f38e4', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', 'a7f2c7e6-a823-4d4e-b106-f2edb9357752', '2026-08-21 06:53:46'),
('ff5931b3-2a8e-4e97-b89f-00a797095bbf', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', '9f4eeff5-88c2-11f1-accc-00ff5530513d', '2026-08-21 06:53:46');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `group` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `type`, `group`, `description`, `updated_by`, `created_at`, `updated_at`) VALUES
('ad41141f-cf07-4f46-85d3-c9b1c7dbf561', 'company_phone', '+917373418181', 'string', 'general', NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:14:35', '2026-08-28 17:14:35');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'hotel, vehicle, flight, general',
  `contact_person` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `payment_terms` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `code`, `type`, `contact_person`, `phone`, `email`, `address`, `payment_terms`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('4685ab95-2955-4d74-b259-a19e7ea2a73e', 'KS TRAVELS', 'SUP-81E974B0', NULL, NULL, NULL, NULL, 'COIMBATORE', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:21:32', '2026-08-28 16:21:32', NULL),
('bdda9e6b-1504-4de8-8b51-b4097a45d7d2', 'VARAHI TRAVELS', 'SUP-8C3CF790', NULL, NULL, NULL, NULL, 'COIMBATORE', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:21:46', '2026-08-28 16:21:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supplier_payments`
--

CREATE TABLE `supplier_payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `token_blacklist`
--

CREATE TABLE `token_blacklist` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `token_blacklist`
--

INSERT INTO `token_blacklist` (`id`, `token`, `user_id`, `expires_at`, `reason`, `created_at`) VALUES
('22fc5b50-3221-4407-95f2-6b8d4746d7af', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJlbWFpbCI6ImFkbWluQHRvdXJzLmNvbSIsInJvbGVfaWQiOiIxZmM3MTk1OC0yZjlkLTQzZGQtOGRmYS1lODM3MDVhMjcwYzciLCJpYXQiOjE3ODc5MTg3OTYsImV4cCI6MTc4NzkxOTY5Nn0.IP7Nac_bFweiRSttRrKkTKg6UXeK1kTxolbOdFc99PA', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-29 12:07:18', 'logout', '2026-08-28 12:07:18'),
('2ed2ec58-c53c-44b3-ba17-7e4be8c02f02', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmODZhNjIxYS03MTk3LTQxZDItOTM5NS1iNTNkNDIwNWYwMGMiLCJlbWFpbCI6ImFkbWluQHRvdXJzLmNvbSIsInJvbGVfaWQiOiIxZmM3MTk1OC0yZjlkLTQzZGQtOGRmYS1lODM3MDVhMjcwYzciLCJpYXQiOjE3ODc5MDQ1MzksImV4cCI6MTc4NzkwNTQzOX0.iPWfxBdvtn3GVBcnEcbwqgXqxPN_ugZU_70LtWknsEk', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-29 08:16:56', 'logout', '2026-08-28 08:16:56');

-- --------------------------------------------------------

--
-- Table structure for table `tt_city`
--

CREATE TABLE `tt_city` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `country_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `state_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `airport_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_city`
--

INSERT INTO `tt_city` (`id`, `country_id`, `state_id`, `name`, `code`, `airport_code`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('1048a498-1939-4747-ad3a-40f22986eade', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'd6bc577a-45c2-42d4-9a29-58525bc9d54e', 'Pollachi', 'CIT-F9669236', NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 07:14:18', '2026-08-28 16:27:26', NULL),
('1c67d670-2b84-43ea-8abf-fedb91f75058', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'd6bc577a-45c2-42d4-9a29-58525bc9d54e', 'Coimbatore', 'CIT-A6464A45', NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:27:16', '2026-08-28 16:27:16', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_country`
--

CREATE TABLE `tt_country` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iso_numeric_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency_per_rupees` decimal(18,4) NOT NULL DEFAULT '1.0000',
  `nationality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_country`
--

INSERT INTO `tt_country` (`id`, `name`, `code`, `iso_numeric_code`, `currency_id`, `currency_per_rupees`, `nationality`, `phone_code`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'India', '+91', NULL, 'df9c3373-a2af-11f1-8937-52e8d4c28cde', 1.0000, NULL, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 07:13:44', '2026-08-28 07:13:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_currency`
--

CREATE TABLE `tt_currency` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `decimal_places` int NOT NULL DEFAULT '2',
  `exchange_rate` decimal(18,6) DEFAULT '1.000000',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_currency`
--

INSERT INTO `tt_currency` (`id`, `name`, `code`, `symbol`, `decimal_places`, `exchange_rate`, `is_default`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('df9c3373-a2af-11f1-8937-52e8d4c28cde', 'INR', 'inr', 'rps', 2, 1.000000, 0, NULL, 1, NULL, NULL, '2026-08-28 09:12:35', '2026-08-28 09:12:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_departments`
--

CREATE TABLE `tt_departments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `department_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_head` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Future FK to Employee Master',
  `display_order` int DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_designations`
--

CREATE TABLE `tt_designations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `designation_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `hierarchy_level` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_drivers`
--

CREATE TABLE `tt_drivers` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Driver photo URL',
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LMV, HMV, etc.',
  `license_expiry` date DEFAULT NULL,
  `id_proof_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Aadhaar, PAN, Passport, etc.',
  `id_proof_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proof_document` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Scanned license / ID proof URL',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternate_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'permanent, contract, freelance',
  `experience_years` int DEFAULT '0',
  `joining_date` date DEFAULT NULL,
  `blood_group` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Preferred / assigned vehicle',
  `availability_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'available' COMMENT 'available, on_trip, leave, inactive',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `driver_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'own',
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_drivers`
--

INSERT INTO `tt_drivers` (`id`, `code`, `full_name`, `photo`, `license_number`, `license_type`, `license_expiry`, `id_proof_type`, `id_proof_number`, `proof_document`, `phone`, `alternate_phone`, `email`, `address`, `city`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `employment_type`, `experience_years`, `joining_date`, `blood_group`, `vehicle_id`, `availability_status`, `notes`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `driver_type`, `supplier_id`) VALUES
('a55d6f5d-8394-45b7-891a-3e0fdf576f75', 'DRV-6F37D7D0', 'YOGESH', NULL, 'TN6520200002238', 'HMV', '2031-08-08', NULL, NULL, NULL, '9597297487', NULL, NULL, NULL, 'Ramanathapuram', NULL, NULL, NULL, 'permanent', 0, NULL, 'O-', '50d9924d-60d5-4c65-b601-70eb129e6c60', 'on_trip', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:37:34', '2026-08-28 11:49:56', NULL, 'own', NULL),
('b849c5af-9fc2-466e-83d3-27462ddd5a28', 'DRV-4B709AAE', 'Prabakaran', NULL, 'TN22', NULL, NULL, NULL, NULL, NULL, '7373517171', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'available', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 11:47:56', '2026-08-28 11:51:40', NULL, 'own', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_driver_proofs`
--

CREATE TABLE `tt_driver_proofs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `driver_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `proof_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Driving License, Aadhaar, PAN, etc.',
  `proof_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LMV/HMV when proof is Driving License',
  `expiry_date` date DEFAULT NULL,
  `images` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of image/document URLs',
  `display_order` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_driver_proofs`
--

INSERT INTO `tt_driver_proofs` (`id`, `driver_id`, `proof_type`, `proof_number`, `license_type`, `expiry_date`, `images`, `display_order`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('52fbf91d-3ca7-4787-9de7-ea70c8e60456', 'a55d6f5d-8394-45b7-891a-3e0fdf576f75', 'Driving License', NULL, 'HMV', '2031-08-08', '[\"/uploads/proof_0_images/6907ed4d-63a1-4af7-b1f2-cf3918a813d9.jpg\",\"/uploads/proof_0_images/c2857461-24f9-4cd2-bb62-85011f211e5f.jpg\"]', 0, NULL, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:37:34', '2026-08-28 08:39:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_expenses_type`
--

CREATE TABLE `tt_expenses_type` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_expenses_type`
--

INSERT INTO `tt_expenses_type` (`id`, `name`, `code`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('1ad84dd9-3d3d-4fbd-affe-1a892cfbafe8', 'Employee Expenses', 'EXP-D5C0FB31', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:07:23', '2026-08-28 17:07:23', NULL),
('24407b78-ef44-4618-8b59-660e3cdc1417', 'Office Expenses', 'EXP-8361F471', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:07:06', '2026-08-28 17:07:06', NULL),
('bfba6f7b-5852-491a-ab00-c2f3e39da24f', 'Marketing & Sales', 'EXP-8F80F82E', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:07:32', '2026-08-28 17:07:32', NULL),
('d60bbbcd-0e5b-442f-8d2e-fa43a9fd9486', 'Customer / Tour Expenses', 'EXP-F31C3F2B', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:07:43', '2026-08-28 17:07:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_guides`
--

CREATE TABLE `tt_guides` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternate_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'WhatsApp number for tourist contact during tour',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '24x7 contact shared with tourists',
  `languages` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Comma-separated languages spoken',
  `specialization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Heritage, adventure, wildlife, etc.',
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Guide license / certification number',
  `license_expiry` date DEFAULT NULL,
  `id_proof_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_proof_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proof_document` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `daily_rate` decimal(12,2) DEFAULT '0.00',
  `joining_date` date DEFAULT NULL,
  `destination_ids` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of destination UUIDs the guide covers',
  `coverage_areas` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text areas / regions covered',
  `availability_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'available' COMMENT 'available, on_tour, leave, inactive',
  `bio` text COLLATE utf8mb4_unicode_ci COMMENT 'Short intro shown to tourists',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_payment_mode`
--

CREATE TABLE `tt_payment_mode` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_payment_mode`
--

INSERT INTO `tt_payment_mode` (`id`, `name`, `code`, `display_order`, `icon`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('874c7ca8-805e-4e19-ba63-c601d58b15c1', 'Cash', 'PM-533DF8AA', 0, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:01:47', '2026-08-28 17:01:47', NULL),
('8c78777a-235e-4e67-bb6f-b7688906a51d', 'Card', 'PM-34E53300', 0, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 17:01:58', '2026-08-28 17:01:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_season_pricing`
--

CREATE TABLE `tt_season_pricing` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `price_increase_percent` decimal(8,2) DEFAULT '0.00',
  `price_decrease_percent` decimal(8,2) DEFAULT '0.00',
  `price_per_km` decimal(12,2) NOT NULL DEFAULT '0.00',
  `priority` int DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_state`
--

CREATE TABLE `tt_state` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `country_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tt_state`
--

INSERT INTO `tt_state` (`id`, `country_id`, `name`, `code`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('000a4554-8c6d-46d0-a7b8-24e6d8b5cb64', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Assam', 'ST-714604CF', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:21:10', '2026-08-28 13:21:10', NULL),
('04061ae6-b417-4b30-ab11-8ca89c071dd5', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Maharashtra', 'ST-3EF83791', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:23:18', '2026-08-28 13:23:18', NULL),
('0d17b9f2-9349-41d3-8237-f780a1f1c710', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Punjab', 'ST-500F8EBF', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:02', '2026-08-28 13:25:02', NULL),
('181eb6eb-4e01-4fc9-b5aa-7d3ae9461108', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Himachal Pradesh', 'ST-130415A5', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:22:27', '2026-08-28 13:22:27', NULL),
('1a201678-0367-4c97-9064-0d6124b225a2', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Gujarat', 'ST-51FF1B16', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:22:06', '2026-08-28 13:22:06', NULL),
('1e3fcb63-775a-494b-8aac-d4e8c6e39ec8', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Chhattisgarh', 'ST-DA70EDD7', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:21:39', '2026-08-28 13:21:39', NULL),
('1fa6d7dc-5f6d-48ad-9ced-fc84895233fb', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Tamil Nadu', 'ST-20A6A2F5', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 07:14:04', '2026-08-28 13:52:38', '2026-08-28 13:52:38'),
('2559b239-b3c9-4f4d-9655-41b6bbfc583e', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'West Bengal', 'ST-A7E5BA04', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:26:17', '2026-08-28 13:52:05', '2026-08-28 13:52:05'),
('25e7da67-462b-443f-9872-f6ad3c48b4d8', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Manipur', 'ST-785EA5C3', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:23:28', '2026-08-28 13:23:28', NULL),
('2d711f2d-fc72-4463-9a80-2d39851b3069', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Bihar', 'ST-63AA6C20', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:21:23', '2026-08-28 13:21:23', NULL),
('30a3acf0-8bf4-4dc0-8503-b5c631acc609', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Jharkhand', 'ST-C9770D12', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:22:38', '2026-08-28 13:22:38', NULL),
('360b5d07-674e-4dd2-aa7b-5c33a54c4cf6', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Mizoram', 'ST-9DC7A3F9', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:23:53', '2026-08-28 13:23:53', NULL),
('5e9f194c-49e3-44b6-a721-779e97dc5097', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Madhya Pradesh', 'ST-F2FB1D8C', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:23:07', '2026-08-28 13:23:07', NULL),
('6064cd40-0cdc-4f1a-89be-19df5a09cd96', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Arunachal Pradesh', 'ST-90E6D127', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:20:58', '2026-08-28 13:20:58', NULL),
('61bcf5fa-16bf-4d7b-906a-6a56b6f37787', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Andhra Pradesh', 'ST-B4F80CBB', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:20:42', '2026-08-28 13:52:48', '2026-08-28 13:52:48'),
('6e6eaafe-c40e-4126-b3ec-e6b881e7f4f9', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Rajasthan', 'ST-0E549850', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:12', '2026-08-28 13:25:12', NULL),
('7591bc70-fc40-493d-b047-ee2103c50b54', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'kerala', NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:17:58', '2026-08-28 17:35:40', '2026-08-28 17:35:40'),
('76b55356-85eb-4b8e-93c2-95873f95e071', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'karnataka', 'ST-CAB44F61', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:18:35', '2026-08-28 13:52:45', '2026-08-28 13:52:45'),
('7a0d580b-d46f-4404-b1ec-83559d5d0b84', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Nagaland', 'ST-9C29F032', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:24:11', '2026-08-28 13:24:11', NULL),
('83ff9ec4-ef6a-4137-af51-ce6edb90c2b7', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Telangana', 'ST-E9DD510F', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:31', '2026-08-28 13:25:31', NULL),
('9a6d32b3-98d5-46d2-9686-a2b777797191', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Haryana', 'ST-0C7539CC', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:22:16', '2026-08-28 13:22:16', NULL),
('9dfbd62e-7465-4aad-88bc-1b1d45ff6287', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Uttarakhand', 'ST-EBE51A2B', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:26:05', '2026-08-28 13:52:15', '2026-08-28 13:52:15'),
('c06653c9-b279-4ab6-8792-62b9db4abb7b', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Goa', 'ST-673156BD', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:21:55', '2026-08-28 13:21:55', NULL),
('c4f653f0-5846-495d-87a9-86311b84ae73', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Sikkim', 'ST-FCD31C2B', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:21', '2026-08-28 13:25:21', NULL),
('d6bc577a-45c2-42d4-9a29-58525bc9d54e', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Tamilnadu', 'ST-F8F1DFA3', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:24:48', '2026-08-28 16:25:44', NULL),
('db1bc640-5c5b-448e-87de-804ebfcaf39e', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Uttar Pradesh', 'ST-1A0DF53D', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:53', '2026-08-28 13:52:20', '2026-08-28 13:52:20'),
('f8e1d6d2-0dbf-4a6e-96a7-1c13b305c170', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Meghalaya', 'ST-8B722D11', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:23:39', '2026-08-28 13:23:39', NULL),
('f9fafded-205b-4982-af57-74efb06e6f2e', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Tripura', 'ST-1BD30C41', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:25:41', '2026-08-28 13:52:27', '2026-08-28 13:52:27'),
('ffeb4429-8374-4488-bf64-dd6e2e74edc1', '7fd02122-58c7-49b2-a38d-b78eb4f3e342', 'Odisha', 'ST-0507A7F1', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 13:24:39', '2026-08-28 13:24:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tt_tax`
--

CREATE TABLE `tt_tax` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_percentage` decimal(8,2) NOT NULL,
  `tax_type` enum('GST','VAT','CGST','SGST','IGST','Service Tax','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GST',
  `applicable_on` enum('Package','Hotel','Transport','Visa','Insurance','Activities','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Package',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tt_user_table_preferences`
--

CREATE TABLE `tt_user_table_preferences` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hidden_columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `designation_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `driver_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `last_activity_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `role_id`, `branch_id`, `department_id`, `designation_id`, `driver_id`, `avatar`, `is_active`, `last_login_at`, `last_activity_at`, `reset_token`, `reset_token_expires`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('f86a621a-7197-41d2-9395-b53d4205f00c', 'Pollachi Tours and Travels', 'Admin', 'admin@tours.com', '+917373418181', '$2a$12$Iuj3Dr.It/8rFl9co31Jsu52Dj2JOl.MMa1heN7wjSa2H3T6Tp6Vy', '1fc71958-2f9d-43dd-8dfa-e83705a270c7', NULL, NULL, NULL, NULL, NULL, 1, '2026-08-28 17:15:54', '2026-08-28 17:42:48', NULL, NULL, NULL, NULL, '2026-07-23 13:05:59', '2026-08-28 17:42:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_per_day` decimal(12,2) NOT NULL DEFAULT '0.00',
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `updated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `ownership` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'own',
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `name`, `code`, `type`, `capacity`, `registration_number`, `price_per_day`, `supplier_id`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `ownership`, `image`, `availability_status`) VALUES
('16692c00-c694-482c-a611-2914b80851cc', 'Bus', 'VEH-978412A4', 'Bus', 54, 'TN20DA2899', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:19:42', '2026-08-28 16:19:42', NULL, 'own', NULL, 'available'),
('16b2bddf-382a-462d-a326-a771c66e4cbf', 'Crysta', 'VEH-DFFD9D18', 'SUV', 7, 'TN41BC6003', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:11:15', '2026-08-28 08:11:15', NULL, 'own', NULL, 'available'),
('20103ceb-7b9c-47a8-803f-a384758f5d1a', 'Dzire', 'VEH-8268CE9A', 'Sedan', 4, 'TN78R2749', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:09:49', '2026-08-28 08:09:49', NULL, 'own', NULL, 'available'),
('4be97a0a-73b8-4d0b-a9e3-da6e9ae00da1', 'Tempo Traveller 18 Seater', 'VEH-B5602178', 'Van', 18, 'TN38DP5050', 0.00, '4685ab95-2955-4d74-b259-a19e7ea2a73e', NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:32:09', '2026-08-28 16:32:32', NULL, 'vendor', NULL, 'on_trip'),
('50d9924d-60d5-4c65-b601-70eb129e6c60', 'Coach Van Non AC', 'VEH-EAA3A219', 'Van', 21, 'TN43J6788', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:40:37', '2026-08-28 16:19:17', NULL, 'own', NULL, 'on_trip'),
('559b6e29-2c40-4587-94b7-93430154321e', 'Ciaz', 'VEH-EDD602DD', 'Sedan Premium', 4, 'TN38DR4646', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:10:21', '2026-08-28 08:10:21', NULL, 'own', NULL, 'available'),
('7c91d62f-5530-45f8-8e47-d2e3c2884a3b', 'Ertiga', 'VEH-470FBAE3', 'SUV', 6, 'TN41BD2992', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 08:10:57', '2026-08-28 08:10:57', NULL, 'own', NULL, 'available'),
('7f21c7c4-6020-4261-9ebd-82ff6169371e', 'Tempo Traveller', 'VEH-F3B03811', 'Van', 14, 'TN41BD2999', 0.00, NULL, NULL, 1, 'f86a621a-7197-41d2-9395-b53d4205f00c', 'f86a621a-7197-41d2-9395-b53d4205f00c', '2026-08-28 16:18:54', '2026-08-28 16:18:54', NULL, 'own', NULL, 'available');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_allocations`
--

CREATE TABLE `vehicle_allocations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `driver_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'allocated',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_booking_code_unique` (`booking_code`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`);

--
-- Indexes for table `cancellations`
--
ALTER TABLE `cancellations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `destinations_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enquiries_enquiry_code_unique` (`enquiry_code`);

--
-- Indexes for table `enquiry_notes`
--
ALTER TABLE `enquiry_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enquiry_notes_enquiry_id` (`enquiry_id`);

--
-- Indexes for table `enquiry_payments`
--
ALTER TABLE `enquiry_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_enquiry_payments_code` (`payment_code`),
  ADD KEY `idx_enquiry_payments_enquiry_id` (`enquiry_id`),
  ADD KEY `idx_enquiry_payments_quotation_id` (`quotation_id`);

--
-- Indexes for table `enquiry_vehicle_assignments`
--
ALTER TABLE `enquiry_vehicle_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eva_enquiry` (`enquiry_id`),
  ADD KEY `idx_eva_vehicle` (`vehicle_id`),
  ADD KEY `idx_eva_driver` (`driver_id`),
  ADD KEY `idx_eva_dates` (`start_date`,`end_date`);

--
-- Indexes for table `enquiry_vehicle_assignment_status_logs`
--
ALTER TABLE `enquiry_vehicle_assignment_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eva_status_log_assignment` (`assignment_id`),
  ADD KEY `idx_eva_status_log_enquiry` (`enquiry_id`),
  ADD KEY `idx_eva_status_log_recorded` (`recorded_at`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expenses_expense_code_unique` (`expense_code`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `feedbacks_share_token_unique` (`share_token`);

--
-- Indexes for table `flight_bookings`
--
ALTER TABLE `flight_bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `follow_ups`
--
ALTER TABLE `follow_ups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hotels_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indexes for table `hotel_reservations`
--
ALTER TABLE `hotel_reservations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inclusions_exclusions_master`
--
ALTER TABLE `inclusions_exclusions_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inclusions_exclusions_master_type_heading` (`type`,`heading`),
  ADD KEY `inclusions_exclusions_master_type` (`type`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`);

--
-- Indexes for table `itineraries`
--
ALTER TABLE `itineraries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `share_token` (`share_token`);

--
-- Indexes for table `itinerary_days`
--
ALTER TABLE `itinerary_days`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_itinerary_days_itinerary` (`itinerary_id`);

--
-- Indexes for table `itinerary_destinations`
--
ALTER TABLE `itinerary_destinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_itinerary_destinations_itinerary` (`itinerary_id`);

--
-- Indexes for table `itinerary_events`
--
ALTER TABLE `itinerary_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_itinerary_events_day` (`itinerary_day_id`),
  ADD KEY `idx_itinerary_events_itinerary` (`itinerary_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `leads_lead_code_unique` (`lead_code`);

--
-- Indexes for table `lead_source_type_master`
--
ALTER TABLE `lead_source_type_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_source_type` (`lead_source_type`),
  ADD UNIQUE KEY `lead_source_type_2` (`lead_source_type`),
  ADD UNIQUE KEY `lead_source_type_3` (`lead_source_type`),
  ADD UNIQUE KEY `lead_source_type_4` (`lead_source_type`),
  ADD UNIQUE KEY `lead_source_type_5` (`lead_source_type`);

--
-- Indexes for table `lead_status_master`
--
ALTER TABLE `lead_status_master`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `lead_status_whatsapp_templates`
--
ALTER TABLE `lead_status_whatsapp_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_whatsapp_template_name` (`template_name`),
  ADD KEY `idx_ls_whatsapp_active` (`is_active`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_history_user_id` (`user_id`),
  ADD KEY `idx_login_history_login_at` (`login_at`),
  ADD KEY `idx_login_history_logout_at` (`logout_at`),
  ADD KEY `idx_login_history_refresh_token_id` (`refresh_token_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `packages_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indexes for table `package_terms_master`
--
ALTER TABLE `package_terms_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `package_terms_master_heading_unique` (`heading`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotations_quotation_code_unique` (`quotation_code`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_unique` (`token`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `token_2` (`token`),
  ADD UNIQUE KEY `token_3` (`token`),
  ADD UNIQUE KEY `token_4` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `refunds`
--
ALTER TABLE `refunds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refunds_refund_code_unique` (`refund_code`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`),
  ADD UNIQUE KEY `roles_code_unique` (`code`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `code_4` (`code`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`);

--
-- Indexes for table `supplier_payments`
--
ALTER TABLE `supplier_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_blacklist_token_unique` (`token`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `token_2` (`token`),
  ADD UNIQUE KEY `token_3` (`token`),
  ADD UNIQUE KEY `token_4` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tt_city`
--
ALTER TABLE `tt_city`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tt_city_state_name` (`state_id`,`name`),
  ADD KEY `country_id` (`country_id`);

--
-- Indexes for table `tt_country`
--
ALTER TABLE `tt_country`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `currency_id` (`currency_id`);

--
-- Indexes for table `tt_currency`
--
ALTER TABLE `tt_currency`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_departments`
--
ALTER TABLE `tt_departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `department_code` (`department_code`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `tt_designations`
--
ALTER TABLE `tt_designations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `designation_code` (`designation_code`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `tt_drivers`
--
ALTER TABLE `tt_drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_driver_proofs`
--
ALTER TABLE `tt_driver_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `tt_expenses_type`
--
ALTER TABLE `tt_expenses_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_guides`
--
ALTER TABLE `tt_guides`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_payment_mode`
--
ALTER TABLE `tt_payment_mode`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_season_pricing`
--
ALTER TABLE `tt_season_pricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_state`
--
ALTER TABLE `tt_state`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tt_state_country_name` (`country_id`,`name`);

--
-- Indexes for table `tt_tax`
--
ALTER TABLE `tt_tax`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `tt_user_table_preferences`
--
ALTER TABLE `tt_user_table_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_table_pref` (`user_id`,`table_key`),
  ADD KEY `idx_user_table_pref_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD KEY `idx_users_department_id` (`department_id`),
  ADD KEY `idx_users_designation_id` (`designation_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `idx_users_driver_id` (`driver_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicles_code_unique` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `vehicle_allocations`
--
ALTER TABLE `vehicle_allocations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_status_master`
--
ALTER TABLE `lead_status_master`
  ADD CONSTRAINT `lead_status_master_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_7` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_8` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD CONSTRAINT `token_blacklist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tt_city`
--
ALTER TABLE `tt_city`
  ADD CONSTRAINT `tt_city_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `tt_country` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tt_city_ibfk_2` FOREIGN KEY (`state_id`) REFERENCES `tt_state` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tt_country`
--
ALTER TABLE `tt_country`
  ADD CONSTRAINT `tt_country_ibfk_1` FOREIGN KEY (`currency_id`) REFERENCES `tt_currency` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tt_designations`
--
ALTER TABLE `tt_designations`
  ADD CONSTRAINT `tt_designations_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `tt_departments` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tt_driver_proofs`
--
ALTER TABLE `tt_driver_proofs`
  ADD CONSTRAINT `tt_driver_proofs_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `tt_drivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tt_state`
--
ALTER TABLE `tt_state`
  ADD CONSTRAINT `tt_state_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `tt_country` (`id`) ON UPDATE CASCADE;

--
-- Fix invalid foreign key references before adding constraints
--
UPDATE `users` SET `branch_id` = NULL WHERE `branch_id` = '' OR `branch_id` = '0' OR `branch_id` NOT IN (SELECT `id` FROM (SELECT `id` FROM `branches`) AS b);
UPDATE `users` SET `role_id` = NULL WHERE `role_id` IS NOT NULL AND `role_id` NOT IN (SELECT `id` FROM (SELECT `id` FROM `roles`) AS r);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_29` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_30` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

