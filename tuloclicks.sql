-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: May 04, 2026 at 08:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tuloclicks`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(150) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `details`, `ip_address`, `created_at`) VALUES
(1, 2, 'UPDATE_EVENT', 'event', 5, 'Updated event ID 5', NULL, '::1', '2026-04-25 07:35:45'),
(2, 2, 'CREATE_EVENT', 'event', 6, 'Created event: the man who cant be lihok', NULL, '::1', '2026-04-25 08:24:51'),
(3, 2, 'UPDATE_EVENT', 'event', 6, 'Updated event ID 6', NULL, '::1', '2026-04-25 08:25:50'),
(4, 9, 'LOGIN', 'user', 9, 'User logged in: marnoljaytolo@gmail.com', NULL, '::1', '2026-04-25 08:28:57'),
(5, 2, 'UPDATE_EVENT', 'event', 6, 'Updated event ID 6', NULL, '::1', '2026-04-25 08:33:27'),
(6, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-28 14:31:03'),
(7, 5, 'APPROVE_EVENT', 'event', 5, 'Approved event ID 5', NULL, '::1', '2026-04-28 14:31:34'),
(8, 5, 'FEATURE_EVENT', 'event', 5, 'Featured event ID 5', NULL, '::1', '2026-04-28 14:31:36'),
(9, 5, 'UNFEATURE_EVENT', 'event', 5, 'Unfeatured event ID 5', NULL, '::1', '2026-04-28 14:31:37'),
(10, 5, 'REJECT_ORGANIZER', 'organizer_profile', 4, 'Rejected organizer application for user ID 9', NULL, '::1', '2026-04-28 14:32:40'),
(11, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-28 14:36:37'),
(12, 11, 'SIGNUP', 'user', 11, 'New user registered: kim@gmail.com', NULL, '::1', '2026-04-28 14:40:07'),
(13, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-28 14:40:07'),
(14, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-28 15:06:51'),
(15, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-28 15:08:11'),
(16, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-28 15:25:42'),
(17, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-28 15:26:00'),
(18, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-28 15:26:39'),
(19, 8, 'UPDATE_EVENT', 'event', 2, 'Updated event ID 2', NULL, '::1', '2026-04-28 15:28:33'),
(20, 8, 'CREATE_EVENT', 'event', 7, 'Created event: Wellness Workshop', NULL, '::1', '2026-04-28 15:32:30'),
(21, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 15:47:28'),
(22, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 15:59:22'),
(23, 8, 'UPDATE_EVENT', 'event', 2, 'Updated event ID 2', NULL, '::1', '2026-04-28 16:02:47'),
(24, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:04:08'),
(25, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:05:52'),
(26, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:09:42'),
(27, 8, 'UPDATE_EVENT', 'event', 2, 'Updated event ID 2', NULL, '::1', '2026-04-28 16:10:10'),
(28, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:13:13'),
(29, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:27:30'),
(30, 8, 'UPDATE_EVENT', 'event', 7, 'Updated event ID 7', NULL, '::1', '2026-04-28 16:27:36'),
(31, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-04-28 16:42:41'),
(32, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-28 16:45:00'),
(33, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-28 16:45:20'),
(34, 5, 'APPROVE_EVENT', 'event', 6, 'Approved event ID 6', NULL, '::1', '2026-04-28 16:45:29'),
(35, 5, 'APPROVE_EVENT', 'event', 7, 'Approved event ID 7', NULL, '::1', '2026-04-28 16:45:30'),
(36, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-28 16:46:36'),
(37, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-04-28 16:47:44'),
(38, 6, 'CREATE_PAYMENT', 'payment', 6, 'Created payment for booking ID 6', NULL, '::1', '2026-04-28 16:50:47'),
(39, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-28 16:51:27'),
(40, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-04-28 16:55:25'),
(41, 6, 'CREATE_PAYMENT', 'payment', 7, 'Created payment for booking ID 7', NULL, '::1', '2026-04-28 16:58:52'),
(42, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-28 16:59:51'),
(43, 5, 'PAYMENT_SUCCESS', 'payment', 7, 'Approved payment ID 7', NULL, '::1', '2026-04-28 17:00:01'),
(44, 5, 'PAYMENT_SUCCESS', 'payment', 6, 'Approved payment ID 6', NULL, '::1', '2026-04-28 17:00:03'),
(45, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-04-28 17:00:23'),
(46, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-28 17:03:52'),
(47, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-29 14:58:35'),
(48, 12, 'SIGNUP', 'user', 12, 'New user registered: kimmy@gmail.com', NULL, '::1', '2026-04-29 15:01:50'),
(49, 12, 'LOGIN', 'user', 12, 'User logged in: kimmy@gmail.com', NULL, '::1', '2026-04-29 15:01:50'),
(50, 12, 'LOGIN', 'user', 12, 'User logged in: kimmy@gmail.com', NULL, '::1', '2026-04-29 15:09:08'),
(51, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-04-29 15:11:12'),
(52, 11, 'CREATE_PAYMENT', 'payment', 8, 'Created payment for booking ID 8', NULL, '::1', '2026-04-29 15:12:22'),
(53, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-29 17:28:01'),
(54, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-30 14:44:31'),
(55, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-30 14:45:18'),
(56, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-30 14:45:53'),
(57, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-30 14:49:17'),
(58, 5, 'PAYMENT_SUCCESS', 'payment', 8, 'Approved payment ID 8', NULL, '::1', '2026-04-30 14:50:38'),
(59, 5, 'PAYMENT_SUCCESS', 'payment', 5, 'Approved payment ID 5', NULL, '::1', '2026-04-30 14:51:17'),
(60, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-04-30 14:55:48'),
(61, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-30 14:56:08'),
(62, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-04-30 15:11:56'),
(63, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-01 14:29:47'),
(64, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-01 15:22:18'),
(65, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-01 23:50:43'),
(66, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-01 23:52:23'),
(67, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-01 23:55:37'),
(68, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:05:01'),
(69, 8, 'CREATE_EVENT', 'event', 8, 'Created event: Ed tour', NULL, '::1', '2026-05-02 00:06:16'),
(70, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-02 00:06:41'),
(71, 5, 'APPROVE_EVENT', 'event', 8, 'Approved event ID 8', NULL, '::1', '2026-05-02 00:06:48'),
(72, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:07:13'),
(73, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-02 00:08:15'),
(74, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-02 00:10:44'),
(75, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:11:20'),
(76, 8, 'UPDATE_EVENT', 'event', 8, 'Updated event ID 8', NULL, '::1', '2026-05-02 00:11:34'),
(77, 8, 'UPDATE_EVENT', 'event', 8, 'Updated event ID 8', NULL, '::1', '2026-05-02 00:11:44'),
(78, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-02 00:12:40'),
(79, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-02 00:13:04'),
(80, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-02 00:16:58'),
(81, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:18:15'),
(82, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:19:55'),
(83, 12, 'LOGIN', 'user', 12, 'User logged in: kimmy@gmail.com', NULL, '::1', '2026-05-02 00:20:26'),
(84, 12, 'CREATE_PAYMENT', 'payment', 9, 'Created payment for booking ID 11', NULL, '::1', '2026-05-02 00:21:04'),
(85, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-02 00:21:56'),
(86, 5, 'PAYMENT_SUCCESS', 'payment', 9, 'Approved payment ID 9', NULL, '::1', '2026-05-02 00:22:02'),
(87, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-02 00:22:49'),
(88, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-04 14:05:47'),
(89, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-04 14:06:01'),
(90, 9, 'LOGIN', 'user', 9, 'User logged in: marnoljaytolo@gmail.com', NULL, '::1', '2026-05-04 14:07:05'),
(91, 9, 'LOGIN', 'user', 9, 'User logged in: marnoljaytolo@gmail.com', NULL, '::1', '2026-05-04 14:25:23'),
(92, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-04 14:51:46'),
(93, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-04 14:52:30'),
(94, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-04 14:57:37'),
(95, 6, 'CREATE_SUPPORT', 'support_ticket', 1, 'Created support ticket: asdas', NULL, '::1', '2026-05-04 15:03:13'),
(96, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-04 15:03:56'),
(97, 5, 'UPDATE_SUPPORT_STATUS', 'support_ticket', 1, 'Updated ticket #1 status to in_progress', NULL, '::1', '2026-05-04 15:19:57'),
(98, 5, 'UPDATE_SUPPORT_STATUS', 'support_ticket', 1, 'Updated ticket #1 status to closed', NULL, '::1', '2026-05-04 15:20:14'),
(99, 5, 'UPDATE_SUPPORT_STATUS', 'support_ticket', 1, 'Updated ticket #1 status to open', NULL, '::1', '2026-05-04 15:20:19'),
(100, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-04 15:31:16'),
(101, 6, 'CREATE_BOOKING', 'system', 12, 'Reference: TC-2026-243326', NULL, '::1', '2026-05-04 15:50:49'),
(102, 6, 'CREATE_PAYMENT', 'payment', 10, 'Created payment for booking ID 12', NULL, '::1', '2026-05-04 15:50:49'),
(103, 6, 'CREATE_BOOKING', 'system', 13, 'Reference: TC-2026-684028', NULL, '::1', '2026-05-04 16:01:36'),
(104, 6, 'CREATE_PAYMENT', 'payment', 11, 'Created payment for booking ID 13', NULL, '::1', '2026-05-04 16:01:36'),
(105, 6, 'CREATE_BOOKING', 'system', 14, 'Reference: TC-2026-478446', NULL, '::1', '2026-05-04 16:11:00'),
(106, 6, 'CREATE_PAYMENT', 'payment', 12, 'Created payment for booking ID 14', NULL, '::1', '2026-05-04 16:11:00'),
(107, 6, 'CREATE_BOOKING', 'system', 15, 'Reference: TC-2026-286930', NULL, '::1', '2026-05-04 16:38:50'),
(108, 6, 'CREATE_PAYMENT', 'payment', 13, 'Created payment for booking ID 15', NULL, '::1', '2026-05-04 16:38:50'),
(109, 6, 'CREATE_BOOKING', 'system', 16, 'Reference: TC-2026-841385', NULL, '::1', '2026-05-04 16:40:55'),
(110, 6, 'CREATE_PAYMENT', 'payment', 14, 'Created payment for booking ID 16', NULL, '::1', '2026-05-04 16:40:55'),
(111, 8, 'CHECKIN', 'system', 16, 'Manual Check-in', NULL, '::1', '2026-05-04 17:14:56'),
(112, 8, 'UPDATE_EVENT', 'event', 2, 'Updated event ID 2', NULL, '::1', '2026-05-04 17:16:27'),
(113, 8, 'UPDATE_STATUS', 'system', 16, 'Status updated to attended', NULL, '::1', '2026-05-04 17:31:11'),
(114, 5, 'LOGIN', 'user', 5, 'User logged in: admin@tuloclicks.com', NULL, '::1', '2026-05-04 17:53:20'),
(115, 11, 'LOGIN', 'user', 11, 'User logged in: kim@gmail.com', NULL, '::1', '2026-05-04 17:53:51'),
(116, 11, 'CREATE_BOOKING', 'system', 17, 'Reference: TC-2026-884271', NULL, '::1', '2026-05-04 17:54:33'),
(117, 11, 'CREATE_PAYMENT', 'payment', 15, 'Created payment for booking ID 17', NULL, '::1', '2026-05-04 17:54:33'),
(118, 8, 'LOGIN', 'user', 8, 'User logged in: janedoe@gmail.com', NULL, '::1', '2026-05-04 17:55:02'),
(119, 8, 'CHECKIN', 'system', 16, 'Manual Check-in', NULL, '::1', '2026-05-04 17:59:21'),
(120, 8, 'CHECKIN', 'system', 17, 'Manual Check-in', NULL, '::1', '2026-05-04 18:00:22'),
(121, 8, 'UPDATE_STATUS', 'system', 17, 'Status updated to attended', NULL, '::1', '2026-05-04 18:00:47'),
(122, 6, 'LOGIN', 'user', 6, 'User logged in: cranks@gmail.com', NULL, '::1', '2026-05-04 18:01:30');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `booking_status` enum('pending','confirmed','cancelled','refunded','checked_in','attended') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','failed','refunded','partial_refund') NOT NULL DEFAULT 'unpaid',
  `attendee_name` varchar(150) NOT NULL,
  `attendee_email` varchar(150) NOT NULL,
  `attendee_phone` varchar(30) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `qr_code` varchar(255) DEFAULT NULL,
  `checked_in_at` datetime DEFAULT NULL,
  `checked_out_at` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_reference`, `user_id`, `event_id`, `booking_status`, `payment_status`, `attendee_name`, `attendee_email`, `attendee_phone`, `total_amount`, `qr_code`, `checked_in_at`, `checked_out_at`, `cancellation_reason`, `booked_at`, `updated_at`) VALUES
