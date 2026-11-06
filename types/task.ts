export type TaskStatus = 'belum dikerjakan' | 'sedang dikerjakan' | 'done';

export interface Task {
  id: string;
  title: string;
  dueDate: string | null; // Format: YYYY-MM-DD
  status: TaskStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  belumDikerjakan: number;
  sedangDikerjakan: number;
  done: number;
  completionRate: number;
}
