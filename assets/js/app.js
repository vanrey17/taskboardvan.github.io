/**
 * Taskboard Client Application
 * Vanilla JS - Fast, Modern, and Smooth UI/UX
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Store
    let tasks = [];
    let currentFilterStatus = 'all';
    let currentSearchQuery = '';
    let currentView = 'kanban'; // 'kanban' or 'list'
    let taskToDeleteId = null;

    // DOM Elements
    const elements = {
        // Kanban Columns
        colTodo: document.getElementById('tasks-todo'),
        colInProgress: document.getElementById('tasks-inprogress'),
        colDone: document.getElementById('tasks-done'),

        // Badges
        badgeTodo: document.getElementById('badge-todo'),
        badgeInProgress: document.getElementById('badge-inprogress'),
        badgeDone: document.getElementById('badge-done'),

        // Stats
        statTotal: document.getElementById('stat-total'),
        statTodo: document.getElementById('stat-todo'),
        statInProgress: document.getElementById('stat-inprogress'),
        statDone: document.getElementById('stat-done'),
        progressFill: document.getElementById('progress-fill'),
        progressPct: document.getElementById('progress-pct'),

        // Views
        kanbanView: document.getElementById('kanban-view'),
        listView: document.getElementById('list-view'),
        tableBody: document.getElementById('task-table-body'),
        btnViewKanban: document.getElementById('btn-view-kanban'),
        btnViewList: document.getElementById('btn-view-list'),

        // Filter & Search
        searchInput: document.getElementById('search-task'),
        filterStatus: document.getElementById('filter-status'),

        // Modal Form (Add & Edit)
        taskModal: document.getElementById('task-modal'),
        taskModalTitle: document.getElementById('modal-title'),
        taskForm: document.getElementById('task-form'),
        taskIdInput: document.getElementById('task-id'),
        taskTitleInput: document.getElementById('task-title'),
        taskDueDateInput: document.getElementById('task-due-date'),
        taskStatusInput: document.getElementById('task-status'),
        taskDescInput: document.getElementById('task-description'),
        btnOpenAddModal: document.getElementById('btn-open-add-modal'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        btnCancelModal: document.getElementById('btn-cancel-modal'),

        // Delete Confirmation Modal
        deleteModal: document.getElementById('delete-modal'),
        btnCancelDelete: document.getElementById('btn-cancel-delete'),
        btnConfirmDelete: document.getElementById('btn-confirm-delete'),

        // Toast Container
        toastContainer: document.getElementById('toast-container')
    };

    // ==========================================================================
    // Fetch & Load Data
    // ==========================================================================
    async function loadTasks() {
        try {
            const response = await fetch('api.php?action=list');
            const result = await response.json();

            if (result.success) {
                tasks = result.data;
                renderApp();
            } else {
                showToast(result.message || 'Gagal memuat tugas', 'error');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showToast('Koneksi terputus ke server', 'error');
        }
    }

    // ==========================================================================
    // Render Functions
    // ==========================================================================
    function renderApp() {
        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            const matchesStatus = currentFilterStatus === 'all' || task.status === currentFilterStatus;
            const query = currentSearchQuery.toLowerCase();
            const matchesSearch = 
                (task.title && task.title.toLowerCase().includes(query)) ||
                (task.description && task.description.toLowerCase().includes(query));
            return matchesStatus && matchesSearch;
        });

        updateStats();

        if (currentView === 'kanban') {
            renderKanban(filteredTasks);
        } else {
            renderList(filteredTasks);
        }
    }

    function updateStats() {
        const total = tasks.length;
        const todoCount = tasks.filter(t => t.status === 'belum dikerjakan').length;
        const inProgressCount = tasks.filter(t => t.status === 'sedang dikerjakan').length;
        const doneCount = tasks.filter(t => t.status === 'done').length;

        // Stat cards
        elements.statTotal.textContent = total;
        elements.statTodo.textContent = todoCount;
        elements.statInProgress.textContent = inProgressCount;
        elements.statDone.textContent = doneCount;

        // Column Header Badges
        elements.badgeTodo.textContent = todoCount;
        elements.badgeInProgress.textContent = inProgressCount;
        elements.badgeDone.textContent = doneCount;

        // Progress Bar
        const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        elements.progressFill.style.width = `${percentage}%`;
        elements.progressPct.textContent = `${percentage}% Selesai`;
    }

    function renderKanban(taskList) {
        // Clear containers
        elements.colTodo.innerHTML = '';
        elements.colInProgress.innerHTML = '';
        elements.colDone.innerHTML = '';

        const todoTasks = taskList.filter(t => t.status === 'belum dikerjakan');
        const inProgressTasks = taskList.filter(t => t.status === 'sedang dikerjakan');
        const doneTasks = taskList.filter(t => t.status === 'done');

        renderColumn(elements.colTodo, todoTasks, 'belum dikerjakan', 'Belum ada tugas baru.');
        renderColumn(elements.colInProgress, inProgressTasks, 'sedang dikerjakan', 'Tidak ada tugas aktif.');
        renderColumn(elements.colDone, doneTasks, 'done', 'Belum ada tugas selesai.');
    }

    function renderColumn(container, columnTasks, statusKey, emptyText) {
        if (columnTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>${emptyText}</p>
                </div>
            `;
            return;
        }

        columnTasks.forEach(task => {
            const card = createTaskCard(task);
            container.appendChild(card);
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('draggable', 'true');
        card.dataset.id = task.id;

        // Status badge format
        const statusMap = {
            'belum dikerjakan': { label: 'Belum Dikerjakan', class: 'todo' },
            'sedang dikerjakan': { label: 'Sedang Dikerjakan', class: 'inprogress' },
            'done': { label: 'Done', class: 'done' }
        };
        const currentStatus = statusMap[task.status] || { label: task.status, class: 'todo' };

        // Due date calculation
        const dateMeta = formatDueDate(task.due_date);

        // Keterangan / Progress note
        const descHtml = task.description ? `
            <div class="card-desc-box">
                <div class="card-desc-label">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    Tahap / Catatan
                </div>
                ${escapeHtml(task.description)}
            </div>
        ` : '';

        card.innerHTML = `
            <div class="card-header-meta">
                <span class="status-badge ${currentStatus.class}">
                    ${currentStatus.label}
                </span>
                <select class="quick-status-select" title="Pindah Status Cepat" data-id="${task.id}">
                    <option value="belum dikerjakan" ${task.status === 'belum dikerjakan' ? 'selected' : ''}>⏳ Belum</option>
                    <option value="sedang dikerjakan" ${task.status === 'sedang dikerjakan' ? 'selected' : ''}>⚡ Sedang</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>✅ Done</option>
                </select>
            </div>
            
            <h4 class="card-title">${escapeHtml(task.title)}</h4>
            
            ${descHtml}

            <div class="card-footer">
                <div class="due-badge ${dateMeta.isOverdue ? 'overdue' : (dateMeta.isToday ? 'today' : '')}" title="Target Penyelesaian">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>${dateMeta.text}</span>
                </div>
                <div class="card-quick-actions">
                    <button class="btn-card-action edit-task" title="Edit Tugas" data-id="${task.id}">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="btn-card-action danger delete-task" title="Hapus Tugas" data-id="${task.id}">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Event Listeners on Card
        // Drag events
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        // Quick status change dropdown
        const statusSelect = card.querySelector('.quick-status-select');
        statusSelect.addEventListener('change', (e) => {
            updateTaskStatus(task.id, e.target.value);
        });

        // Edit button
        const editBtn = card.querySelector('.edit-task');
        editBtn.addEventListener('click', () => openEditModal(task));

        // Delete button
        const deleteBtn = card.querySelector('.delete-task');
        deleteBtn.addEventListener('click', () => openDeleteModal(task.id));

        return card;
    }

    function renderList(taskList) {
        elements.tableBody.innerHTML = '';

        if (taskList.length === 0) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        Tidak ada tugas yang sesuai.
                    </td>
                </tr>
            `;
            return;
        }

        const statusMap = {
            'belum dikerjakan': { label: 'Belum Dikerjakan', class: 'todo' },
            'sedang dikerjakan': { label: 'Sedang Dikerjakan', class: 'inprogress' },
            'done': { label: 'Done', class: 'done' }
        };

        taskList.forEach(task => {
            const tr = document.createElement('tr');
            const dateMeta = formatDueDate(task.due_date);
            const statusConfig = statusMap[task.status] || { label: task.status, class: 'todo' };

            tr.innerHTML = `
                <td>
                    <strong>${escapeHtml(task.title)}</strong>
                </td>
                <td>
                    <span class="status-badge ${statusConfig.class}">${statusConfig.label}</span>
                </td>
                <td>
                    <span class="due-badge ${dateMeta.isOverdue ? 'overdue' : (dateMeta.isToday ? 'today' : '')}">
                        ${dateMeta.text}
                    </span>
                </td>
                <td style="max-width: 320px;">
                    <div style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4;">
                        ${task.description ? escapeHtml(task.description) : '<em>-</em>'}
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-card-action edit-task" title="Edit Tugas" data-id="${task.id}">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="btn-card-action danger delete-task" title="Hapus Tugas" data-id="${task.id}">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            tr.querySelector('.edit-task').addEventListener('click', () => openEditModal(task));
            tr.querySelector('.delete-task').addEventListener('click', () => openDeleteModal(task.id));

            elements.tableBody.appendChild(tr);
        });
    }

    // ==========================================================================
    // Drag & Drop Functionality
    // ==========================================================================
    let draggedCard = null;

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    // Setup drop targets on columns
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetStatus = column.dataset.status;

            if (taskId && targetStatus) {
                const currentTask = tasks.find(t => t.id == taskId);
                if (currentTask && currentTask.status !== targetStatus) {
                    updateTaskStatus(taskId, targetStatus);
                }
            }
        });
    });

    // ==========================================================================
    // API Operations (CRUD)
    // ==========================================================================
    async function updateTaskStatus(taskId, newStatus) {
        try {
            const response = await fetch('api.php?action=update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, status: newStatus })
            });

            const result = await response.json();
            if (result.success) {
                // Optimistic UI update
                const taskIndex = tasks.findIndex(t => t.id == taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].status = newStatus;
                    renderApp();
                }
                showToast(`Status diperbarui: ${newStatus}`, 'success');
            } else {
                showToast(result.message || 'Gagal mengubah status', 'error');
                loadTasks(); // rollback
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Gagal mengubah status tugas', 'error');
            loadTasks();
        }
    }

    // Handle Form Submit (Add or Update)
    elements.taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = elements.taskIdInput.value;
        const isEditing = Boolean(id);

        const payload = {
            id: id ? parseInt(id, 10) : undefined,
            title: elements.taskTitleInput.value.trim(),
            due_date: elements.taskDueDateInput.value || null,
            status: elements.taskStatusInput.value,
            description: elements.taskDescInput.value.trim()
        };

        if (!payload.title) {
            showToast('Nama tugas wajib diisi!', 'error');
            elements.taskTitleInput.focus();
            return;
        }

        const action = isEditing ? 'update' : 'create';

        try {
            const response = await fetch(`api.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                closeModal();
                showToast(result.message, 'success');
                loadTasks();
            } else {
                showToast(result.message || 'Gagal menyimpan tugas', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showToast('Terjadi kesalahan saat menyimpan data', 'error');
        }
    });

    // Handle Delete Task
    elements.btnConfirmDelete.addEventListener('click', async () => {
        if (!taskToDeleteId) return;

        try {
            const response = await fetch('api.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskToDeleteId })
            });

            const result = await response.json();

            if (result.success) {
                tasks = tasks.filter(t => t.id != taskToDeleteId);
                closeDeleteModal();
                showToast('Tugas berhasil dihapus', 'success');
                renderApp();
            } else {
                showToast(result.message || 'Gagal menghapus tugas', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Terjadi kesalahan saat menghapus data', 'error');
        }
    });

    // ==========================================================================
    // Modals Management
    // ==========================================================================
    function openAddModal() {
        elements.taskForm.reset();
        elements.taskIdInput.value = '';
        elements.taskModalTitle.textContent = 'Tambah Tugas Baru';
        elements.taskStatusInput.value = 'belum dikerjakan';
        
        // Default target date to today
        const today = new Date().toISOString().split('T')[0];
        elements.taskDueDateInput.value = today;

        elements.taskModal.classList.add('active');
        setTimeout(() => elements.taskTitleInput.focus(), 150);
    }

    function openEditModal(task) {
        elements.taskIdInput.value = task.id;
        elements.taskTitleInput.value = task.title || '';
        elements.taskDueDateInput.value = task.due_date || '';
        elements.taskStatusInput.value = task.status || 'belum dikerjakan';
        elements.taskDescInput.value = task.description || '';
        
        elements.taskModalTitle.textContent = 'Edit Tugas';
        elements.taskModal.classList.add('active');
        setTimeout(() => elements.taskTitleInput.focus(), 150);
    }

    function closeModal() {
        elements.taskModal.classList.remove('active');
    }

    function openDeleteModal(taskId) {
        taskToDeleteId = taskId;
        elements.deleteModal.classList.add('active');
    }

    function closeDeleteModal() {
        taskToDeleteId = null;
        elements.deleteModal.classList.remove('active');
    }

    // Modal Events
    elements.btnOpenAddModal.addEventListener('click', openAddModal);
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);
    elements.btnCancelDelete.addEventListener('click', closeDeleteModal);

    // Close when clicking outside modal card
    [elements.taskModal, elements.deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                closeDeleteModal();
            }
        });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
        }
    });

    // ==========================================================================
    // Search, Filter & View Controls
    // ==========================================================================
    elements.searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        renderApp();
    });

    elements.filterStatus.addEventListener('change', (e) => {
        currentFilterStatus = e.target.value;
        renderApp();
    });

    // View toggler (Kanban vs List)
    elements.btnViewKanban.addEventListener('click', () => {
        currentView = 'kanban';
        elements.btnViewKanban.classList.add('active');
        elements.btnViewList.classList.remove('active');
        elements.kanbanView.style.display = 'grid';
        elements.listView.style.display = 'none';
        renderApp();
    });

    elements.btnViewList.addEventListener('click', () => {
        currentView = 'list';
        elements.btnViewList.classList.add('active');
        elements.btnViewKanban.classList.remove('active');
        elements.kanbanView.style.display = 'none';
        elements.listView.style.display = 'block';
        renderApp();
    });

    // ==========================================================================
    // Helper Utilities
    // ==========================================================================
    function formatDueDate(dateString) {
        if (!dateString) {
            return { text: 'Tanpa Tanggal', isOverdue: false, isToday: false };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const formatted = `${targetDate.getDate()} ${months[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

        if (diffDays < 0) {
            return { text: `${formatted} (Terlewat)`, isOverdue: true, isToday: false };
        } else if (diffDays === 0) {
            return { text: `Hari ini (${formatted})`, isOverdue: false, isToday: true };
        } else if (diffDays === 1) {
            return { text: `Besok (${formatted})`, isOverdue: false, isToday: false };
        }

        return { text: formatted, isOverdue: false, isToday: false };
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: `<svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
            error: `<svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
            info: `<svg width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span>${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after 3.5s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 250);
        }, 3500);
    }

    // Start App
    loadTasks();
});
