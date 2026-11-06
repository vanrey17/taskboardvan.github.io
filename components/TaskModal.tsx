'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit: Task | null;
  onClose: () => void;
  onSave: (taskData: {
    id?: string;
    title: string;
    dueDate: string | null;
    status: TaskStatus;
    description: string;
  }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('belum dikerjakan');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDueDate(taskToEdit.dueDate || '');
      setStatus(taskToEdit.status);
      setDescription(taskToEdit.description || '');
    } else {
      setTitle('');
      // Default tanggal ke hari ini
      setDueDate(new Date().toISOString().split('T')[0]);
      setStatus('belum dikerjakan');
      setDescription('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama tugas wajib diisi!');
      return;
    }

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      dueDate: dueDate || null,
      status,
      description: description.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {taskToEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Nama Tugas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nama Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Contoh: Mendesain Landing Page & Dashboard"
                autoFocus
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            {/* Tanggal & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tanggal Selesai */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Target Selesai
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                >
                  <option value="belum dikerjakan">⏳ Belum Dikerjakan</option>
                  <option value="sedang dikerjakan">⚡ Sedang Dikerjakan</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>
            </div>

            {/* Keterangan (Update sampe tahap mana) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Keterangan (Update Sampai Tahap Mana)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Sudah selesai draft awal 60%, lanjut pengerjaan modul autentikasi..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-sm hover:shadow transition-all"
            >
              {taskToEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
