-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 14 سبتمبر 2026 الساعة 20:37
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `replicon_db`
--

-- --------------------------------------------------------

--
-- بنية الجدول `agents`
--

CREATE TABLE `agents` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `agent_type` enum('snapshot','log_reader','distribution') NOT NULL,
  `status` enum('running','stopped','failed','unknown') NOT NULL DEFAULT 'unknown',
  `last_run_at` datetime DEFAULT NULL,
  `last_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `alerts`
--

CREATE TABLE `alerts` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `severity` enum('critical','warning','info') NOT NULL,
  `title` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `status` enum('active','in_progress','resolved') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `deployments`
--

CREATE TABLE `deployments` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `status` enum('preparation','in_progress','validated','suspended') NOT NULL DEFAULT 'preparation',
  `current_step` varchar(150) DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `deployments`
--

INSERT INTO `deployments` (`id`, `site_id`, `status`, `current_step`, `started_at`, `completed_at`) VALUES
(1, 1, 'preparation', 'Préparation non vérifiée', '2026-09-14 09:02:54', NULL),
(2, 1, 'preparation', 'Préparation non vérifiée', '2026-09-14 11:00:52', NULL),
(3, 4, 'preparation', 'Préparation non vérifiée', '2026-09-14 12:03:16', NULL),
(4, 1, 'preparation', 'Préparation non vérifiée', '2026-09-14 12:04:40', NULL),
(5, 4, 'preparation', 'Préparation non vérifiée', '2026-09-14 13:31:39', NULL),
(6, 12, 'preparation', 'Préparation non vérifiée', '2026-09-14 13:36:34', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `reports`
--

CREATE TABLE `reports` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `report_type` varchar(80) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `generated_by` int(10) UNSIGNED DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `sites`
--

CREATE TABLE `sites` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `publisher_server` varchar(150) NOT NULL,
  `subscriber_server` varchar(150) NOT NULL,
  `reporting_database` varchar(100) NOT NULL DEFAULT 'FactoryDW',
  `status` enum('running','warning','incident','unknown') NOT NULL DEFAULT 'unknown',
  `latency_seconds` decimal(10,2) DEFAULT NULL,
  `pending_commands` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_sync_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `sites`
--

INSERT INTO `sites` (`id`, `site_code`, `country`, `publisher_server`, `subscriber_server`, `reporting_database`, `status`, `latency_seconds`, `pending_commands`, `last_sync_at`, `created_at`) VALUES
(1, 'TEST01', 'site de test', 'TEST01MESSQL01', 'TEST01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 07:16:15'),
(4, 'FR01', 'France', 'FR01MESSQL01', 'FR01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:01:24'),
(5, 'FR02', 'France', 'FR02MESSQL01', 'TEST02RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:02:53'),
(6, 'FR03', 'France', 'FR03MESSQL01', 'TEST03RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:05:40'),
(7, 'US01', 'États-Unis', 'US01MESSQL01', 'US01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:09:58'),
(8, 'US02', 'États-Unis', 'US02MESSQL01', 'US02RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:11:13'),
(9, 'US03', 'États-Unis', 'US03MESSQL01', 'US03RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 12:12:22'),
(12, 'BR01', 'Bresil', 'BR01MESSQL01', 'BR01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 13:35:01'),
(13, 'BR02', 'Bresil', 'BR02MESSQL01', 'BR02RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 13:38:30'),
(14, 'MA01', 'Maroc', 'MA01MESSQL01', 'MA01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 17:58:14'),
(15, 'ES01', 'Espagne', 'ES01MESSQL01', 'ES01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:01:43'),
(16, 'PT01', 'Portugal', 'PT01MESSQL01', 'PT01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:03:39'),
(17, 'DE01', 'Allemagne', 'DE01MESSQL01', 'DE01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:04:59'),
(18, 'IT01', 'Italie', 'IT01MESSQL01', 'IT01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:06:14'),
(19, 'UK01', 'Royame-Uni', 'UK01MESSQL01', 'UK01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:07:41'),
(20, 'CA01', 'Canada', 'CA01MESSQL01', 'CA01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:08:43'),
(21, 'JP01', 'Japon', 'JP01MESSQL01', 'JP01RPT01', 'FactoryDW', 'unknown', NULL, 0, NULL, '2026-09-14 18:09:42');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('DBA','REPORTING') NOT NULL DEFAULT 'REPORTING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_agent_per_site` (`site_id`,`agent_type`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alerts_site` (`site_id`);

--
-- Indexes for table `deployments`
--
ALTER TABLE `deployments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_deployments_site` (`site_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reports_user` (`generated_by`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_code` (`site_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deployments`
--
ALTER TABLE `deployments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `fk_agents_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- قيود الجداول `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `fk_alerts_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- قيود الجداول `deployments`
--
ALTER TABLE `deployments`
  ADD CONSTRAINT `fk_deployments_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- قيود الجداول `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_user` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
