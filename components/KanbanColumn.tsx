'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  count: number;
  indicatorColor: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  count,
  indicatorColor,
  onEdit,
  onDelete,
  onStatusChange,
  onDropTask,
  onDragStart,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/80 rounded-2xl border transition-all duration-200 min-h-[500px] ${
        isOver
          ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200 ring-offset-1'
          : 'border-slate-200/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 bg-white/70 rounded-t-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`} />
          <h2 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
          {count}
        </span>
      </div>

      {/* Column Task Cards */}
      <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {tasks.length === 0 ? (
          <div className="my-auto py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-slate-400">
            <Inbox className="w-8 h-8 mb-2 opacity-50 stroke-[1.5]" />
            <p className="text-xs font-medium">Belum ada tugas di kolom ini</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
