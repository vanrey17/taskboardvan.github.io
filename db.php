<?php
require_once __DIR__ . '/config.php';

function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        if (DB_DRIVER === 'sqlite') {
            $pdo = new PDO('sqlite:' . SQLITE_FILE);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Inisialisasi tabel SQLite otomatis jika belum ada
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    due_date TEXT NULL,
                    status TEXT NOT NULL DEFAULT 'belum dikerjakan',
                    description TEXT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");

            // Cek apakah tabel kosong, jika ya isi contoh data awal
            $count = $pdo->query("SELECT COUNT(*) FROM tasks")->fetchColumn();
            if ($count == 0) {
                $seedSql = "
                    INSERT INTO tasks (title, due_date, status, description, created_at, updated_at) VALUES 
                    ('Membuat Wireframe & Konsep UI', date('now', '+2 days'), 'done', 'Desain awal dan sketsa alur pengguna sudah disetujui tim.', datetime('now', 'localtime'), datetime('now', 'localtime')),
                    ('Mengerjakan Frontend Taskboard', date('now', '+5 days'), 'sedang dikerjakan', 'Progress 70%: Styling tampilan drag & drop dan modal edit tugas.', datetime('now', 'localtime'), datetime('now', 'localtime')),
                    ('Setup Database & Koneksi Backend', date('now', '+3 days'), 'done', 'Koneksi SQLite & MySQL sudah siap digunakan.', datetime('now', 'localtime'), datetime('now', 'localtime')),
                    ('Testing & Quality Assurance', date('now', '+7 days'), 'belum dikerjakan', 'Menyiapkan checklist uji coba CRUD dan responsivitas mobile.', datetime('now', 'localtime'), datetime('now', 'localtime'));
                ";
                $pdo->exec($seedSql);
            }
        } else {
            // MySQL
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
            $tempPdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            // Buat database jika belum ada
            $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            $dsnWithDb = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsnWithDb, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // Inisialisasi tabel MySQL otomatis jika belum ada
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS tasks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    due_date DATE NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'belum dikerjakan',
                    description TEXT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Cek apakah tabel kosong untuk MySQL
            $count = $pdo->query("SELECT COUNT(*) FROM tasks")->fetchColumn();
            if ($count == 0) {
                $seedSql = "
                    INSERT INTO tasks (title, due_date, status, description, created_at, updated_at) VALUES 
                    ('Membuat Wireframe & Konsep UI', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'done', 'Desain awal dan sketsa alur pengguna sudah disetujui tim.', NOW(), NOW()),
                    ('Mengerjakan Frontend Taskboard', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'sedang dikerjakan', 'Progress 70%: Styling tampilan drag & drop dan modal edit tugas.', NOW(), NOW()),
                    ('Setup Database & Koneksi Backend', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'done', 'Koneksi SQLite & MySQL sudah siap digunakan.', NOW(), NOW()),
                    ('Testing & Quality Assurance', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'belum dikerjakan', 'Menyiapkan checklist uji coba CRUD dan responsivitas mobile.', NOW(), NOW());
                ";
                $pdo->exec($seedSql);
            }
        }
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Koneksi Database Gagal: ' . $e->getMessage()
        ]);
        exit;
    }

    return $pdo;
}
