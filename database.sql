-- Database: taskboard_db
CREATE DATABASE IF NOT EXISTS `taskboard_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `taskboard_db`;

-- Tabel: tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `due_date` DATE NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'belum dikerjakan',
  `description` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contoh data awal
INSERT INTO `tasks` (`title`, `due_date`, `status`, `description`) VALUES
('Riset Kebutuhan Fitur Aplikasi', '2026-11-08', 'done', 'Selesai mewawancarai stakeholder dan menyusun daftar fitur prioritas.'),
('Desain Mockup & Wireframe UI', '2026-11-10', 'sedang dikerjakan', 'Sedang mengerjakan mockup di Figma, sudah selesai 70% pada bagian dashboard.'),
('Integrasi Database & API Backend', '2026-11-12', 'belum dikerjakan', 'Menyiapkan schema dan endpoint API CRUD untuk data tugas.'),
('Testing & Deployment ke Server', '2026-11-15', 'belum dikerjakan', 'Tahap final pengujian sistem dan upload ke hosting.');
