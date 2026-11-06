<?php
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskBoard - Manajemen Tugas & Progres</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- Header Section -->
    <header class="app-header">
        <div class="container">
            <div class="header-inner">
                <div class="brand">
                    <div class="brand-icon">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div class="brand-text">
                        <h1>TaskBoard</h1>
                        <p>Kelola daftar tugas & monitor progres harian</p>
                    </div>
                </div>

                <div class="header-actions">
                    <button id="btn-open-add-modal" class="btn btn-primary">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Tugas</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="container">
        <!-- Dashboard Statistics -->
        <section class="dashboard-bar">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon total">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span id="stat-total" class="stat-number">0</span>
                        <span class="stat-label">Total Tugas</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon todo">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span id="stat-todo" class="stat-number">0</span>
                        <span class="stat-label">Belum Dikerjakan</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon progress">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span id="stat-inprogress" class="stat-number">0</span>
                        <span class="stat-label">Sedang Dikerjakan</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon done">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span id="stat-done" class="stat-number">0</span>
                        <span class="stat-label">Selesai (Done)</span>
                    </div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                <span class="progress-text">Progres Keseluruhan:</span>
                <div class="progress-track">
                    <div id="progress-fill" class="progress-fill"></div>
                </div>
                <span id="progress-pct" class="progress-pct">0% Selesai</span>
            </div>
        </section>

        <!-- Search and Filters Section -->
        <section class="toolbar-section">
            <div class="toolbar-card">
                <!-- Search Box -->
                <div class="search-box">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" id="search-task" class="search-input" placeholder="Cari nama tugas atau keterangan...">
                </div>

                <!-- Filters & View Switchers -->
                <div class="filter-actions">
                    <select id="filter-status" class="form-control" style="width: auto; min-width: 170px;">
                        <option value="all">Semua Status</option>
                        <option value="belum dikerjakan">⏳ Belum Dikerjakan</option>
                        <option value="sedang dikerjakan">⚡ Sedang Dikerjakan</option>
                        <option value="done">✅ Done</option>
                    </select>

                    <div class="view-toggle">
                        <button id="btn-view-kanban" class="view-btn active" title="Tampilan Papan Kanban">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm7 0a1 1 0 011-1h3a1 1 0 011 1v7a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm7 0a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V4z"/>
                            </svg>
                            <span>Papan</span>
                        </button>
                        <button id="btn-view-list" class="view-btn" title="Tampilan Tabel / List">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <span>Tabel</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Board Section (Kanban Columns) -->
        <section class="board-container">
            <div id="kanban-view" class="kanban-grid">
                <!-- Column 1: Belum Dikerjakan -->
                <div class="kanban-column" data-status="belum dikerjakan">
                    <div class="column-header">
                        <div class="column-title-wrap">
                            <span class="column-indicator todo"></span>
                            <h3 class="column-title">Belum Dikerjakan</h3>
                        </div>
                        <span id="badge-todo" class="column-badge">0</span>
                    </div>
                    <div id="tasks-todo" class="column-tasks"></div>
                </div>

                <!-- Column 2: Sedang Dikerjakan -->
                <div class="kanban-column" data-status="sedang dikerjakan">
                    <div class="column-header">
                        <div class="column-title-wrap">
                            <span class="column-indicator inprogress"></span>
                            <h3 class="column-title">Sedang Dikerjakan</h3>
                        </div>
                        <span id="badge-inprogress" class="column-badge">0</span>
                    </div>
                    <div id="tasks-inprogress" class="column-tasks"></div>
                </div>

                <!-- Column 3: Done -->
                <div class="kanban-column" data-status="done">
                    <div class="column-header">
                        <div class="column-title-wrap">
                            <span class="column-indicator done"></span>
                            <h3 class="column-title">Done</h3>
                        </div>
                        <span id="badge-done" class="column-badge">0</span>
                    </div>
                    <div id="tasks-done" class="column-tasks"></div>
                </div>
            </div>

            <!-- List / Table View -->
            <div id="list-view" class="list-view-container">
                <div class="table-responsive">
                    <table class="task-table">
                        <thead>
                            <tr>
                                <th>Tugas</th>
                                <th>Status</th>
                                <th>Target Selesai</th>
                                <th>Keterangan (Tahap)</th>
                                <th style="width: 100px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="task-table-body"></tbody>
                    </table>
                </div>
            </div>
        </section>
    </main>

    <!-- Modal Form (Tambah & Edit Tugas) -->
    <div id="task-modal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="modal-title">Tambah Tugas Baru</h3>
                <button id="btn-close-modal" class="btn-icon" aria-label="Tutup">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <form id="task-form">
                <div class="modal-body">
                    <input type="hidden" id="task-id">

                    <!-- Nama Tugas -->
                    <div class="form-group">
                        <label class="form-label" for="task-title">
                            Nama Tugas <span class="required">*</span>
                        </label>
                        <input type="text" id="task-title" class="form-control" placeholder="Contoh: Membuat Laporan Keuangan Bulanan" required>
                    </div>

                    <!-- Tanggal Selesai & Status -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="task-due-date">Tanggal Target Selesai</label>
                            <input type="date" id="task-due-date" class="form-control">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="task-status">Status Pengerjaan</label>
                            <select id="task-status" class="form-control">
                                <option value="belum dikerjakan">⏳ Belum Dikerjakan</option>
                                <option value="sedang dikerjakan">⚡ Sedang Dikerjakan</option>
                                <option value="done">✅ Done</option>
                            </select>
                        </div>
                    </div>

                    <!-- Keterangan (Update sampe tahap mana) -->
                    <div class="form-group">
                        <label class="form-label" for="task-description">
                            Keterangan (Update Sampai Tahap Mana)
                        </label>
                        <textarea id="task-description" class="form-control" placeholder="Contoh: Sudah selesai draft bab 1 & 2, sedang review data bab 3..."></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" id="btn-cancel-modal" class="btn btn-secondary">Batal</button>
                    <button type="submit" id="btn-save-task" class="btn btn-primary">Simpan Tugas</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div id="delete-modal" class="modal-overlay">
        <div class="modal-card" style="max-width: 420px;">
            <div class="modal-header">
                <h3>Konfirmasi Hapus</h3>
            </div>
            <div class="modal-body" style="padding-top: 1rem; padding-bottom: 1rem;">
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
                    Apakah Anda yakin ingin menghapus tugas ini? Data yang dihapus tidak dapat dipulihkan kembali.
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" id="btn-cancel-delete" class="btn btn-secondary">Batal</button>
                <button type="button" id="btn-confirm-delete" class="btn btn-danger">Ya, Hapus</button>
            </div>
        </div>
    </div>

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="toast-container"></div>

    <!-- JavaScript Application -->
    <script src="assets/js/app.js"></script>
</body>
</html>