(1, 'TC-2026-233025', 6, 1, 'checked_in', 'paid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09923123456', 5500.00, NULL, '2026-04-14 01:31:01', NULL, NULL, '2026-04-13 16:37:21', '2026-04-13 17:31:01'),
(2, 'TC-2026-206478', 9, 2, 'checked_in', 'paid', 'Marnol Jay Tolo', 'marnoljaytolo@gmail.com', '+63 917 654 3210', 1500.00, NULL, '2026-04-15 12:34:11', NULL, NULL, '2026-04-15 02:38:09', '2026-04-15 04:34:11'),
(3, 'TC-2026-364264', 9, 1, 'refunded', 'refunded', 'Marnol Jay Tolo', 'marnoljaytolo@gmail.com', '0983737266123', 5500.00, NULL, '2026-04-25 12:10:04', NULL, 'Cancelled by user', '2026-04-16 17:02:25', '2026-04-28 14:37:28'),
(4, 'TC-2026-304723', 9, 1, 'checked_in', 'failed', 'Marnol jay Tolo', 'marnoljaytolo@gmail.com', '08897265431', 5500.00, NULL, '2026-04-25 12:14:42', NULL, NULL, '2026-04-25 04:14:28', '2026-04-25 05:59:57'),
(5, 'TC-2026-581083', 10, 2, 'confirmed', 'paid', 'Kimy Ogbol', 'kimyogs@gmail.com', '123123123', 1500.00, NULL, '2026-04-28 23:27:19', NULL, NULL, '2026-04-25 06:15:08', '2026-04-30 14:51:17'),
(6, 'TC-2026-733369', 6, 7, 'cancelled', 'paid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09876565434', 280.00, NULL, '2026-04-29 00:51:40', NULL, NULL, '2026-04-28 16:50:47', '2026-05-04 16:39:59'),
(7, 'TC-2026-969560', 6, 2, 'cancelled', 'paid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09878767876', 1500.00, NULL, NULL, NULL, NULL, '2026-04-28 16:58:52', '2026-05-04 16:40:01'),
(8, 'TC-2026-429578', 11, 7, 'confirmed', 'paid', 'Kim', 'kim@gmail.com', '09898787678', 420.00, NULL, NULL, NULL, NULL, '2026-04-29 15:12:22', '2026-04-30 14:50:38'),
(9, 'TC-2026-334618', 6, 8, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '098768576567', 0.00, NULL, NULL, NULL, NULL, '2026-05-02 00:09:01', '2026-05-04 16:40:21'),
(10, 'TC-2026-605674', 6, 8, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '098768576567', 0.00, NULL, NULL, NULL, NULL, '2026-05-02 00:09:40', '2026-05-04 16:40:23'),
(11, 'TC-2026-292033', 12, 8, 'confirmed', 'paid', 'kimmy', 'kimmy@gmail.com', '09898787676', 1.00, NULL, NULL, NULL, NULL, '2026-05-02 00:21:04', '2026-05-02 00:22:02'),
(12, 'TC-2026-243326', 6, 2, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09123123', 1.00, NULL, NULL, NULL, NULL, '2026-05-04 15:50:49', '2026-05-04 16:40:14'),
(13, 'TC-2026-684028', 6, 2, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '123213', 2.00, NULL, NULL, NULL, NULL, '2026-05-04 16:01:36', '2026-05-04 16:40:11'),
(14, 'TC-2026-478446', 6, 2, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09827262622', 100.00, NULL, NULL, NULL, NULL, '2026-05-04 16:11:00', '2026-05-04 16:39:39'),
(15, 'TC-2026-286930', 6, 2, 'cancelled', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '09874563214', 600.00, NULL, NULL, NULL, NULL, '2026-05-04 16:38:50', '2026-05-04 16:39:37'),
(16, 'TC-2026-841385', 6, 2, 'checked_in', 'unpaid', 'RozenCranks Tiuname', 'cranks@gmail.com', '0998745874', 3000.00, NULL, '2026-05-05 01:59:21', NULL, NULL, '2026-05-04 16:40:55', '2026-05-04 17:59:21'),
(17, 'TC-2026-884271', 11, 2, 'attended', 'unpaid', 'Kim', 'kim@gmail.com', '099987458521', 600.00, NULL, '2026-05-05 02:00:22', NULL, NULL, '2026-05-04 17:54:33', '2026-05-04 18:00:47');

-- --------------------------------------------------------

--
-- Table structure for table `booking_items`
--

CREATE TABLE `booking_items` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `ticket_type_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_items`
--

INSERT INTO `booking_items` (`id`, `booking_id`, `ticket_type_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES
(1, 15, 1, 1, 600.00, 600.00, '2026-05-04 16:38:50'),
(2, 16, 2, 2, 1500.00, 3000.00, '2026-05-04 16:40:55'),
(3, 17, 1, 1, 600.00, 600.00, '2026-05-04 17:54:33');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `organizer_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `venue_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) DEFAULT NULL,
  `description` text NOT NULL,
  `event_image` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `location_type` enum('physical','online','hybrid') NOT NULL DEFAULT 'physical',
  `custom_location` varchar(255) DEFAULT NULL,
  `online_link` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `publish_status` enum('draft','published','unpublished','cancelled','completed') NOT NULL DEFAULT 'draft',
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `featured_until` datetime DEFAULT NULL,
  `platform_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_revenue` decimal(12,2) NOT NULL DEFAULT 0.00,
  `approval_notes` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_by` int(11) DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `organizer_id`, `category_id`, `venue_id`, `title`, `slug`, `description`, `event_image`, `start_date`, `end_date`, `start_time`, `end_time`, `location_type`, `custom_location`, `online_link`, `approval_status`, `publish_status`, `featured`, `featured_until`, `platform_fee`, `total_revenue`, `approval_notes`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 1, 'LANY: Soft World Tour', 'lany-soft-world-tour-1776096804926', 'Prepare for a night of dreamy synths, soulful vocals, and the signature California-cool aesthetic that has made LANY a local favorite. Don\'t miss your chance to be part of this \"Soft\" era where every lyric hits home and every melody stays with you.', NULL, '2026-08-06', NULL, '21:30:00', NULL, 'physical', 'Cebu City', NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Approved by admin', 5, '2026-04-14 00:16:33', NULL, NULL, '2026-04-13 16:13:24', '2026-04-25 05:17:23'),
(2, 8, 6, 3, 'Cebu Tech & Startup Summit 2026.', 'cebu-tech-startup-summit-2026-1777914987839', 'A premier gathering of tech enthusiasts, startups, and industry leaders in Cebu City. Join us for a full day of insightful talks, networking opportunities, and innovation showcases featuring local and international speakers. Perfect for developers, entrepreneurs, and students looking to grow in the tech industry.', 'event-1777392609805.jpg', '2026-05-05', '2026-05-05', '09:00:00', '21:00:00', 'physical', 'Cebu City, Philippines ', NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Event approved by admin', 5, '2026-04-25 12:53:10', NULL, NULL, '2026-04-15 02:24:13', '2026-05-04 17:16:27'),
(5, 2, 7, 3, 'asdasdm', 'asdasdm-1777102545231', '12312', NULL, '0111-11-11', '1901-11-10', '11:11:00', '23:11:00', 'online', '123', NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Event approved by admin', 5, '2026-04-28 22:31:34', NULL, NULL, '2026-04-25 05:26:05', '2026-04-28 14:31:37'),
(6, 2, 25, 3, 'the man who cant be lihok', 'the-man-who-cant-be-lihok-1777106007861', 'adsdasd', '[object Object]', '1899-11-28', '2222-11-09', '11:11:00', '23:11:00', 'hybrid', 'asdas', NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Event approved by admin', 5, '2026-04-29 00:45:29', NULL, NULL, '2026-04-25 08:24:51', '2026-04-28 16:45:29'),
(7, 8, 3, 3, 'Wellness Workshop', 'wellness-workshop-1777393656860', 'Wellness 2026', 'event-1777393656759.jpg', '2026-04-21', '2026-04-22', '10:00:00', '17:20:00', 'physical', NULL, NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Event approved by admin', 5, '2026-04-29 00:45:30', NULL, NULL, '2026-04-28 15:32:30', '2026-04-28 16:45:30'),
(8, 8, 8, 3, 'Ed tour', 'ed-tour-1777680704250', 'dsdhsuhfsf', NULL, '2026-04-30', '2026-04-30', '08:00:00', '08:20:00', 'physical', NULL, NULL, 'approved', 'published', 0, NULL, 0.00, 0.00, 'Event approved by admin', 5, '2026-05-02 08:06:48', NULL, NULL, '2026-05-02 00:06:16', '2026-05-02 00:11:44');

-- --------------------------------------------------------

--
-- Table structure for table `event_categories`
--

CREATE TABLE `event_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_categories`
--

INSERT INTO `event_categories` (`id`, `name`, `description`, `is_active`, `created_at`) VALUES
(1, 'Conference', 'Professional conferences and summits', 1, '2026-04-13 04:07:53'),
(2, 'Concert', 'Music and live performance events', 1, '2026-04-13 04:07:53'),
(3, 'Workshop', 'Hands-on training and workshop sessions', 1, '2026-04-13 04:07:53'),
(4, 'Seminar', 'Educational seminars and talks', 1, '2026-04-13 04:07:53'),
(5, 'Festival', 'Public festivals and large gatherings', 1, '2026-04-13 04:07:53'),
(6, 'Technology', NULL, 1, '2026-04-15 02:18:13'),
(7, 'Business', NULL, 1, '2026-04-15 02:18:13'),
(8, 'Education', NULL, 1, '2026-04-15 02:18:13'),
(9, 'Health & Wellness', NULL, 1, '2026-04-15 02:18:13'),
(10, 'Sports', NULL, 1, '2026-04-15 02:18:13'),
(11, 'Arts & Culture', NULL, 1, '2026-04-15 02:18:13'),
(12, 'Food & Dining', NULL, 1, '2026-04-15 02:18:13'),
(13, 'Travel & Tourism', NULL, 1, '2026-04-15 02:18:13'),
(14, 'Gaming & Esports', NULL, 1, '2026-04-15 02:18:13'),
(15, 'Fashion', NULL, 1, '2026-04-15 02:18:13'),
(16, 'Music', NULL, 1, '2026-04-15 02:18:13'),
(17, 'Networking', NULL, 1, '2026-04-15 02:18:13'),
(18, 'Startup & Entrepreneurship', NULL, 1, '2026-04-15 02:18:13'),
(19, 'Science', NULL, 1, '2026-04-15 02:18:13'),
(20, 'Environment', NULL, 1, '2026-04-15 02:18:13'),
(21, 'Religious', NULL, 1, '2026-04-15 02:18:13'),
(22, 'Charity & Fundraising', NULL, 1, '2026-04-15 02:18:13'),
(23, 'Family & Kids', NULL, 1, '2026-04-15 02:18:13'),
(24, 'Photography', NULL, 1, '2026-04-15 02:18:13'),
(25, 'Film & Media', NULL, 1, '2026-04-15 02:18:13');

-- --------------------------------------------------------

--
-- Table structure for table `event_speakers`
--

CREATE TABLE `event_speakers` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `speaker_id` int(11) NOT NULL,
  `speaker_order` int(11) NOT NULL DEFAULT 1,
  `topic_title` varchar(200) DEFAULT NULL,
  `topic_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_speakers`
--

INSERT INTO `event_speakers` (`id`, `event_id`, `speaker_id`, `speaker_order`, `topic_title`, `topic_description`, `created_at`) VALUES
(1, 1, 1, 1, NULL, NULL, '2026-04-13 16:14:49'),
(2, 2, 2, 1, NULL, NULL, '2026-04-15 02:29:04'),
(5, 7, 5, 1, NULL, NULL, '2026-04-28 15:33:59');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `related_type` varchar(50) DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `related_type`, `related_id`, `created_at`) VALUES
(1, 8, 'Organizer Application Submitted', 'Your organizer application has been submitted and is pending admin review.', 'info', 1, 'organizer_profile', 2, '2026-04-15 02:04:34'),
(2, 8, 'Organizer Application Approved', 'Your organizer application has been approved. You can now create and manage events.', 'success', 1, 'organizer_profile', 2, '2026-04-15 02:06:56'),
(3, 7, 'Organizer Application Submitted', 'Your organizer application has been submitted and is pending admin review.', 'info', 0, 'organizer_profile', 3, '2026-04-15 02:07:30'),
(4, 7, 'Organizer Application Rejected', 'Your organizer application was rejected. Application rejected.', 'error', 0, 'organizer_profile', 3, '2026-04-15 02:07:56'),
(5, 8, 'Event Created', 'Your event \"Cebu Tech & Startup Summit 2026\" has been created as a draft and is waiting for submission.', 'info', 1, 'event', 2, '2026-04-15 02:24:13'),
(6, 8, 'Event Submitted', 'Your event \"Cebu Tech & Startup Summit 2026\" was submitted for admin approval.', 'info', 1, 'event', 2, '2026-04-15 02:25:08'),
(7, 8, 'Event Approved', 'Your event \"Cebu Tech & Startup Summit 2026\" has been approved and published.', 'success', 1, 'event', 2, '2026-04-15 02:25:57'),
(8, 9, 'Booking Created', 'Your booking TC-2026-206478 for \"Cebu Tech & Startup Summit 2026\" was created successfully.', 'success', 0, 'booking', 2, '2026-04-15 02:38:09'),
(9, 9, 'Payment Record Created', 'A payment record was created for your booking TC-2026-206478.', 'info', 0, 'payment', 2, '2026-04-15 02:38:09'),
(10, 9, 'Payment Successful', 'Your payment for booking TC-2026-206478 was marked successful.', 'success', 0, 'payment', 2, '2026-04-15 02:44:50'),
(11, 9, 'Booking Created', 'Your booking TC-2026-364264 for \"LANY: Soft World Tour\" was created successfully.', 'success', 0, 'booking', 3, '2026-04-16 17:02:25'),
(12, 9, 'Payment Record Created', 'A payment record was created for your booking TC-2026-364264.', 'info', 0, 'payment', 3, '2026-04-16 17:02:25'),
(13, 8, 'Event Created', 'Your event \"asdasd\" has been created as a draft and is waiting for submission.', 'info', 1, 'event', 3, '2026-04-25 02:42:54'),
(14, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:07'),
(15, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:08'),
(16, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:08'),
(17, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:09'),
(18, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:09'),
(19, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:10'),
(20, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:32'),
(21, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:33'),
(22, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:33'),
(23, 8, 'Event Submitted', 'Your event \"Cebu Tech & Startup Summit 2026.\" was submitted for admin approval.', 'info', 1, 'event', 2, '2026-04-25 02:52:44'),
(24, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:47'),
(25, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:47'),
(26, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:47'),
(27, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:48'),
(28, 8, 'Event Submitted', 'Your event \"asdasd\" was submitted for admin approval.', 'info', 1, 'event', 3, '2026-04-25 02:52:48'),
(29, 8, 'Event Approved', 'Your event \"asdasd\" has been approved and published.', 'success', 1, 'event', 3, '2026-04-25 02:53:32'),
(30, 8, 'Event Created', 'Your event \"123\" has been created as a draft and is waiting for submission.', 'info', 1, 'event', 4, '2026-04-25 03:49:10'),
(31, 8, 'Event Approved', 'Your event \"123\" has been approved and published.', 'success', 1, 'event', 4, '2026-04-25 03:49:45'),
(32, 9, 'Payment Successful', 'Your payment for booking TC-2026-364264 was marked successful.', 'success', 0, 'payment', 3, '2026-04-25 04:06:51'),
(33, 9, 'Booking Cancelled', 'Your booking TC-2026-364264 has been cancelled.', 'warning', 0, 'booking', 3, '2026-04-25 04:12:58'),
(34, 9, 'Booking Created', 'Your booking TC-2026-304723 for \"LANY: Soft World Tour\" was created successfully.', 'success', 0, 'booking', 4, '2026-04-25 04:14:28'),
(35, 9, 'Payment Record Created', 'A payment record was created for your booking TC-2026-304723.', 'info', 0, 'payment', 4, '2026-04-25 04:14:28'),
(36, 8, 'Event Approved', 'Your event \"Cebu Tech & Startup Summit 2026.\" has been approved and published.', 'success', 1, 'event', 2, '2026-04-25 04:53:10'),
(37, 9, 'Organizer Application Submitted', 'Your organizer application has been submitted and is pending admin review.', 'info', 0, 'organizer_profile', 4, '2026-04-25 05:24:14'),
(38, 2, 'Event Created', 'Your event \"asdasd\" has been created as a draft and is waiting for submission.', 'info', 0, 'event', 5, '2026-04-25 05:26:05'),
(39, 9, 'Payment Failed', 'Your payment for booking TC-2026-304723 failed.', 'error', 0, 'payment', 4, '2026-04-25 05:59:57'),
(40, 10, 'Booking Created', 'Your booking TC-2026-581083 for \"Cebu Tech & Startup Summit 2026.\" was created successfully.', 'success', 0, 'booking', 5, '2026-04-25 06:15:08'),
(41, 10, 'Payment Record Created', 'A payment record was created for your booking TC-2026-581083.', 'info', 0, 'payment', 5, '2026-04-25 06:15:08'),
(42, 2, 'Event Created', 'Your event \"the man who cant be lihok\" has been created as a draft and is waiting for submission.', 'info', 0, 'event', 6, '2026-04-25 08:24:51'),
(43, 2, 'Event Approved', 'Your event \"asdasdm\" has been approved and published.', 'success', 0, 'event', 5, '2026-04-28 14:31:34'),
(44, 9, 'Organizer Application Rejected', 'Your organizer application was rejected. Application does not meet requirements.', 'error', 0, 'organizer_profile', 4, '2026-04-28 14:32:40'),
(45, 8, 'Event Created', 'Your event \"Wellness Workshop\" has been created as a draft and is waiting for submission.', 'info', 1, 'event', 7, '2026-04-28 15:32:30'),
(46, 2, 'Event Approved', 'Your event \"the man who cant be lihok\" has been approved and published.', 'success', 0, 'event', 6, '2026-04-28 16:45:29'),
(47, 8, 'Event Approved', 'Your event \"Wellness Workshop\" has been approved and published.', 'success', 1, 'event', 7, '2026-04-28 16:45:30'),
(48, 6, 'Booking Created', 'Ref: TC-2026-733369', 'success', 1, NULL, NULL, '2026-04-28 16:50:47'),
(49, 6, 'Booking Created', 'Ref: TC-2026-969560', 'success', 1, NULL, NULL, '2026-04-28 16:58:52'),
(50, 6, 'Payment Successful', 'Verified payment for TC-2026-969560.', 'success', 1, NULL, 7, '2026-04-28 17:00:01'),
(51, 6, 'Payment Successful', 'Verified payment for TC-2026-733369.', 'success', 1, NULL, 6, '2026-04-28 17:00:03'),
(52, 11, 'Booking Created', 'Ref: TC-2026-429578', 'success', 1, NULL, NULL, '2026-04-29 15:12:22'),
(53, 11, 'Payment Successful', 'Verified payment for TC-2026-429578.', 'success', 0, NULL, 8, '2026-04-30 14:50:38'),
(54, 10, 'Payment Successful', 'Verified payment for TC-2026-581083.', 'success', 0, NULL, 5, '2026-04-30 14:51:17'),
(55, 8, 'Event Created', 'Your event \"Ed tour\" has been created as a draft and is waiting for submission.', 'info', 1, 'event', 8, '2026-05-02 00:06:16'),
(56, 8, 'Event Approved', 'Your event \"Ed tour\" has been approved and published.', 'success', 1, 'event', 8, '2026-05-02 00:06:48'),
(57, 6, 'Booking Created', 'Ref: TC-2026-334618', 'success', 0, NULL, NULL, '2026-05-02 00:09:01'),
(58, 6, 'Booking Created', 'Ref: TC-2026-605674', 'success', 0, NULL, NULL, '2026-05-02 00:09:40'),
(59, 12, 'Booking Created', 'Ref: TC-2026-292033', 'success', 0, NULL, NULL, '2026-05-02 00:21:04'),
(60, 12, 'Payment Successful', 'Verified payment for TC-2026-292033.', 'success', 0, NULL, 9, '2026-05-02 00:22:02'),
(61, 6, 'Booking Created', 'Ref: TC-2026-243326', 'success', 0, NULL, NULL, '2026-05-04 15:50:49'),
(62, 6, 'Booking Created', 'Ref: TC-2026-684028', 'success', 0, NULL, NULL, '2026-05-04 16:01:36'),
(63, 6, 'Booking Created', 'Ref: TC-2026-478446', 'success', 0, NULL, NULL, '2026-05-04 16:11:00'),
(64, 6, 'Booking Created', 'Ref: TC-2026-286930', 'success', 0, NULL, NULL, '2026-05-04 16:38:50'),
(65, 6, 'Booking Created', 'Ref: TC-2026-841385', 'success', 0, NULL, NULL, '2026-05-04 16:40:55'),
(66, 11, 'Booking Created', 'Ref: TC-2026-884271', 'success', 0, NULL, NULL, '2026-05-04 17:54:33');

-- --------------------------------------------------------

--
-- Table structure for table `organizer_profiles`
--

CREATE TABLE `organizer_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `organization_name` varchar(200) NOT NULL,
  `organization_type` varchar(100) DEFAULT NULL,
  `branding_logo` varchar(255) DEFAULT NULL,
  `branding_banner` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `facebook_link` varchar(255) DEFAULT NULL,
  `instagram_link` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizer_profiles`
--

INSERT INTO `organizer_profiles` (`id`, `user_id`, `organization_name`, `organization_type`, `branding_logo`, `branding_banner`, `description`, `website`, `facebook_link`, `instagram_link`, `approval_status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 2, 'Lonmar Olot', 'Concert', NULL, NULL, 'Best Organizer', 'https://lonmarolot.com', 'https://facebook.com/lonmarolot', 'https://instagram.com/lonmarolot', 'approved', 5, '2026-04-14 00:16:49', NULL, '2026-04-13 16:06:41', '2026-04-13 16:16:49'),
(2, 8, 'Jane Doe', 'Company', NULL, NULL, 'THE GOAT ', 'https://janedoe-events.com', 'https://facebook.com/janedoe.official', 'https://instagram.com/janedoe.events', 'approved', 5, '2026-04-15 10:06:56', NULL, '2026-04-15 02:04:34', '2026-04-15 02:06:56'),
(3, 7, 'Ericksoyn Tiu', 'School Orgg', NULL, NULL, 'bayot', NULL, NULL, NULL, 'rejected', 5, '2026-04-15 10:07:56', 'Application rejected.', '2026-04-15 02:07:30', '2026-04-15 02:07:56'),
(4, 9, 'asd', 'asd', NULL, NULL, 'asd', 'asdwsa', 'asdasd', 'asdas', 'rejected', 5, '2026-04-28 22:32:40', 'Application does not meet requirements.', '2026-04-25 05:24:14', '2026-04-28 14:32:40');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'PHP',
  `payment_status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `refund_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `refund_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `payment_reference`, `attachment`, `provider`, `payment_method`, `amount`, `currency`, `payment_status`, `paid_at`, `refund_amount`, `refund_reason`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'manual', 'manual', 5500.00, 'PHP', 'success', '2026-04-14 01:30:31', 0.00, NULL, '2026-04-13 16:37:21', '2026-04-13 17:30:31'),
(2, 2, NULL, NULL, 'manual', 'manual', 1500.00, 'PHP', 'success', '2026-04-15 10:44:50', 0.00, NULL, '2026-04-15 02:38:09', '2026-04-15 02:44:50'),
(3, 3, NULL, NULL, 'manual', 'manual', 5500.00, 'PHP', 'refunded', '2026-04-25 12:06:51', 0.00, 'Refund processed by admin', '2026-04-16 17:02:25', '2026-04-28 14:37:28'),
(4, 4, NULL, NULL, 'online', 'gcash', 5500.00, 'PHP', 'failed', NULL, 0.00, NULL, '2026-04-25 04:14:28', '2026-04-25 05:59:57'),
(5, 5, NULL, 'proof-1777099460596.jpeg', 'online', 'gcash', 1500.00, 'PHP', 'success', '2026-04-30 22:51:17', 0.00, NULL, '2026-04-25 06:15:08', '2026-04-30 14:51:17'),
(6, 6, NULL, NULL, 'online', 'gcash', 280.00, 'PHP', 'success', '2026-04-29 01:00:03', 0.00, NULL, '2026-04-28 16:50:47', '2026-04-28 17:00:03'),
(7, 7, NULL, NULL, 'online', 'gcash', 1500.00, 'PHP', 'success', '2026-04-29 01:00:01', 0.00, NULL, '2026-04-28 16:58:52', '2026-04-28 17:00:01'),
(8, 8, NULL, NULL, 'manual', 'cash', 420.00, 'PHP', 'success', '2026-04-30 22:50:38', 0.00, NULL, '2026-04-29 15:12:22', '2026-04-30 14:50:38'),
(9, 11, NULL, NULL, 'manual', 'cash', 1.00, 'PHP', 'success', '2026-05-02 08:22:02', 0.00, NULL, '2026-05-02 00:21:04', '2026-05-02 00:22:02'),
(10, 12, NULL, NULL, 'manual', 'cash', 1.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 15:50:49', '2026-05-04 15:50:49'),
(11, 13, NULL, NULL, 'manual', 'cash', 2.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 16:01:36', '2026-05-04 16:01:36'),
(12, 14, NULL, NULL, 'manual', 'cash', 100.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 16:11:00', '2026-05-04 16:11:00'),
(13, 15, NULL, NULL, 'manual', 'cash', 600.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 16:38:50', '2026-05-04 16:38:50'),
(14, 16, NULL, NULL, 'manual', 'cash', 3000.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 16:40:55', '2026-05-04 16:40:55'),
(15, 17, NULL, NULL, 'manual', 'cash', 600.00, 'PHP', 'pending', NULL, 0.00, NULL, '2026-05-04 17:54:33', '2026-05-04 17:54:33');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `event_id`, `rating`, `comment`, `created_at`) VALUES
(1, 6, 2, 5, 'best experience', '2026-05-04 17:52:06'),
(2, 11, 2, 5, 'wow', '2026-05-04 18:01:05');

-- --------------------------------------------------------

--
-- Table structure for table `speakers`
--

CREATE TABLE `speakers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `speakers`
--

INSERT INTO `speakers` (`id`, `name`, `email`, `phone`, `title`, `company`, `bio`, `photo`, `created_at`, `updated_at`) VALUES
(1, 'Marlonskie', 'marlon@gmail.com', NULL, 'Marlon theeeeee Great!', 'Binangkal Company', 'Hello World', NULL, '2026-04-13 16:14:49', '2026-04-25 04:19:28'),
(2, 'Dr. Antonio Ramirez', 'antonio.ramirez@piti.org', NULL, 'Keynote Speaker – Digital Transformation in Southeast Asia', 'Philippine Institute of Technology & Innovation', 'Dr. Antonio Ramirez is a leading expert in digital transformation and smart city initiatives across Southeast Asia. With over 20 years of experience in technology policy, innovation ecosystems, and enterprise modernization, he has advised governments and corporations on sustainable digital strategies. He is a published author, frequent conference speaker, and advocate for inclusive tech-driven growth in the Philippines and beyond.', NULL, '2026-04-15 02:29:04', '2026-04-25 03:12:04'),
(5, 'Kim Andrie Ogdol', 'kimandrie@gmail.com', NULL, 'Wellness Advocate', 'dsjhdfuybe esd', 'sdsds sdersef fefzfrg gfgjxiuhjtuih huhxuyhbrviu', NULL, '2026-04-28 15:33:59', '2026-04-28 15:33:59');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `issue_type` enum('complaint','refund','technical','other') NOT NULL DEFAULT 'other',
  `description` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `assigned_admin_id` int(11) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `booking_id`, `event_id`, `subject`, `issue_type`, `description`, `status`, `assigned_admin_id`, `resolution_notes`, `created_at`, `updated_at`) VALUES
(1, 6, NULL, NULL, 'asdas', 'refund', 'asdas', 'open', NULL, NULL, '2026-05-04 15:03:13', '2026-05-04 15:20:19');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `quantity_available` int(11) NOT NULL,
  `quantity_sold` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `event_id`, `name`, `description`, `price`, `quantity_available`, `quantity_sold`, `is_active`, `created_at`) VALUES
(1, 2, 'Normal', 'bests', 600.00, 199, 1, 1, '2026-05-04 16:26:58'),
(2, 2, 'VIP', 'best best', 1500.00, 48, 2, 1, '2026-05-04 16:27:19'),
(3, 2, 'Student', 'sheesh', 300.00, 20, 0, 1, '2026-05-04 16:38:13');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_types`
--

CREATE TABLE `ticket_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_types`
--

INSERT INTO `ticket_types` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'VIP', '2026-05-04 16:35:49', '2026-05-04 16:35:49'),
(2, 'Normal', '2026-05-04 16:35:49', '2026-05-04 16:35:49'),
(3, 'Early Bird', '2026-05-04 16:35:49', '2026-05-04 16:35:49'),
(4, 'Student', '2026-05-04 16:35:49', '2026-05-04 16:35:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','organizer','user') NOT NULL DEFAULT 'user',
  `status` enum('active','pending','suspended','rejected') NOT NULL DEFAULT 'active',
  `phone` varchar(30) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `phone`, `profile_image`, `email_verified`, `created_at`, `updated_at`) VALUES
(2, 'Lonmar Olot', 'lonmar@gmail.com', '$2b$10$ZDJR0uGhB2ezkFiRiH3pkuAemeUNpalojuEJOQXtkcFP6pQXzySri', 'organizer', 'active', '09876253412', NULL, 0, '2026-04-13 15:32:00', '2026-04-13 16:08:27'),
(5, 'Admin', 'admin@tuloclicks.com', '$2b$10$a1KL2dxm16BFp3wvGkJaqurLUr0umAUgxTPrsuJhQqeGGaNZP/Ixy', 'admin', 'active', '09876543212221222222', NULL, 0, '2026-04-13 16:01:08', '2026-04-28 14:36:14'),
(6, 'RozenCranks Tiuname', 'cranks@gmail.com', '$2b$10$kpTpdtBjT9hp9LwPY0.BRuquQnYQn02UbbEZfI.TJrYk7KfR4NvS.', 'user', 'active', '09987645261', NULL, 0, '2026-04-13 16:30:07', '2026-04-13 16:30:07'),
(7, 'Ericksyon Onyada', 'ericksyon@gmail.com', '$2b$10$deDGWbDloElnAmzldb4reOLUa4WInltZXVN00VXvKQsfrWHLKqwQG', 'user', 'rejected', '09987364526', NULL, 0, '2026-04-14 22:43:15', '2026-04-15 02:07:56'),
(8, 'Jane Doe', 'janedoe@gmail.com', '$2b$10$hPUp4nMu0J9R14MdWrAX9uJoH5vsWENJnHLw4WipE8uBMx4OAgVDu', 'organizer', 'active', '092837465121', NULL, 0, '2026-04-15 02:01:21', '2026-04-15 02:06:56'),
(9, 'Marnol jay Tolo', 'marnoljaytolo@gmail.com', '$2b$10$t1.4wxWU1lC1UphMyue.3.r0HBGLhnjKlc0ELSq8bfKYXqXyVX5PK', 'user', 'active', '08897265431', NULL, 0, '2026-04-15 02:34:42', '2026-05-04 14:06:58'),
(10, 'Kimy Ogbol', 'kimyogs@gmail.com', '$2b$10$oAwKLWp5DtuwgtAXDQxK9.XeXMaw0/glvkWgeN9KjVgbD7WuWgtMy', 'user', 'active', '099243123123', NULL, 0, '2026-04-16 15:00:59', '2026-04-16 15:00:59'),
(11, 'Kim', 'kim@gmail.com', '$2b$10$Ec4KAc05Kn2.Yvib24C8qev6ABSTS1B4Jc0qVQ8LcJ/suS1WkMNR2', 'user', 'active', '09271726121', NULL, 0, '2026-04-28 14:40:07', '2026-04-29 15:06:58'),
(12, 'kimmy', 'kimmy@gmail.com', '$2b$10$HGPS/CLgmuFADLvOkGLFYuELPZq896DLXUuWs8C36N8XQYYjpd/.m', 'user', 'active', '09883748374', NULL, 0, '2026-04-29 15:01:50', '2026-04-29 15:06:58');

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Philippines',
  `postal_code` varchar(20) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `contact_email` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `name`, `address`, `city`, `province`, `country`, `postal_code`, `capacity`, `contact_person`, `contact_phone`, `contact_email`, `created_at`, `updated_at`) VALUES
(1, 'SM Seaside Cebu Arena', 'South Road Properties', 'Cebu City', 'Cebu', 'Philippines', '6000', 16000, 'Venue Office', '09285143302', 'smseaside@example.com', '2026-04-13 04:07:53', '2026-04-13 04:07:53'),
(2, 'Waterfront Cebu City Hotel & Casino', 'Salinas Drive, Lahug', 'Cebu City', 'Cebu', 'Philippines', '6000', 1000, 'Venue Office', '+63 32 232 6888', 'waterfront@example.com', '2026-04-13 04:07:53', '2026-04-13 04:07:53'),
(3, 'Cebu City Convention Center', 'North Reclamation Area, Cebu City, Cebu', 'Cebu City', 'Cebu City', 'Philippines', '6000', 5000, 'Maria Santos', '+63 32 123 4567', 'info@cebucityconvention.ph', '2026-04-15 02:23:06', '2026-04-25 05:38:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_logs_user` (`user_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `fk_bookings_user` (`user_id`),
  ADD KEY `fk_bookings_event` (`event_id`);

--
-- Indexes for table `booking_items`
--
ALTER TABLE `booking_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_items_booking` (`booking_id`),
  ADD KEY `fk_booking_items_ticket_type` (`ticket_type_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_events_organizer` (`organizer_id`),
  ADD KEY `fk_events_category` (`category_id`),
  ADD KEY `fk_events_venue` (`venue_id`),
  ADD KEY `fk_events_approved_by` (`approved_by`),
  ADD KEY `fk_events_rejected_by` (`rejected_by`);

--
-- Indexes for table `event_categories`
--
ALTER TABLE `event_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `event_speakers`
--
ALTER TABLE `event_speakers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_event_speaker` (`event_id`,`speaker_id`),
  ADD KEY `fk_event_speakers_speaker` (`speaker_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `fk_organizer_profile_admin` (`approved_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_reference` (`payment_reference`),
  ADD KEY `fk_payments_booking` (`booking_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_review_user_event` (`user_id`,`event_id`),
  ADD KEY `fk_reviews_event` (`event_id`);

--
-- Indexes for table `speakers`
--
ALTER TABLE `speakers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_support_user` (`user_id`),
  ADD KEY `fk_support_booking` (`booking_id`),
  ADD KEY `fk_support_event` (`event_id`),
  ADD KEY `fk_support_admin` (`assigned_admin_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `ticket_types`
--
ALTER TABLE `ticket_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `booking_items`
--
ALTER TABLE `booking_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `event_categories`
--
ALTER TABLE `event_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `event_speakers`
--
ALTER TABLE `event_speakers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `speakers`
--
ALTER TABLE `speakers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ticket_types`
--
ALTER TABLE `ticket_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `venues`
--
ALTER TABLE `venues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `booking_items`
--
ALTER TABLE `booking_items`
  ADD CONSTRAINT `fk_booking_items_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_booking_items_ticket_type` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_events_category` FOREIGN KEY (`category_id`) REFERENCES `event_categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_events_rejected_by` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_events_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `event_speakers`
--
ALTER TABLE `event_speakers`
  ADD CONSTRAINT `fk_event_speakers_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_event_speakers_speaker` FOREIGN KEY (`speaker_id`) REFERENCES `speakers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD CONSTRAINT `fk_organizer_profile_admin` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_organizer_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `fk_support_admin` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_support_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_support_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_support_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
