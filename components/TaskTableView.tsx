'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Edit3, Trash2, Calendar } from 'lucide-react';

interface TaskTableViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const statusStyles: Record<TaskStatus, { bg: string; text: string; label: string }> = {
    'belum dikerjakan': { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: '', label: 'Belum Dikerjakan' },
    'sedang dikerjakan': { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: '', label: 'Sedang Dikerjakan' },
    'done': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: '', label: 'Done' },
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-sm">Tidak ada tugas yang sesuai dengan pencarian atau filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Tugas</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Target Selesai</th>
              <th className="py-3.5 px-4">Keterangan (Tahap)</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs break-words">
                  {task.title}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="belum dikerjakan">⏳ Belum Dikerjakan</option>
                    <option value="sedang dikerjakan">⚡ Sedang Dikerjakan</option>
                    <option value="done">✅ Done</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.dueDate || '-'}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 max-w-sm">
                  <span className="line-clamp-2">{task.description || '-'}</span>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
