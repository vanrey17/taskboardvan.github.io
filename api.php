<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$pdo = getDB();

// Tangkap method dan action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Parsing body (JSON atau form-data)
$input = [];
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $input = $decoded;
        }
    }
    if (empty($input)) {
        $input = $_POST;
    }
}

// Validasi status yang diizinkan
$validStatuses = ['belum dikerjakan', 'sedang dikerjakan', 'done'];

try {
    switch ($action) {
        case 'list':
            // Ambil semua task
            $stmt = $pdo->query("
                SELECT id, title, due_date, status, description, created_at, updated_at 
                FROM tasks 
                ORDER BY 
                    CASE 
                        WHEN status = 'sedang dikerjakan' THEN 1 
                        WHEN status = 'belum dikerjakan' THEN 2 
                        WHEN status = 'done' THEN 3 
                        ELSE 4 
                    END, 
                    due_date ASC, 
                    id DESC
            ");
            $tasks = $stmt->fetchAll();

            // Hitung statistik
            $stats = [
                'total' => count($tasks),
                'belum_dikerjakan' => 0,
                'sedang_dikerjakan' => 0,
                'done' => 0
            ];

            foreach ($tasks as $t) {
                if ($t['status'] === 'belum dikerjakan') $stats['belum_dikerjakan']++;
                elseif ($t['status'] === 'sedang dikerjakan') $stats['sedang_dikerjakan']++;
                elseif ($t['status'] === 'done') $stats['done']++;
            }

            echo json_encode([
                'success' => true,
                'data' => $tasks,
                'stats' => $stats
            ]);
            break;

        case 'get':
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID tugas tidak valid.']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $task = $stmt->fetch();

            if (!$task) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Tugas tidak ditemukan.']);
                exit;
            }

            echo json_encode(['success' => true, 'data' => $task]);
            break;

        case 'create':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
                exit;
            }

            $title = trim($input['title'] ?? '');
            $due_date = !empty($input['due_date']) ? trim($input['due_date']) : null;
            $status = trim($input['status'] ?? 'belum dikerjakan');
            $description = trim($input['description'] ?? '');

            if ($title === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Nama tugas wajib diisi!']);
                exit;
            }

            if (!in_array($status, $validStatuses, true)) {
                $status = 'belum dikerjakan';
            }

            $stmt = $pdo->prepare("
                INSERT INTO tasks (title, due_date, status, description, created_at, updated_at) 
                VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
            ");
            // Catatan: Jika MySQL, datetime('now') berbeda syntax, mari kita gunakan standar date('Y-m-d H:i:s')
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("
                INSERT INTO tasks (title, due_date, status, description, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$title, $due_date, $status, $description, $now, $now]);
            $newId = (int)$pdo->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Tugas baru berhasil ditambahkan!',
                'data' => [
                    'id' => $newId,
                    'title' => $title,
                    'due_date' => $due_date,
                    'status' => $status,
                    'description' => $description
                ]
            ]);
            break;

        case 'update':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
                exit;
            }

            $id = (int)($input['id'] ?? 0);
            $title = trim($input['title'] ?? '');
            $due_date = !empty($input['due_date']) ? trim($input['due_date']) : null;
            $status = trim($input['status'] ?? 'belum dikerjakan');
            $description = trim($input['description'] ?? '');

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID tugas tidak valid.']);
                exit;
            }

            if ($title === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Nama tugas wajib diisi!']);
                exit;
            }

            if (!in_array($status, $validStatuses, true)) {
                $status = 'belum dikerjakan';
            }

            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("
                UPDATE tasks 
                SET title = ?, due_date = ?, status = ?, description = ?, updated_at = ? 
                WHERE id = ?
            ");
            $stmt->execute([$title, $due_date, $status, $description, $now, $id]);

            echo json_encode([
                'success' => true,
                'message' => 'Tugas berhasil diperbarui!'
            ]);
            break;

        case 'update_status':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
                exit;
            }

            $id = (int)($input['id'] ?? 0);
            $status = trim($input['status'] ?? '');

            if ($id <= 0 || !in_array($status, $validStatuses, true)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Parameter status atau ID tidak valid.']);
                exit;
            }

            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?");
            $stmt->execute([$status, $now, $id]);

            echo json_encode([
                'success' => true,
                'message' => 'Status tugas berhasil diubah ke: ' . $status
            ]);
            break;

        case 'delete':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
                exit;
            }

            $id = (int)($input['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID tugas tidak valid.']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Tugas berhasil dihapus!'
            ]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action tidak dikenali.']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
    ]);
}
