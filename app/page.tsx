'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumn } from '@/components/KanbanColumn';
import { TaskTableView } from '@/components/TaskTableView';
import { TaskModal } from '@/components/TaskModal';
import { DeleteModal } from '@/components/DeleteModal';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Database, 
  HardDrive, 
  Download, 
  Upload, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'taskboard_tasks_v2';

const SEED_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Desain Layout & Arsitektur Taskboard',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'done',
    description: 'Menyusun wireframe Kanban board 3 kolom dan skema database.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Migrasi ke Next.js & Siap Hosting Vercel',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'sedang dikerjakan',
    description: 'Tahap 85%: Pengujian komponen Kanban drag & drop, API routes, dan build production.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Hubungkan ke Database PostgreSQL (Neon / Supabase)',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'belum dikerjakan',
    description: 'Menambahkan DATABASE_URL di environment variables Vercel untuk sinkronisasi cloud.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // 1. Initial Load: Coba fetch dari API backend (Postgres Vercel), fallback ke LocalStorage
  useEffect(() => {
    async function initTasks() {
      try {
        const res = await fetch('/api/tasks');
        const json = await res.json();

        if (json.success && json.dbConnected && json.data && json.data.length > 0) {
          setIsDbConnected(true);
          setTasks(json.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          setIsLoaded(true);
          return;
        }

        if (json.dbConnected) {
          setIsDbConnected(true);
        }
      } catch (e) {
        console.warn('Backend API tidak tersambung ke remote DB, beralih ke penyimpanan browser.', e);
      }

      // Ambil dari LocalStorage browser agar data tetap tersimpan saat di-close
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error('Failed to parse local storage', err);
        }
      }

      // Gunakan Seed tasks jika belum ada data sama sekali
      setTasks(SEED_TASKS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_TASKS));
      setIsLoaded(true);
    }

    initTasks();
  }, []);

  // Simpan ke LocalStorage setiap ada perubahan tugas
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Statistik & Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const belum = tasks.filter((t) => t.status === 'belum dikerjakan').length;
    const sedang = tasks.filter((t) => t.status === 'sedang dikerjakan').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, belum, sedang, done, rate };
  }, [tasks]);

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [tasks, filterStatus, searchQuery]);

  // Columns data for Kanban
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'belum dikerjakan'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'sedang dikerjakan'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'done'), [filteredTasks]);

  // ==========================================
  // CRUD Handlers
  // ==========================================
  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: {
    id?: string;
    title: string;
    dueDate: string | null;
    status: TaskStatus;
    description: string;
  }) => {
    const now = new Date().toISOString();

    if (taskData.id) {
      // UPDATE
      const updatedList = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              title: taskData.title,
              dueDate: taskData.dueDate,
              status: taskData.status,
              description: taskData.description,
              updatedAt: now,
            }
          : t
      );
      setTasks(updatedList);
      setIsModalOpen(false);
      showToast('Tugas berhasil diperbarui!', 'success');

      // Sync ke backend jika ada
      try {
        await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    } else {
      // CREATE
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title,
        dueDate: taskData.dueDate,
        status: taskData.status,
        description: taskData.description,
        createdAt: now,
        updatedAt: now,
      };

      setTasks([newTask, ...tasks]);
      setIsModalOpen(false);
      showToast('Tugas baru berhasil ditambahkan!', 'success');

      // Sync ke backend jika ada
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const updatedList = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedList);
    showToast(`Status tugas diubah ke: ${newStatus}`, 'info');

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('API sync warning:', e);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const current = tasks.find((t) => t.id === taskId);
    if (current && current.status !== targetStatus) {
      handleStatusChange(taskId, targetStatus);
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setTaskToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDeleteId) return;
    const id = taskToDeleteId;
    setTasks(tasks.filter((t) => t.id !== id));
    setDeleteModalOpen(false);
    setTaskToDeleteId(null);
    showToast('Tugas berhasil dihapus.', 'success');

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API delete sync warning:', e);
    }
  };

  // Export & Import Backup JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskboard-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data tugas berhasil diexport ke file JSON!', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setTasks(imported);
          showToast(`Berhasil mengimpor ${imported.length} tugas!`, 'success');
        } else {
          showToast('Format file JSON tidak sesuai.', 'error');
        }
      } catch (err) {
        showToast('Gagal membaca file JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  TaskBoard
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Next.js
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                Kelola tugas, status, & target deadline
              </p>
            </div>
          </div>

          {/* Right Header: Storage Indicator & Add Button */}
          <div className="flex items-center gap-2.5">
            {/* Database / Storage Pill */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isDbConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                isDbConnected
                  ? 'Tersambung ke database cloud PostgreSQL'
                  : 'Data tersimpan otomatis di browser lokal (LocalStorage). Siap dihubungkan ke Neon/Supabase di Vercel.'
              }
            >
              {isDbConnected ? (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Database</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Penyimpanan Lokal</span>
                </>
              )}
            </div>

            {/* Export & Import Backup */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={handleExportJson}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Export Data ke JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <label
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Import Data dari JSON"
              >
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>

            {/* Tambah Tugas Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Statistics Bar */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              {stats.total}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{stats.total}</p>
              <p className="text-xs font-medium text-slate-500">Total Tugas</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{stats.belum}</p>
              <p className="text-xs font-medium text-slate-500">Belum Dikerjakan</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{stats.sedang}</p>
              <p className="text-xs font-medium text-slate-500">Sedang Dikerjakan</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{stats.done}</p>
              <p className="text-xs font-medium text-slate-500">Done (Selesai)</p>
            </div>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Progres Keseluruhan</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {stats.rate}% Selesai
            </span>
          </div>
          <div className="flex-1 max-w-xl h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </section>

        {/* Toolbar: Search, Filter, View Toggler */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tugas atau keterangan..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Status Filter & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="belum dikerjakan">⏳ Belum Dikerjakan</option>
              <option value="sedang dikerjakan">⚡ Sedang Dikerjakan</option>
              <option value="done">✅ Done</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Papan Kanban"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Papan</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel List"
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content View: Kanban or List */}
        <section className="pb-12">
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <KanbanColumn
                title="Belum Dikerjakan"
                status="belum dikerjakan"
                tasks={todoTasks}
                count={todoTasks.length}
                indicatorColor="bg-amber-500"
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                onDragStart={handleDragStart}
              />

              <KanbanColumn
                title="Sedang Dikerjakan"
                status="sedang dikerjakan"
                tasks={inProgressTasks}
                count={inProgressTasks.length}
                indicatorColor="bg-blue-500"
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                onDragStart={handleDragStart}
              />

              <KanbanColumn
                title="Done"
                status="done"
                tasks={doneTasks}
                count={doneTasks.length}
                indicatorColor="bg-emerald-500"
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                onDragStart={handleDragStart}
              />
            </div>
          ) : (
            <TaskTableView
              tasks={filteredTasks}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onStatusChange={handleStatusChange}
            />
          )}
        </section>
      </main>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-medium shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 stroke-[2.5]" />}
          {toast.type === 'info' && <Zap className="w-4 h-4 text-indigo-400 stroke-[2.5]" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
