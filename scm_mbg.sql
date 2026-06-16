-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2026 at 04:48 PM
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
-- Database: `scm_mbg`
--

-- --------------------------------------------------------

--
-- Table structure for table `cashflow_transactions`
--

CREATE TABLE `cashflow_transactions` (
  `id` varchar(36) NOT NULL,
  `kitchen_id` varchar(36) DEFAULT NULL COMMENT 'NULL = transaksi level korporat',
  `type` enum('in','out') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(500) NOT NULL,
  `category` enum('Pendapatan Distribusi','Pembelian Bahan Baku','Biaya Operasional','Gaji Karyawan','Maintenance','Lainnya') NOT NULL DEFAULT 'Lainnya',
  `reference_id` varchar(36) DEFAULT NULL COMMENT 'Referensi ke finance_requests.id atau salary_payments.id',
  `transaction_date` date NOT NULL,
  `recorded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cashflow_transactions`
--

INSERT INTO `cashflow_transactions` (`id`, `kitchen_id`, `type`, `amount`, `description`, `category`, `reference_id`, `transaction_date`, `recorded_by`, `created_at`, `updated_at`) VALUES
('1abd1de5-0afb-4cb4-b914-d260a013c2e9', 'K04', 'in', 11200000.00, 'Pendapatan distribusi Region Yogyakarta', 'Pendapatan Distribusi', NULL, '2026-06-11', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('1aff8768-5334-49c6-989a-1dddaa122369', 'K03', 'in', 12800000.00, 'Pendapatan distribusi Region Surabaya', 'Pendapatan Distribusi', NULL, '2026-06-10', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('362347d8-276b-4407-b43a-6947da6b7e66', 'K05', 'in', 3800000.00, 'Pendapatan pesanan khusus Semarang', 'Pendapatan Distribusi', NULL, '2026-06-13', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('50eaa16c-4c24-4f60-9b14-3d37d0903aca', 'K02', 'out', 7200000.00, 'Pembelian bahan baku bulanan Bandung', 'Pembelian Bahan Baku', NULL, '2026-06-09', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('680712ba-414f-4197-a0b3-4c00f35c8452', 'K01', 'out', 5500000.00, 'Gaji Karyawan: Sari Indah (Ahli Gizi) — Dapur Jakarta Pusat', 'Gaji Karyawan', NULL, '2026-06-16', NULL, '2026-06-16 14:11:47', '2026-06-16 14:11:47'),
('705c36f1-4ae1-435b-9ad0-a7ad116eedf0', 'K04', 'out', 5400000.00, 'Gaji karyawan Yogyakarta bulan ini', 'Gaji Karyawan', NULL, '2026-06-11', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('72434462-f739-4076-894a-013ffd7faf4c', 'K01', 'out', 9800000.00, 'Pembelian bahan baku bulanan Jakarta', 'Pembelian Bahan Baku', NULL, '2026-06-08', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('7ac14f5a-fcfd-4d2f-8806-c8bed3c6eb3a', 'K02', 'in', 15500000.00, 'Pendapatan distribusi Region Bandung', 'Pendapatan Distribusi', NULL, '2026-06-09', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('7b899f05-ebc5-4246-90f3-4e1159aea172', 'K06', 'out', 8500000.00, 'Perbaikan besar peralatan Cimahi', 'Maintenance', NULL, '2026-06-10', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('802b28e5-08c6-4a79-8866-6cd654d81763', 'K01', 'in', 18000000.00, 'Pendapatan distribusi Region Jakarta', 'Pendapatan Distribusi', NULL, '2026-06-08', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8ff37dc0-3061-4eb4-b988-d9a20f95d6a5', 'K05', 'out', 4800000.00, 'Pembelian bahan baku Semarang', 'Pembelian Bahan Baku', NULL, '2026-06-12', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('adeb11a7-64f5-42c0-8d43-748791b70cd8', 'K01', 'in', 5200000.00, 'Pendapatan catering event Jakarta', 'Pendapatan Distribusi', NULL, '2026-06-11', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ce318ca9-5d43-4e45-9f42-b634d4e1b478', 'K03', 'out', 2300000.00, 'Gaji karyawan Surabaya bulan ini', 'Gaji Karyawan', NULL, '2026-06-12', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e21e10bc-08de-44e5-a8c8-206d17ee9983', 'K01', 'out', 3200000.00, 'Maintenance peralatan dapur Jakarta', 'Maintenance', NULL, '2026-06-13', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e7145393-bea1-4b45-9e27-7a4be6f7f96e', 'K05', 'in', 10500000.00, 'Pendapatan distribusi Region Semarang', 'Pendapatan Distribusi', NULL, '2026-06-12', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('feef3345-cd06-4154-b6a1-c50bb727cfc3', 'K03', 'out', 6500000.00, 'Biaya operasional dan maintenance Surabaya', 'Biaya Operasional', NULL, '2026-06-10', '4041e187-d1a9-4686-965d-935d8ecf7a2a', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_items`
--

CREATE TABLE `delivery_items` (
  `id` varchar(36) NOT NULL,
  `logistics_id` varchar(36) NOT NULL,
  `menu_id` varchar(36) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Jumlah porsi',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_items`
--

INSERT INTO `delivery_items` (`id`, `logistics_id`, `menu_id`, `quantity`, `created_at`, `updated_at`) VALUES
('174198a8-57ad-4992-94cc-315d7112375f', 'bafb751d-bbf9-456b-b969-0f5e4dc1d3e1', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 114, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('33071672-773b-403b-b221-bcc548801196', '61ccdd3a-53cd-4ed4-af50-fb04b2bf6a5d', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 74, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3c1550ca-fc17-4adb-ac25-2c0e3bbfde32', '5dba6e8f-3cef-4d0a-9786-8890f0584648', '34f3b118-ff89-43f9-b963-c6deb46286c3', 61, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('40cfe008-34f8-4d52-8a04-420de24f6bab', '7b433fae-e236-4a8b-a8a2-c1b5a1ed47cb', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 93, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('737d091b-272d-4c70-b8ca-d2ad01caa0ef', '9a10d7ac-a21b-4df4-af52-b003cc0b6324', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 80, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('758b74b0-83ea-49a7-a486-6dfede13c610', '61ccdd3a-53cd-4ed4-af50-fb04b2bf6a5d', '34f3b118-ff89-43f9-b963-c6deb46286c3', 111, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('84ca923b-e8f3-4e65-bd9d-979bf93e40d0', '585982cb-b3bf-465b-9ad6-a42ef7419181', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 147, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9555a584-173b-42bf-9a1b-d0ab706a6398', '5dba6e8f-3cef-4d0a-9786-8890f0584648', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 107, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a22b3330-4578-4795-8487-c0aa45edc9c9', '7b433fae-e236-4a8b-a8a2-c1b5a1ed47cb', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 101, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a44d7b5e-bcf4-4071-9316-ec707724e6a4', 'bafb751d-bbf9-456b-b969-0f5e4dc1d3e1', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 116, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('be60e3f0-4ca2-435e-91fe-019a5ddca47a', '585982cb-b3bf-465b-9ad6-a42ef7419181', '8f2a1f55-391c-4e51-912b-bc6893952b50', 142, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c7492f10-99b4-454d-8c50-ce118d9e1f1d', '35c6ecd4-7966-4c62-9c00-8f5dbea51844', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 87, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d16d9e7c-6899-477b-b8e7-330b28609046', '9a10d7ac-a21b-4df4-af52-b003cc0b6324', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 50, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e6178659-e9c3-4a80-8b11-829b89165bbd', '35c6ecd4-7966-4c62-9c00-8f5dbea51844', '8f2a1f55-391c-4e51-912b-bc6893952b50', 111, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `kitchen_id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `role` enum('Ahli Gizi','Driver','Juru Masak') NOT NULL,
  `salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive','on_leave','terminated') NOT NULL DEFAULT 'active',
  `paid_this_month` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Reset ke false setiap awal bulan via job scheduler',
  `join_date` date DEFAULT NULL,
  `terminate_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `kitchen_id`, `name`, `email`, `phone`, `role`, `salary`, `status`, `paid_this_month`, `join_date`, `terminate_date`, `created_at`, `updated_at`) VALUES
('21641f72-f0d0-438d-89e8-209b24989670', 'K06', 'Mega Putri', 'mega@mbg.id', NULL, 'Ahli Gizi', 5500000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('277b9a1d-9192-4a97-a298-5511964c2bec', 'K04', 'Wahyu Hidayat', 'wahyu@mbg.id', NULL, 'Juru Masak', 4800000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3ccfb17f-c731-4f1a-b49e-22355475c8cc', 'K05', 'Fitri Handayani', 'fitri@mbg.id', NULL, 'Juru Masak', 4800000.00, 'active', 1, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('4e876cb9-e399-493d-8c82-8fd45d9a8ccf', 'K01', 'Dewi Kusuma', 'dewi@mbg.id', NULL, 'Juru Masak', 4800000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5ea31417-3109-44ad-a65b-dca27842c94a', 'K06', 'Joko Susilo', 'joko@mbg.id', NULL, 'Juru Masak', 4800000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('7579a962-c3fe-4dae-8cef-07f1535636d0', 'K03', 'Agus Pratama', 'agus@mbg.id', NULL, 'Juru Masak', 4800000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('787361e1-5229-4403-9a40-44f6e5f6f510', 'K02', 'Dani Wijaya', 'dani@mbg.id', NULL, 'Driver', 4200000.00, 'terminated', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('83e3e439-d758-48ad-b0aa-23b10827afa4', 'K02', 'Asep Nugraha', 'asep@mbg.id', NULL, 'Juru Masak', 4800000.00, 'on_leave', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8829c29d-e550-46ac-b762-6968783172d0', 'K03', 'Lina Suryani', 'lina@mbg.id', NULL, 'Driver', 4200000.00, 'active', 1, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('921b089e-2f10-434a-b5ae-5e5c519750fc', 'K02', 'Rina Marlina', 'rina@mbg.id', NULL, 'Ahli Gizi', 5500000.00, 'active', 1, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('94079910-4097-4f04-a567-f49f79c59047', 'K05', 'Hendra Kurnia', 'hendra@mbg.id', NULL, 'Driver', 4200000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a012a5b6-e79e-4596-b5ac-0f796f558d16', 'K04', 'Nurul Aisyah', 'nurul@mbg.id', NULL, 'Ahli Gizi', 5500000.00, 'active', 0, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b896d395-304d-4c28-826e-70b4b7698d6d', 'K01', 'Budi Santoso', 'budi@mbg.id', NULL, 'Juru Masak', 4200000.00, 'active', 1, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('fbb2ab32-80c8-4f9a-8a02-7e36dd371440', 'K01', 'Hapis', 'hapis@mbg.id', NULL, 'Ahli Gizi', 3000000.00, 'active', 0, NULL, NULL, '2026-06-16 14:16:11', '2026-06-16 14:16:11'),
('fd2c5ffd-7712-43a5-a4e3-4952185bd146', 'K01', 'Sari Indah', 'sari@mbg.id', NULL, 'Ahli Gizi', 5500000.00, 'active', 1, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `finance_requests`
--

CREATE TABLE `finance_requests` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `kitchen_id` varchar(36) NOT NULL,
  `requested_by` varchar(36) NOT NULL COMMENT 'FK ke users — admin yang mengajukan request',
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL COMMENT 'Keperluan / tujuan pengajuan dana',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ai_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Hasil analisis dari Gemini AI' CHECK (json_valid(`ai_notes`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_requests`
--

INSERT INTO `finance_requests` (`id`, `kitchen_id`, `requested_by`, `amount`, `description`, `status`, `reviewed_by`, `approved_at`, `review_notes`, `created_at`, `updated_at`, `ai_notes`) VALUES
('1e3ec0fb-61df-4646-9390-47a56065141e', 'K03', '4041e187-d1a9-4686-965d-935d8ecf7a2a', 3200000.00, 'Pengadaan alat pengemas baru', 'approved', NULL, '2026-06-11 08:24:02', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', NULL),
('2a158551-0392-4554-a3a5-ea922a15f88d', 'K04', '5211f8d1-61d6-48ee-a132-14fcf77241d4', 1500000.00, 'Pembelian bahan bumbu rempah bulanan', 'approved', NULL, '2026-06-11 08:24:02', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', NULL),
('689b4b2f-83b5-4899-806c-fa7ce7a67ad7', 'K01', '4041e187-d1a9-4686-965d-935d8ecf7a2a', 2500000.00, 'Pembelian bahan baku darurat (beras & minyak)', 'pending', NULL, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', '{\"score\":5,\"reason\":\"Nominal dalam kisaran menengah. Mengandung indikasi kebutuhan darurat/mendesak. Termasuk kategori pengeluaran rutin. Dapur: Dapur Jakarta Pusat.\"}'),
('70f3395b-10d5-442d-809a-d18ce80f9f77', 'K05', '4041e187-d1a9-4686-965d-935d8ecf7a2a', 4200000.00, 'Renovasi dapur dan perbaikan ventilasi', 'rejected', NULL, '2026-06-16 14:08:48', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', '{\"score\":7,\"reason\":\"Nominal dalam kisaran menengah. Mengandung indikasi kebutuhan darurat/mendesak. Mencakup item bernilai tinggi yang perlu verifikasi. Dapur: Dapur Semarang.\"}'),
('83e6b424-5f09-4da9-bdd3-6bf8f76f677d', 'K02', '4041e187-d1a9-4686-965d-935d8ecf7a2a', 1800000.00, 'Perbaikan kompor dan peralatan masak', 'approved', NULL, '2026-06-16 14:08:45', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', '{\"score\":3,\"reason\":\"Nominal relatif kecil dan wajar. Dapur: Dapur Bandung.\"}'),
('ff712420-fa44-40b8-a1c7-6e74a45594e7', 'K06', '5211f8d1-61d6-48ee-a132-14fcf77241d4', 8500000.00, 'Perbaikan peralatan dapur besar (oven, steamer)', 'rejected', NULL, NULL, NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kitchens`
--

CREATE TABLE `kitchens` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4 — contoh: K01 di sistem lama',
  `sppg_id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL COMMENT 'Nama dapur, misal: Dapur Jakarta Pusat',
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL COMMENT 'Wilayah distribusi',
  `capacity` int(10) UNSIGNED DEFAULT NULL COMMENT 'Kapasitas produksi harian (porsi)',
  `status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kitchens`
--

INSERT INTO `kitchens` (`id`, `sppg_id`, `name`, `city`, `address`, `region`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
('K01', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Jakarta Pusat', 'Jakarta', NULL, 'DKI Jakarta', 500, 'active', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('K02', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Bandung', 'Bandung', NULL, 'Jawa Barat', 500, 'active', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('K03', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Surabaya', 'Surabaya', NULL, 'Jawa Timur', 400, 'active', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('K04', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Yogyakarta', 'Yogyakarta', NULL, 'DIY', 400, 'active', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('K05', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Semarang', 'Semarang', NULL, 'Jawa Tengah', 400, 'active', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('K06', 'dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'Dapur Cimahi', 'Cimahi', NULL, 'Jawa Barat', 500, 'maintenance', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations`
--

CREATE TABLE `knex_migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knex_migrations`
--

INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
(1, '20260519000001_create_all_tables.ts', 1, '2026-06-09 04:57:18'),
(2, '20260519041226_add_ai_notes_to_finance.ts', 1, '2026-06-09 04:57:18'),
(3, '20260609000001_drop_vendor_approvals.ts', 1, '2026-06-09 04:57:18'),
(4, '20260611000001_add_user_role_enum.ts', 2, '2026-06-11 08:23:15');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) UNSIGNED NOT NULL,
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knex_migrations_lock`
--

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
(1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `logistics`
--

CREATE TABLE `logistics` (
  `id` varchar(36) NOT NULL,
  `kitchen_id` varchar(36) NOT NULL,
  `fleet_code` varchar(20) NOT NULL COMMENT 'Kode armada, misal: JKT-A01',
  `driver_name` varchar(150) NOT NULL,
  `driver_phone` varchar(30) DEFAULT NULL,
  `route` varchar(255) NOT NULL COMMENT 'Deskripsi rute: Asal → Tujuan',
  `status` enum('Loading','On Route','Delivered','Delayed','Cancelled','Idle') NOT NULL DEFAULT 'Idle',
  `departure_at` timestamp NULL DEFAULT NULL,
  `estimated_arrival_at` timestamp NULL DEFAULT NULL,
  `actual_arrival_at` timestamp NULL DEFAULT NULL,
  `load_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Persentase muatan 0–100',
  `vehicle_lat` decimal(10,7) DEFAULT NULL COMMENT 'Latitude GPS terakhir',
  `vehicle_lon` decimal(10,7) DEFAULT NULL COMMENT 'Longitude GPS terakhir',
  `battery_level` int(10) UNSIGNED DEFAULT NULL COMMENT 'Baterai tracker 0–100%',
  `last_gps_update` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logistics`
--

INSERT INTO `logistics` (`id`, `kitchen_id`, `fleet_code`, `driver_name`, `driver_phone`, `route`, `status`, `departure_at`, `estimated_arrival_at`, `actual_arrival_at`, `load_percentage`, `vehicle_lat`, `vehicle_lon`, `battery_level`, `last_gps_update`, `created_at`, `updated_at`) VALUES
('2cdde08c-227e-4a80-bc4b-dcad3610fd12', 'K05', 'SMG-E02', 'Hendra Kurnia', '081300006666', 'Semarang → Kudus', 'Idle', NULL, NULL, NULL, 0.00, -6.9932000, 110.4203000, 90, '2026-06-11 08:06:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('35c6ecd4-7966-4c62-9c00-8f5dbea51844', 'K01', 'JKT-A01', 'Budi Santoso', '081300001111', 'Jakarta → Depok', 'On Route', '2026-06-11 06:24:02', '2026-06-11 09:24:02', NULL, 95.00, -6.2088000, 106.8456000, 82, '2026-06-11 08:22:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('585982cb-b3bf-465b-9ad6-a42ef7419181', 'K02', 'BDG-B03', 'Eko Prasetyo', '081300007777', 'Bandung → Garut', 'On Route', '2026-06-11 05:24:02', '2026-06-11 09:54:02', NULL, 92.00, -7.0500000, 107.7500000, 55, '2026-06-11 08:21:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5dba6e8f-3cef-4d0a-9786-8890f0584648', 'K03', 'SBY-C01', 'Anton Setiawan', '081300003333', 'Surabaya → Malang', 'Delayed', '2026-06-11 04:24:02', '2026-06-11 10:24:02', NULL, 88.00, -7.2575000, 112.7521000, 45, '2026-06-11 08:23:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('61ccdd3a-53cd-4ed4-af50-fb04b2bf6a5d', 'K01', 'JKT-A03', 'Rudi Hartono', '081300004444', 'Jakarta → Bekasi', 'Loading', NULL, '2026-06-11 11:24:02', NULL, 60.00, -6.2350000, 106.9900000, 12, '2026-06-11 06:24:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('7b433fae-e236-4a8b-a8a2-c1b5a1ed47cb', 'K04', 'YGY-D01', 'Siti Rahayu', '081300005555', 'Yogyakarta → Klaten', 'On Route', '2026-06-11 06:54:02', '2026-06-11 08:54:02', NULL, 100.00, -7.7972000, 110.3688000, 73, '2026-06-11 08:23:32', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9a10d7ac-a21b-4df4-af52-b003cc0b6324', 'K02', 'BDG-B02', 'Dani Wijaya', '081300002222', 'Bandung → Cimahi', 'Delivered', '2026-06-11 03:24:02', '2026-06-11 05:24:02', '2026-06-11 05:54:02', 100.00, -6.9175000, 107.6191000, 61, '2026-06-11 08:19:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bafb751d-bbf9-456b-b969-0f5e4dc1d3e1', 'K04', 'YGY-D02', 'Maya Sari', '081300008888', 'Yogyakarta → Solo', 'Delivered', '2026-06-11 02:24:02', '2026-06-11 04:24:02', '2026-06-11 04:54:02', 100.00, -7.5755000, 110.8243000, 38, '2026-06-11 08:14:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` enum('Nasi','Mie','Lauk','Sayuran','Sup','Minuman','Lainnya') NOT NULL DEFAULT 'Lainnya',
  `cost_per_portion` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Harga bahan baku per porsi',
  `sell_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `name`, `category`, `cost_per_portion`, `sell_price`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
('1f33b559-be98-48c8-bce3-0762ede0cb2a', 'Nasi Kuning', 'Nasi', 7200.00, 15000.00, 1, 'Nasi kuning dengan lauk ayam suwir dan sambal', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('34f3b118-ff89-43f9-b963-c6deb46286c3', 'Mie Goreng Jawa', 'Mie', 6500.00, 14000.00, 1, 'Mie goreng dengan bumbu Jawa tradisional', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8f2a1f55-391c-4e51-912b-bc6893952b50', 'Nasi Goreng Spesial', 'Nasi', 8500.00, 18000.00, 1, 'Nasi goreng dengan bumbu rahasia dan topping lengkap', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 'Soto Ayam Lamongan', 'Sup', 8000.00, 16000.00, 1, 'Soto ayam kuah bening ala Lamongan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 'Ayam Bakar Madu', 'Lauk', 12000.00, 25000.00, 1, 'Ayam bakar dengan olesan madu dan bumbu kecap', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bb477b25-af51-4ff6-9b33-b269b8e49c15', 'Gado-Gado Jakarta', 'Sayuran', 9000.00, 18000.00, 1, 'Gado-gado khas Jakarta dengan bumbu kacang', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `productions`
--

CREATE TABLE `productions` (
  `id` varchar(36) NOT NULL,
  `kitchen_id` varchar(36) NOT NULL,
  `production_date` date NOT NULL,
  `shift` enum('Pagi','Siang','Malam') NOT NULL DEFAULT 'Pagi',
  `target_portions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `actual_portions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('Planned','In Progress','Completed','Cancelled') NOT NULL DEFAULT 'Planned',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productions`
--

INSERT INTO `productions` (`id`, `kitchen_id`, `production_date`, `shift`, `target_portions`, `actual_portions`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('037a912e-91d9-4c99-ac60-23004ee1f2b4', 'K02', '2026-06-12', 'Pagi', 500, 485, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('0fa6068b-b99d-43aa-a995-4a587a6aa91a', 'K04', '2026-06-11', 'Pagi', 400, 415, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('11e15751-1a2b-48d6-8bc8-f17ee3605ca9', 'K01', '2026-06-11', 'Pagi', 500, 475, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('144e9c83-d057-4d88-b9f2-2c7d9ab201e4', 'K02', '2026-06-08', 'Pagi', 500, 490, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('1fb2d9fd-c2be-41a8-90a3-e2b875584195', 'K01', '2026-06-10', 'Pagi', 500, 490, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('266de1df-bd44-4fbe-86a1-34c762198004', 'K04', '2026-06-10', 'Pagi', 400, 420, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('294701f0-07ee-4ff6-92ad-55219bafc17a', 'K03', '2026-06-13', 'Siang', 400, 380, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3b1bf9bf-4aa1-4718-8900-1d4d145b943a', 'K06', '2026-06-09', 'Pagi', 500, 210, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3bdd4186-5b91-45ec-accf-e727a4a9aad3', 'K01', '2026-06-13', 'Pagi', 500, 500, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5210c1cd-df22-4597-8571-8d4cd1a33a48', 'K01', '2026-06-08', 'Pagi', 500, 480, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('53535dcc-94c6-4ad6-9893-29c89adacdf9', 'K01', '2026-06-12', 'Pagi', 500, 495, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5aa76c7e-66cd-47ea-83ea-c008412dc4d7', 'K04', '2026-06-13', 'Pagi', 400, 425, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('65ac562b-53f5-4dca-8e47-4a1f8c0615ff', 'K05', '2026-06-11', 'Siang', 400, 375, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('6e810913-346d-494e-9cea-220b1639d1f1', 'K05', '2026-06-09', 'Siang', 400, 380, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('733386c1-10c0-4bcb-b760-442cbf801cf9', 'K03', '2026-06-08', 'Siang', 400, 320, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('783c6e77-f5c2-4b60-b0bd-7cce05a053fb', 'K04', '2026-06-09', 'Pagi', 400, 400, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8d4ef036-3004-45fd-a7f8-c67a698b0473', 'K06', '2026-06-14', 'Pagi', 500, 180, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9867af02-d090-4f04-8213-296806efbadd', 'K06', '2026-06-11', 'Pagi', 500, 230, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9da30dfa-ed4e-4fc2-ad51-03c53e429209', 'K01', '2026-06-09', 'Pagi', 500, 485, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9f8785dc-dcfd-4586-bf92-3fa3963441f3', 'K04', '2026-06-14', 'Pagi', 400, 380, 'In Progress', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a2925666-1fc3-40ad-b221-c5174455af9a', 'K03', '2026-06-12', 'Siang', 400, 370, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('aa861c99-5efe-4e7a-9c94-41183e1cc6fa', 'K02', '2026-06-10', 'Pagi', 500, 480, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('abe3464b-1d7d-4df4-a66f-a05354115b44', 'K06', '2026-06-10', 'Pagi', 500, 220, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('adf7682b-02b9-408f-9344-226d8ff652dd', 'K05', '2026-06-12', 'Siang', 400, 385, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('af41c9b7-38db-4273-bd33-19f0a0d7a3da', 'K03', '2026-06-09', 'Siang', 400, 350, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b3b157d9-402e-414c-9424-a59494be4439', 'K06', '2026-06-13', 'Pagi', 500, 250, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b5de7f14-0012-4f7f-b719-dbb8545671c1', 'K02', '2026-06-09', 'Pagi', 500, 495, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('be1a96e9-0ec3-4254-9489-a598356dd22c', 'K04', '2026-06-12', 'Pagi', 400, 410, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c0dd0ecf-41a6-44d3-8d58-9ec48f970dea', 'K02', '2026-06-14', 'Pagi', 500, 460, 'In Progress', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c79346c2-70e2-444f-8627-4f921a9d027e', 'K03', '2026-06-11', 'Siang', 400, 360, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c944f769-cc5a-4bad-8fc4-3a5b92bd57a1', 'K02', '2026-06-11', 'Pagi', 500, 500, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d653c24e-acdb-4f7f-a328-b2dce695bba1', 'K02', '2026-06-13', 'Pagi', 500, 490, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d818a6d7-231b-4102-9ef1-e557c8afc765', 'K05', '2026-06-13', 'Siang', 400, 395, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('dd55b592-351b-4155-9fdf-5becfde7168c', 'K03', '2026-06-10', 'Siang', 400, 340, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e152a086-c3a3-4838-bce6-b2658e2bb473', 'K05', '2026-06-14', 'Siang', 400, 350, 'In Progress', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e2d80e20-8ff2-4ba8-8667-32b9cb2a2be5', 'K04', '2026-06-08', 'Pagi', 400, 410, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e624076b-5db2-4df9-8304-7ceb7fe61c2e', 'K03', '2026-06-14', 'Siang', 400, 300, 'In Progress', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e85faa6a-8288-400d-be0d-1eda1820bea1', 'K01', '2026-06-14', 'Pagi', 500, 450, 'In Progress', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f2e52d65-39cc-42e8-9884-6b0b3b62857b', 'K06', '2026-06-08', 'Pagi', 500, 200, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f4a47376-a622-44ce-a774-83fdc7ec4e51', 'K06', '2026-06-12', 'Pagi', 500, 240, 'In Progress', 'Efisiensi rendah — gangguan peralatan', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f72e0c42-ea16-4c3f-9cec-19e9e3c4daca', 'K05', '2026-06-10', 'Siang', 400, 390, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('fd5bb27a-26c2-4128-8ec7-fd2de3c6b50a', 'K05', '2026-06-08', 'Siang', 400, 370, 'Completed', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `production_details`
--

CREATE TABLE `production_details` (
  `id` varchar(36) NOT NULL,
  `production_id` varchar(36) NOT NULL,
  `menu_id` varchar(36) NOT NULL,
  `target_portions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `actual_portions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_details`
--

INSERT INTO `production_details` (`id`, `production_id`, `menu_id`, `target_portions`, `actual_portions`, `created_at`, `updated_at`) VALUES
('006ca80b-5bb0-431d-9d5d-3120e0a330e1', 'd818a6d7-231b-4102-9ef1-e557c8afc765', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 131, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('01ce83ca-0fe9-4e78-9122-a80325b10e50', 'd818a6d7-231b-4102-9ef1-e557c8afc765', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 133, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('04a16bbc-298e-4746-9b75-481adffd6f8c', 'e2d80e20-8ff2-4ba8-8667-32b9cb2a2be5', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 136, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('0501041c-02eb-4d37-b172-ced2d359b217', 'e624076b-5db2-4df9-8304-7ceb7fe61c2e', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 100, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('0c2c58b2-012b-4878-880b-92925bf5e73d', '3bdd4186-5b91-45ec-accf-e727a4a9aad3', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 166, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('0c3a1820-5389-48aa-a87b-ed3d5480a44d', '65ac562b-53f5-4dca-8e47-4a1f8c0615ff', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 125, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('0d6af1c7-0b75-4e1c-9093-218b941e0cd2', '0fa6068b-b99d-43aa-a995-4a587a6aa91a', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 138, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('17d1fac6-49dd-4526-87d5-27a204bd639d', '733386c1-10c0-4bcb-b760-442cbf801cf9', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 106, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('1d039f50-f796-43a1-9db6-2b97712fa8b8', 'd653c24e-acdb-4f7f-a328-b2dce695bba1', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('1ddcf15f-ea8d-45e8-99da-04e026d7166e', 'adf7682b-02b9-408f-9344-226d8ff652dd', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 129, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('230e5ca5-2b86-4e77-99ae-5ac845bcb4e4', '9867af02-d090-4f04-8213-296806efbadd', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 76, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2321fd14-c674-47de-afe0-3709f61965e6', '144e9c83-d057-4d88-b9f2-2c7d9ab201e4', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('24922702-390d-4b18-b81a-ef961f2a00f8', '5aa76c7e-66cd-47ea-83ea-c008412dc4d7', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 141, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('259903a5-ec4b-4e06-924c-89f92b955109', '53535dcc-94c6-4ad6-9893-29c89adacdf9', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('286a41e8-1df6-428a-8e32-afb68320810e', 'a2925666-1fc3-40ad-b221-c5174455af9a', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 124, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2c5994b7-4115-4a0a-b89d-3fd9d4715958', '733386c1-10c0-4bcb-b760-442cbf801cf9', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 106, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2d14b337-92d4-4100-b13f-423359db3eee', '5210c1cd-df22-4597-8571-8d4cd1a33a48', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2d3d7607-7a05-49c7-a989-bc6ca8665814', '9da30dfa-ed4e-4fc2-ad51-03c53e429209', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 161, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('30dc088d-52aa-4353-9812-9fe3b70740e8', '294701f0-07ee-4ff6-92ad-55219bafc17a', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3506f450-24d8-4f47-bb3f-497daeabbede', '6e810913-346d-494e-9cea-220b1639d1f1', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 128, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('36a1d8f8-a34d-4078-9236-c81ba156abb8', '9867af02-d090-4f04-8213-296806efbadd', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 78, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('37919bbd-d9d8-4d84-812d-0e379efe03ae', 'd653c24e-acdb-4f7f-a328-b2dce695bba1', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 164, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('37b6cf36-bba6-4c97-bd95-57ce164cd454', '65ac562b-53f5-4dca-8e47-4a1f8c0615ff', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 125, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3b381fbc-2c5e-41e8-b008-19135101fbbc', '3b1bf9bf-4aa1-4718-8900-1d4d145b943a', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 70, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3cf5b258-1026-46e5-9507-487d8af7d2b0', '294701f0-07ee-4ff6-92ad-55219bafc17a', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 128, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3ee8e62c-d42a-4849-a9ab-a3dc2c23be13', 'adf7682b-02b9-408f-9344-226d8ff652dd', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 128, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3f744f1a-fc06-4d92-940f-d318059eca1b', 'c79346c2-70e2-444f-8627-4f921a9d027e', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 120, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3fd8fc9c-51af-40b1-85c6-356772eb59c0', '53535dcc-94c6-4ad6-9893-29c89adacdf9', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('411bb206-a7fc-4a88-adfc-34503e36850a', 'b5de7f14-0012-4f7f-b719-dbb8545671c1', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('44b463e9-97cf-4e89-9938-01d7e5d31e10', '8d4ef036-3004-45fd-a7f8-c67a698b0473', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 60, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('4612bdaa-8a5b-4199-a817-0d3239d3c5bd', '9f8785dc-dcfd-4586-bf92-3fa3963441f3', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('48d71d12-8e1c-4b33-acb2-333001dba354', '5210c1cd-df22-4597-8571-8d4cd1a33a48', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('4978229a-935d-40e4-9458-be33d2c73a8f', 'c79346c2-70e2-444f-8627-4f921a9d027e', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 120, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('51fdf690-eb27-4b8d-b360-221820594b52', 'be1a96e9-0ec3-4254-9489-a598356dd22c', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 138, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('541806de-5de0-4472-8dec-3613c35029c2', 'c944f769-cc5a-4bad-8fc4-3a5b92bd57a1', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 168, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('54fe7f90-bace-48a6-b465-ef6c2abe4f65', '0fa6068b-b99d-43aa-a995-4a587a6aa91a', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 138, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('550954e0-494c-4845-97b2-c6660a0ee9b5', '294701f0-07ee-4ff6-92ad-55219bafc17a', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('55fdc905-d4a6-4275-9df1-81cd3366af5f', 'b3b157d9-402e-414c-9424-a59494be4439', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 83, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('56f9d1d4-1c14-42bc-8f03-a56ae4a9517d', '1fb2d9fd-c2be-41a8-90a3-e2b875584195', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 164, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('57b6364e-824f-4b05-935e-1ac2795b178e', 'c0dd0ecf-41a6-44d3-8d58-9ec48f970dea', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 153, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5b27efdd-ed6e-476f-8186-231647065ae0', 'f2e52d65-39cc-42e8-9884-6b0b3b62857b', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 66, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5c3049e2-8115-436a-a4eb-c508ee49dc2b', 'c944f769-cc5a-4bad-8fc4-3a5b92bd57a1', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 166, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5cffe04e-ef50-44b8-86e0-c41b69cb5622', 'aa861c99-5efe-4e7a-9c94-41183e1cc6fa', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5dac4c6b-8b5c-4997-9ba8-766e4d7f4ef3', 'd653c24e-acdb-4f7f-a328-b2dce695bba1', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('60991872-bbef-4bf0-9a99-14123a3dbb17', '266de1df-bd44-4fbe-86a1-34c762198004', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 140, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('615cbeb3-479f-4336-ba0b-ae8ea6714b80', '11e15751-1a2b-48d6-8bc8-f17ee3605ca9', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 158, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('62cd6120-445d-427c-8994-7cabf036f73d', 'e85faa6a-8288-400d-be0d-1eda1820bea1', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 150, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('631f5191-d5cb-446e-9b51-c612260c6004', 'e624076b-5db2-4df9-8304-7ceb7fe61c2e', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 100, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('66910e32-8bad-4153-980e-9cb90e828f52', 'fd5bb27a-26c2-4128-8ec7-fd2de3c6b50a', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 123, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('694e1f6a-7edb-4611-bbec-cd54e1009563', '9da30dfa-ed4e-4fc2-ad51-03c53e429209', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 161, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('6b0c0bca-7c22-4911-bb3e-957bcf05a650', 'e624076b-5db2-4df9-8304-7ceb7fe61c2e', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 100, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('6ec78c23-288f-4fb8-94a1-097e72a9cd74', 'f2e52d65-39cc-42e8-9884-6b0b3b62857b', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 66, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('702190ba-7c56-4376-ba5a-cf10a0833e45', 'dd55b592-351b-4155-9fdf-5becfde7168c', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 114, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('705c5b84-affa-4ba8-b783-c7ee88f226e2', 'f4a47376-a622-44ce-a774-83fdc7ec4e51', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 80, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('770c333d-74ad-4265-9ebb-9c8acef2fcfd', '733386c1-10c0-4bcb-b760-442cbf801cf9', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 108, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('79eed0fd-3f71-4b04-aa0c-7e468e848a1e', 'f4a47376-a622-44ce-a774-83fdc7ec4e51', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 80, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('7cffd599-66a4-4f3f-af68-3d2bcdb45693', 'be1a96e9-0ec3-4254-9489-a598356dd22c', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 136, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8278df2e-79f6-4b65-8ade-69d01cd2846d', '6e810913-346d-494e-9cea-220b1639d1f1', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('87784359-ac29-46b0-a44c-57d54ede0dbc', 'af41c9b7-38db-4273-bd33-19f0a0d7a3da', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 116, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('87e278e1-7a2a-4dbe-a86e-93151275d37d', 'e85faa6a-8288-400d-be0d-1eda1820bea1', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 150, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8e9d19d8-3a60-49b5-8867-b1c2f9038ed0', '1fb2d9fd-c2be-41a8-90a3-e2b875584195', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8f6ef952-8c18-4ddf-bb96-36f127178b72', '783c6e77-f5c2-4b60-b0bd-7cce05a053fb', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 133, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8f912e82-2c06-46d6-a169-020e1d4dc2c1', 'c0dd0ecf-41a6-44d3-8d58-9ec48f970dea', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 154, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('96291d12-26ae-4f10-88d5-77e91234e201', 'f72e0c42-ea16-4c3f-9cec-19e9e3c4daca', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 130, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('97184027-4c19-48c2-8aa0-286ee49a60c9', 'c79346c2-70e2-444f-8627-4f921a9d027e', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 120, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('99f95cd0-49af-447b-b412-c3491e981ee2', '3bdd4186-5b91-45ec-accf-e727a4a9aad3', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 166, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9a204a46-6adf-4da7-917a-2aab1dd7a167', '3b1bf9bf-4aa1-4718-8900-1d4d145b943a', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 70, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9e4ae5eb-00a9-4a58-bb0f-73bb9096764a', '9f8785dc-dcfd-4586-bf92-3fa3963441f3', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a311fa89-7618-4418-ab5b-810e793ce173', 'dd55b592-351b-4155-9fdf-5becfde7168c', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 113, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a472b4c3-2707-44fa-b47e-1b92bf3f1300', 'b5de7f14-0012-4f7f-b719-dbb8545671c1', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a4ccf9e6-39cd-48fc-a3d2-0503d6b8eb15', '783c6e77-f5c2-4b60-b0bd-7cce05a053fb', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 134, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a5dee830-7310-41ec-9acb-536bb3d8277c', '144e9c83-d057-4d88-b9f2-2c7d9ab201e4', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('aa538c07-f9c3-4b69-8deb-8171ec42663a', '1fb2d9fd-c2be-41a8-90a3-e2b875584195', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('acb85b43-e896-4578-a3a7-7f454589a58a', 'af41c9b7-38db-4273-bd33-19f0a0d7a3da', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 134, 118, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ad3a337b-4253-451a-ad90-dc5dccf54547', 'dd55b592-351b-4155-9fdf-5becfde7168c', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 113, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b74ddda6-6a3d-4541-926b-72f50e8252e6', '037a912e-91d9-4c99-ac60-23004ee1f2b4', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b77c321f-883a-43df-8239-b53d3eefd771', '6e810913-346d-494e-9cea-220b1639d1f1', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 126, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b8deb5d4-55d7-438c-bf17-0a531b212a8d', '5210c1cd-df22-4597-8571-8d4cd1a33a48', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bacb5818-e13c-411e-9bdc-00c67b105129', 'abe3464b-1d7d-4df4-a66f-a05354115b44', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 74, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bbeadbf2-79cc-4a4a-bfee-3fc596b8615e', '0fa6068b-b99d-43aa-a995-4a587a6aa91a', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 139, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bda163ca-0f88-4b18-8399-6e8ad3b87cfe', '11e15751-1a2b-48d6-8bc8-f17ee3605ca9', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 158, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bddbae55-1ce2-44da-be83-6c3c49d3374f', '037a912e-91d9-4c99-ac60-23004ee1f2b4', '34f3b118-ff89-43f9-b963-c6deb46286c3', 166, 161, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bde59ab0-b4f3-4a96-ae72-87935c41a1bf', '144e9c83-d057-4d88-b9f2-2c7d9ab201e4', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 164, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c07b9fd7-de6f-48d4-a21e-29488e542d1b', '65ac562b-53f5-4dca-8e47-4a1f8c0615ff', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 125, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c2502184-b6cf-4ecd-a40b-e3fcc18a3c7a', '783c6e77-f5c2-4b60-b0bd-7cce05a053fb', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 133, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c641bf6d-bec9-4322-a637-275b2af44f62', 'c0dd0ecf-41a6-44d3-8d58-9ec48f970dea', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 153, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c82b96f2-dcb1-4c8a-adff-467b5884e123', 'e85faa6a-8288-400d-be0d-1eda1820bea1', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 150, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c8411c33-4548-4a0d-b255-1c75cfffd441', 'be1a96e9-0ec3-4254-9489-a598356dd22c', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 136, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c912c4a5-d6f3-4afc-86a9-68a2102025ed', '5aa76c7e-66cd-47ea-83ea-c008412dc4d7', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 143, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('cb223a63-f749-46f9-8595-85a640c22f8f', 'e152a086-c3a3-4838-bce6-b2658e2bb473', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 116, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('cf56dc4e-3984-47a6-b219-361db9315c34', 'f4a47376-a622-44ce-a774-83fdc7ec4e51', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 80, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('cfc88d6f-4808-4013-8a26-aac0bf9879c4', 'd818a6d7-231b-4102-9ef1-e557c8afc765', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 131, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('cfea3c4b-eca9-4e5a-b846-41f7d64d6d21', 'aa861c99-5efe-4e7a-9c94-41183e1cc6fa', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d08d9991-8e2c-4b44-9b19-fe4419d8c936', '5aa76c7e-66cd-47ea-83ea-c008412dc4d7', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 141, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d22b5367-a29b-43d0-822e-a2563fb84918', '037a912e-91d9-4c99-ac60-23004ee1f2b4', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 161, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d4006ffd-77f3-4f71-b07c-89eee1571fc7', '266de1df-bd44-4fbe-86a1-34c762198004', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 140, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d503254d-5d34-4fca-b9d2-5801e9f19070', 'abe3464b-1d7d-4df4-a66f-a05354115b44', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 73, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d55fb3d9-f58b-4551-9e39-261cc43ebe1d', '3b1bf9bf-4aa1-4718-8900-1d4d145b943a', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 70, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d754a1d5-c693-428f-82f0-924f7e29671c', 'a2925666-1fc3-40ad-b221-c5174455af9a', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 133, 123, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d76ae556-aa0b-49a2-95fd-dbc1e24d6771', 'e2d80e20-8ff2-4ba8-8667-32b9cb2a2be5', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 136, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('da887d2b-b803-4a3c-8bf4-860d47e7db8e', 'b3b157d9-402e-414c-9424-a59494be4439', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 84, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('dabe899c-b617-4821-b0ad-818a4a7a587b', '266de1df-bd44-4fbe-86a1-34c762198004', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 140, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('db6fe308-bee4-4d95-9500-9e2488dc3369', '9da30dfa-ed4e-4fc2-ad51-03c53e429209', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 163, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('db8e0207-6d75-4310-bfd7-32fcdc98a688', 'af41c9b7-38db-4273-bd33-19f0a0d7a3da', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 116, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('de6d3ffc-0d65-45bd-b2c5-074b0a9028d1', 'adf7682b-02b9-408f-9344-226d8ff652dd', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 128, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('dfb229f1-bbe8-4fc8-b291-5980de05c074', 'fd5bb27a-26c2-4128-8ec7-fd2de3c6b50a', '8f2a1f55-391c-4e51-912b-bc6893952b50', 133, 123, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('dfe05f99-cc7e-432a-b949-f95b781bf666', '11e15751-1a2b-48d6-8bc8-f17ee3605ca9', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 159, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e0e3ac19-01bb-4d9c-9405-fb5cb8efc010', 'b5de7f14-0012-4f7f-b719-dbb8545671c1', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e3fbea61-0889-41c4-af8a-bfadeb6a8f97', 'aa861c99-5efe-4e7a-9c94-41183e1cc6fa', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 168, 160, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e44043b3-043c-41ff-b595-4600acd98760', 'c944f769-cc5a-4bad-8fc4-3a5b92bd57a1', 'ab5aa49c-4d83-4f3c-b774-3a1c8728aa9d', 166, 166, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e465dd49-aa56-43c7-9b45-c1ef48e86206', '8d4ef036-3004-45fd-a7f8-c67a698b0473', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 60, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e5ad77ba-979b-44fd-9a18-1d115c14ce86', 'e2d80e20-8ff2-4ba8-8667-32b9cb2a2be5', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 138, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e6f245d5-7326-4862-b0d8-f6b1748e5d9b', 'f2e52d65-39cc-42e8-9884-6b0b3b62857b', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 168, 68, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e8128f54-e4c5-499c-81b5-946290185ef2', 'a2925666-1fc3-40ad-b221-c5174455af9a', '34f3b118-ff89-43f9-b963-c6deb46286c3', 133, 123, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e9f9ccdf-85d8-4f91-b2c3-bc94ff944152', '8d4ef036-3004-45fd-a7f8-c67a698b0473', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 60, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ea395149-e3e1-492a-af62-06e5f0ff95b2', '9f8785dc-dcfd-4586-bf92-3fa3963441f3', '34f3b118-ff89-43f9-b963-c6deb46286c3', 134, 128, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ef3f3420-9311-4732-a680-d51374540a27', 'f72e0c42-ea16-4c3f-9cec-19e9e3c4daca', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 130, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f074add3-bc47-4bef-bdcd-392e50e418f8', 'e152a086-c3a3-4838-bce6-b2658e2bb473', '9f1e9834-0b17-48a1-ba96-5ede6a0eac71', 133, 116, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f262ba38-5432-4c43-8b35-83e61f93fb2a', '3bdd4186-5b91-45ec-accf-e727a4a9aad3', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 168, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f2ab41d6-e926-4b8d-a336-415d6a7a1277', 'abe3464b-1d7d-4df4-a66f-a05354115b44', '1f33b559-be98-48c8-bce3-0762ede0cb2a', 166, 73, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f36709d7-42cc-4a6f-b617-a6b9a8e6eed9', '9867af02-d090-4f04-8213-296806efbadd', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 76, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f3a206b0-3be2-4133-84d4-24c26c9e4f1f', 'b3b157d9-402e-414c-9424-a59494be4439', '8f2a1f55-391c-4e51-912b-bc6893952b50', 166, 83, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f3c9b927-5420-44e6-8760-fe183919833d', '53535dcc-94c6-4ad6-9893-29c89adacdf9', '8f2a1f55-391c-4e51-912b-bc6893952b50', 168, 165, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('f4318b4f-9f82-4135-8f98-d56aa5b542cd', 'fd5bb27a-26c2-4128-8ec7-fd2de3c6b50a', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 124, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('fb95ce05-8e2f-4e7c-9b55-09d4658a87e1', 'f72e0c42-ea16-4c3f-9cec-19e9e3c4daca', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 130, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('fea3fb65-818b-43d6-944a-5b3ea48e28a3', 'e152a086-c3a3-4838-bce6-b2658e2bb473', 'bb477b25-af51-4ff6-9b33-b269b8e49c15', 134, 118, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `raw_materials`
--

CREATE TABLE `raw_materials` (
  `id` varchar(36) NOT NULL,
  `supplier_id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL COMMENT 'Nama bahan baku',
  `unit` varchar(20) NOT NULL COMMENT 'Satuan: kg, ltr, pcs, dll',
  `price_per_unit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `category` enum('Bahan Pokok','Lauk Pauk','Sayuran','Bumbu','Minyak','Lainnya') NOT NULL DEFAULT 'Lainnya',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raw_materials`
--

INSERT INTO `raw_materials` (`id`, `supplier_id`, `name`, `unit`, `price_per_unit`, `category`, `created_at`, `updated_at`) VALUES
('082a0cbb-4bf8-4be4-b865-59287d0ac1a8', '821679b9-5a34-451b-b879-e69347ca87d0', 'Mie Kering', 'kg', 16000.00, 'Bahan Pokok', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('194aacbb-16bf-47f2-968f-cd51718f2883', '83ebb583-a6fb-4e53-9204-c3a195c5b31e', 'Ayam Potong', 'kg', 38000.00, 'Lauk Pauk', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2b5f02ee-f1aa-475f-876f-db03b71275c1', '83ebb583-a6fb-4e53-9204-c3a195c5b31e', 'Telur Ayam', 'kg', 28000.00, 'Lauk Pauk', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('311d1c8f-a4ef-41b7-9325-250ad5dd0d7d', '224b43c9-728e-43b2-8f77-062fd3978c3a', 'Sayuran Segar', 'kg', 12000.00, 'Sayuran', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5450d870-f875-4241-a287-63aea37ca1a4', '3358df3d-5583-4126-8583-db8a3cd0086a', 'Bumbu Rempah', 'kg', 45000.00, 'Bumbu', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('9bfdd291-ca54-4e69-b190-b72618c463fa', '12e18aaa-6c29-465b-a1bf-12999a4a89e4', 'Beras Premium', 'kg', 14000.00, 'Bahan Pokok', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e58a951a-9bbd-4ff6-9010-d45e2c96375c', '821679b9-5a34-451b-b879-e69347ca87d0', 'Minyak Goreng', 'ltr', 18000.00, 'Minyak', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ed5b7a85-f0ae-4635-81bb-4fe043f6ab67', '13954065-c69a-4818-9308-ec92bddcd600', 'Tahu', 'pcs', 1500.00, 'Lauk Pauk', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `raw_material_stock`
--

CREATE TABLE `raw_material_stock` (
  `id` varchar(36) NOT NULL,
  `kitchen_id` varchar(36) NOT NULL,
  `raw_material_id` varchar(36) NOT NULL,
  `current_stock` decimal(15,3) NOT NULL DEFAULT 0.000 COMMENT 'Stok tersedia dalam satuan bahan baku',
  `minimum_stock` decimal(15,3) NOT NULL DEFAULT 0.000 COMMENT 'Batas minimum sebelum trigger alert',
  `last_restocked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raw_material_stock`
--

INSERT INTO `raw_material_stock` (`id`, `kitchen_id`, `raw_material_id`, `current_stock`, `minimum_stock`, `last_restocked_at`, `created_at`, `updated_at`) VALUES
('08b8caf6-8775-4bd7-a1ba-384980dca834', 'K01', '2b5f02ee-f1aa-475f-876f-db03b71275c1', 60.000, 50.000, '2026-06-08 10:26:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('09497777-9d2a-41c3-b136-4d53cde43994', 'K01', 'e58a951a-9bbd-4ff6-9010-d45e2c96375c', 180.000, 150.000, '2026-06-05 06:50:47', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('19f96454-ebaf-4325-977e-2ee062410206', 'K01', 'ed5b7a85-f0ae-4635-81bb-4fe043f6ab67', 250.000, 200.000, '2026-06-11 06:50:30', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('2215ce83-56a7-41c5-ba32-0a82beb4cd62', 'K05', '9bfdd291-ca54-4e69-b190-b72618c463fa', 280.000, 300.000, '2026-06-05 20:24:58', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('31d60319-b23d-4981-8386-9c4da667c2d8', 'K02', 'e58a951a-9bbd-4ff6-9010-d45e2c96375c', 120.000, 100.000, '2026-06-06 11:32:05', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5b8388c4-a594-41a2-8c49-65dfbaf9d8ac', 'K02', '194aacbb-16bf-47f2-968f-cd51718f2883', 150.000, 100.000, '2026-06-04 08:49:55', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('60a9d2c6-eb3e-4d6d-98a8-472f73d03fde', 'K01', '311d1c8f-a4ef-41b7-9325-250ad5dd0d7d', 80.000, 120.000, '2026-06-04 11:30:37', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('6451ade2-5338-4f26-b0c2-0b487b14f759', 'K01', '194aacbb-16bf-47f2-968f-cd51718f2883', 95.000, 100.000, '2026-06-10 16:12:16', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('72073356-f222-409d-936b-9ea24f0ac232', 'K03', '194aacbb-16bf-47f2-968f-cd51718f2883', 40.000, 80.000, '2026-06-11 02:05:48', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('83be3672-b02f-463f-ba8c-bda745e4b2b3', 'K01', '5450d870-f875-4241-a287-63aea37ca1a4', 45.000, 30.000, '2026-06-07 17:50:02', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('8de70355-d9e0-4e64-9d6e-be41c1abaa01', 'K06', '9bfdd291-ca54-4e69-b190-b72618c463fa', 100.000, 400.000, '2026-06-04 23:26:44', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a04ffc5d-8550-4997-86a1-048280f94c38', 'K03', '2b5f02ee-f1aa-475f-876f-db03b71275c1', 30.000, 40.000, '2026-06-07 19:36:09', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('a260f65b-fcd3-44fc-b7f3-70bf20618fd3', 'K03', 'e58a951a-9bbd-4ff6-9010-d45e2c96375c', 60.000, 80.000, '2026-06-06 17:38:56', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('aa8256e5-426e-4a9e-a4a1-89e0a2390001', 'K01', '9bfdd291-ca54-4e69-b190-b72618c463fa', 320.000, 500.000, '2026-06-04 11:04:09', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('ac8c1cff-b015-4b69-80db-e4f0f7d31dc9', 'K05', 'e58a951a-9bbd-4ff6-9010-d45e2c96375c', 90.000, 80.000, '2026-06-10 21:06:40', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('af0735a3-74c6-44ea-aa16-f965716e568c', 'K02', '311d1c8f-a4ef-41b7-9325-250ad5dd0d7d', 200.000, 120.000, '2026-06-09 21:17:40', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('b4fe46dd-b615-4d2f-bec2-0e087d9030a6', 'K04', '194aacbb-16bf-47f2-968f-cd51718f2883', 120.000, 80.000, '2026-06-07 23:29:21', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c4216321-08a0-472f-864e-53a161781188', 'K01', '082a0cbb-4bf8-4be4-b865-59287d0ac1a8', 75.000, 40.000, '2026-06-08 23:02:30', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('c47c616f-cd66-421c-9dac-57f85bb3de8a', 'K02', '9bfdd291-ca54-4e69-b190-b72618c463fa', 480.000, 400.000, '2026-06-07 04:43:40', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('d32b005a-9d11-4f2b-bb3c-492edf3ccd94', 'K04', '9bfdd291-ca54-4e69-b190-b72618c463fa', 400.000, 300.000, '2026-06-08 11:31:18', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('de100566-c78f-46c3-958b-c59ceedefde0', 'K03', '9bfdd291-ca54-4e69-b190-b72618c463fa', 350.000, 300.000, '2026-06-10 02:48:32', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e35c79d1-24dc-4d1a-a98d-e67c893fc2a4', 'K05', '311d1c8f-a4ef-41b7-9325-250ad5dd0d7d', 50.000, 100.000, '2026-06-08 16:16:11', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e70094e8-364c-4026-b58d-1cd2b4e00bbd', 'K06', 'e58a951a-9bbd-4ff6-9010-d45e2c96375c', 30.000, 100.000, '2026-06-07 22:37:42', '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('fc80dda0-fb94-46d4-a93a-69e9a721dc05', 'K04', '5450d870-f875-4241-a287-63aea37ca1a4', 55.000, 30.000, '2026-06-09 00:45:32', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `salary_payments`
--

CREATE TABLE `salary_payments` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) NOT NULL,
  `kitchen_id` varchar(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `period_month` int(10) UNSIGNED NOT NULL COMMENT 'Bulan 1–12',
  `period_year` int(10) UNSIGNED NOT NULL COMMENT 'Tahun, misal: 2026',
  `status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `paid_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_payments`
--

INSERT INTO `salary_payments` (`id`, `employee_id`, `kitchen_id`, `amount`, `period_month`, `period_year`, `status`, `paid_at`, `paid_by`, `notes`, `created_at`, `updated_at`) VALUES
('264770b2-3d17-406c-b035-cba4ff16c798', '921b089e-2f10-434a-b5ae-5e5c519750fc', 'K02', 5500000.00, 6, 2026, 'paid', '2026-06-11 08:24:02', '4041e187-d1a9-4686-965d-935d8ecf7a2a', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3b8a2663-a4a2-44c3-814e-faf6fc31f840', 'fd2c5ffd-7712-43a5-a4e3-4952185bd146', 'K01', 5500000.00, 6, 2026, 'paid', '2026-06-16 14:11:47', NULL, NULL, '2026-06-16 14:11:47', '2026-06-16 14:11:47'),
('4e2a8dc5-3b63-4e99-8e1e-cdc8690927ae', 'b896d395-304d-4c28-826e-70b4b7698d6d', 'K01', 4200000.00, 6, 2026, 'paid', '2026-06-11 08:24:02', '4041e187-d1a9-4686-965d-935d8ecf7a2a', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('bebad175-8e08-45bb-89f0-ca0801791935', '8829c29d-e550-46ac-b762-6968783172d0', 'K03', 4200000.00, 6, 2026, 'paid', '2026-06-11 08:24:02', '4041e187-d1a9-4686-965d-935d8ecf7a2a', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('e539e6b3-1fdc-4fae-8de7-946ef225fa61', '3ccfb17f-c731-4f1a-b49e-22355475c8cc', 'K05', 4800000.00, 6, 2026, 'paid', '2026-06-11 08:24:02', '4041e187-d1a9-4686-965d-935d8ecf7a2a', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `sppg`
--

CREATE TABLE `sppg` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `name` varchar(200) NOT NULL COMMENT 'Nama SPPG / Perusahaan Pemilik',
  `owner_name` varchar(150) NOT NULL COMMENT 'Nama Penanggung Jawab',
  `owner_phone` varchar(30) DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `npwp` varchar(30) DEFAULT NULL COMMENT 'Nomor Pokok Wajib Pajak',
  `nib` varchar(30) DEFAULT NULL COMMENT 'Nomor Induk Berusaha',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `contract_start` date DEFAULT NULL,
  `contract_end` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sppg`
--

INSERT INTO `sppg` (`id`, `name`, `owner_name`, `owner_phone`, `owner_email`, `address`, `npwp`, `nib`, `status`, `contract_start`, `contract_end`, `created_at`, `updated_at`) VALUES
('dc835b4d-d315-4fc8-94bc-2f38b2f1ecc5', 'PT MBG Pusat', 'Direktur Utama', '081234567890', 'direktur@mbg.id', 'Jl. Sudirman No. 1, Jakarta Pusat', NULL, NULL, 'active', '2026-01-01', '2027-12-31', '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `name` varchar(200) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `rating` decimal(3,2) DEFAULT NULL COMMENT 'Skor performa 0.00–5.00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `city`, `status`, `rating`, `created_at`, `updated_at`) VALUES
('12e18aaa-6c29-465b-a1bf-12999a4a89e4', 'CV Bumi Tani', 'Pak Hadi', '081200001111', 'bumitani@supplier.id', 'Jl. Raya Subang No.12', 'Subang', 'active', 4.50, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('13954065-c69a-4818-9308-ec92bddcd600', 'UD Tahu Jaya', 'Bu Yuni', '081200004444', 'tahujaya@supplier.id', 'Jl. Tahu Sumedang No.5', 'Sumedang', 'active', 3.90, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('224b43c9-728e-43b2-8f77-062fd3978c3a', 'Pasar Induk JAKA', 'Pak Dedi', '081200005555', 'pasarjaka@supplier.id', 'Jl. Pasar Induk Kramat Jati', 'Jakarta', 'active', 4.10, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('3358df3d-5583-4126-8583-db8a3cd0086a', 'PT Bumbu Nusantara', 'Ibu Ratna', '081200006666', 'bumbunusantara@supplier.id', 'Jl. Rempah No.22', 'Bandung', 'active', 4.60, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('821679b9-5a34-451b-b879-e69347ca87d0', 'PT Sari Mas', 'Ibu Sari', '081200002222', 'sarimas@supplier.id', 'Jl. Industri Blok A3', 'Surabaya', 'active', 4.20, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('83ebb583-a6fb-4e53-9204-c3a195c5b31e', 'CV Ternak Sehat', 'Pak Agus', '081200003333', 'ternaksehat@supplier.id', 'Jl. Peternakan No.8', 'Bogor', 'active', 4.70, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'bcrypt hash',
  `role` enum('master_admin','admin_dapur','finance','viewer','user') NOT NULL DEFAULT 'admin_dapur',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
('3acef44c-69f9-4323-b774-c1ac63a81e45', 'Pengguna Biasa', 'user@mbg.id', 'user123', 'user', 'active', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('4041e187-d1a9-4686-965d-935d8ecf7a2a', 'Master Admin SCM', 'admin@mbg.id', 'admin123', 'master_admin', 'active', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02'),
('5211f8d1-61d6-48ee-a132-14fcf77241d4', 'Finance Manager', 'finance@mbg.id', 'dummyhash', 'finance', 'active', NULL, '2026-06-11 08:24:02', '2026-06-11 08:24:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cashflow_transactions`
--
ALTER TABLE `cashflow_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashflow_transactions_recorded_by_foreign` (`recorded_by`),
  ADD KEY `idx_cashflow_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_cashflow_type` (`type`),
  ADD KEY `idx_cashflow_date` (`transaction_date`),
  ADD KEY `idx_cashflow_category` (`category`);

--
-- Indexes for table `delivery_items`
--
ALTER TABLE `delivery_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_delivery_items_logistics_id` (`logistics_id`),
  ADD KEY `idx_delivery_items_menu_id` (`menu_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employees_email_unique` (`email`),
  ADD KEY `idx_employees_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_employees_role` (`role`),
  ADD KEY `idx_employees_status` (`status`);

--
-- Indexes for table `finance_requests`
--
ALTER TABLE `finance_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `finance_requests_reviewed_by_foreign` (`reviewed_by`),
  ADD KEY `idx_finance_requests_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_finance_requests_requested_by` (`requested_by`),
  ADD KEY `idx_finance_requests_status` (`status`);

--
-- Indexes for table `kitchens`
--
ALTER TABLE `kitchens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kitchens_sppg_id` (`sppg_id`),
  ADD KEY `idx_kitchens_status` (`status`);

--
-- Indexes for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`);

--
-- Indexes for table `logistics`
--
ALTER TABLE `logistics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_logistics_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_logistics_fleet_code` (`fleet_code`),
  ADD KEY `idx_logistics_status` (`status`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menus_is_active` (`is_active`),
  ADD KEY `idx_menus_category` (`category`);

--
-- Indexes for table `productions`
--
ALTER TABLE `productions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productions_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_productions_date` (`production_date`),
  ADD KEY `idx_productions_status` (`status`);

--
-- Indexes for table `production_details`
--
ALTER TABLE `production_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_production_menu` (`production_id`,`menu_id`),
  ADD KEY `idx_production_details_production_id` (`production_id`),
  ADD KEY `idx_production_details_menu_id` (`menu_id`);

--
-- Indexes for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_raw_materials_supplier_id` (`supplier_id`),
  ADD KEY `idx_raw_materials_category` (`category`);

--
-- Indexes for table `raw_material_stock`
--
ALTER TABLE `raw_material_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_stock_kitchen_material` (`kitchen_id`,`raw_material_id`),
  ADD KEY `idx_rms_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_rms_raw_material_id` (`raw_material_id`);

--
-- Indexes for table `salary_payments`
--
ALTER TABLE `salary_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salary_payments_paid_by_foreign` (`paid_by`),
  ADD KEY `idx_salary_payments_employee_id` (`employee_id`),
  ADD KEY `idx_salary_payments_kitchen_id` (`kitchen_id`),
  ADD KEY `idx_salary_payments_period` (`period_year`,`period_month`),
  ADD KEY `idx_salary_payments_status` (`status`);

--
-- Indexes for table `sppg`
--
ALTER TABLE `sppg`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sppg_status` (`status`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suppliers_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cashflow_transactions`
--
ALTER TABLE `cashflow_transactions`
  ADD CONSTRAINT `cashflow_transactions_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cashflow_transactions_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `delivery_items`
--
ALTER TABLE `delivery_items`
  ADD CONSTRAINT `delivery_items_logistics_id_foreign` FOREIGN KEY (`logistics_id`) REFERENCES `logistics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_items_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `finance_requests`
--
ALTER TABLE `finance_requests`
  ADD CONSTRAINT `finance_requests_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `finance_requests_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `finance_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kitchens`
--
ALTER TABLE `kitchens`
  ADD CONSTRAINT `kitchens_sppg_id_foreign` FOREIGN KEY (`sppg_id`) REFERENCES `sppg` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `logistics`
--
ALTER TABLE `logistics`
  ADD CONSTRAINT `logistics_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `productions`
--
ALTER TABLE `productions`
  ADD CONSTRAINT `productions_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `production_details`
--
ALTER TABLE `production_details`
  ADD CONSTRAINT `production_details_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `production_details_production_id_foreign` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD CONSTRAINT `raw_materials_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `raw_material_stock`
--
ALTER TABLE `raw_material_stock`
  ADD CONSTRAINT `raw_material_stock_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `raw_material_stock_raw_material_id_foreign` FOREIGN KEY (`raw_material_id`) REFERENCES `raw_materials` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `salary_payments`
--
ALTER TABLE `salary_payments`
  ADD CONSTRAINT `salary_payments_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `salary_payments_kitchen_id_foreign` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `salary_payments_paid_by_foreign` FOREIGN KEY (`paid_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
