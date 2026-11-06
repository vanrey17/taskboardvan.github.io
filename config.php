<?php
/**
 * Konfigurasi Database Taskboard
 * 
 * Secara default menggunakan SQLite sehingga LANGSUNG BERJALAN tanpa perlu setting apa pun.
 * Jika ingin menggunakan MySQL (misal di Laragon/XAMPP):
 * 1. Ubah DB_DRIVER menjadi 'mysql'
 * 2. Sesuaikan DB_NAME, DB_USER, DB_PASS jika berbeda
 */

// Pilihan: 'sqlite' atau 'mysql'
define('DB_DRIVER', 'sqlite');

// Konfigurasi MySQL (aktif jika DB_DRIVER = 'mysql')
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'taskboard_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Path file SQLite lokal (tersimpan di folder projek)
define('SQLITE_FILE', __DIR__ . '/database.sqlite');
