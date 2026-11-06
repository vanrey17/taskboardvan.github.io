'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Calendar, AlertCircle, Edit3, Trash2, Clock, CheckCircle2, Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
}) => {
  // Format Tanggal & Deadline status
  const getDueDateInfo = (dateStr: string | null) => {
    if (!dateStr) return { label: 'Tanpa Tanggal', isOverdue: false, isToday: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const formatted = `${target.getDate()} ${months[target.getMonth()]} ${target.getFullYear()}`;

    if (diffDays < 0) {
      return { label: `${formatted} (Terlewat)`, isOverdue: true, isToday: false };
    }
    if (diffDays === 0) {
      return { label: `Hari Ini (${formatted})`, isOverdue: false, isToday: true };
    }
    if (diffDays === 1) {
      return { label: `Besok (${formatted})`, isOverdue: false, isToday: false };
    }

    return { label: formatted, isOverdue: false, isToday: false };
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  // Status configuration
  const statusStyles: Record<TaskStatus, { bg: string; text: string; border: string; label: string; icon: any }> = {
    'belum dikerjakan': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Belum Dikerjakan',
      icon: Clock,
    },
    'sedang dikerjakan': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Sedang Dikerjakan',
      icon: Zap,
    },
    'done': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Done',
      icon: CheckCircle2,
    },
  };

  const currentStatusConfig = statusStyles[task.status] || statusStyles['belum dikerjakan'];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
    >
      {/* Header Card: Status Badge & Quick Move */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{currentStatusConfig.label}</span>
        </span>

        {/* Quick status dropdown */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 hover:text-slate-900 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          title="Ubah Status Cepat"
        >
          <option value="belum dikerjakan">⏳ Belum</option>
          <option value="sedang dikerjakan">⚡ Sedang</option>
          <option value="done">✅ Done</option>
        </select>
      </div>

      {/* Task Title */}
      <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 break-words">
        {task.title}
      </h3>

      {/* Description / Progress Notes (Update sampai tahap mana) */}
      {task.description && (
        <div className="bg-slate-50 border-l-2 border-indigo-500 rounded-r-lg p-2.5 mb-3 text-xs text-slate-600 leading-relaxed break-words">
          <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
            <span>Tahap / Catatan</span>
          </div>
          <p className="whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Footer Card: Due Date & Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
        <div
          className={`inline-flex items-center gap-1.5 font-medium ${
            dueInfo.isOverdue
              ? 'text-red-600'
              : dueInfo.isToday
              ? 'text-amber-600'
              : 'text-slate-500'
          }`}
          title="Target Selesai"
        >
          {dueInfo.isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>{dueInfo.label}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Tugas"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus Tugas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
