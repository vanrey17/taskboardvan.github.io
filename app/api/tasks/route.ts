import { NextRequest, NextResponse } from 'next/server';
import { getTasksFromDb, createTaskInDb, hasDatabaseConfig } from '@/lib/db';
import { Task, TaskStatus } from '@/types/task';

export async function GET() {
  try {
    const isDbConnected = hasDatabaseConfig();
    
    if (isDbConnected) {
      const tasks = await getTasksFromDb();
      return NextResponse.json({
        success: true,
        dbConnected: true,
        data: tasks,
      });
    }

    // Jika database belum di-set di Vercel/Local, beri tahu client untuk pakai LocalStorage
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: [],
      message: 'Database cloud belum terkonfigurasi. Menggunakan penyimpanan browser lokal.',
    });
  } catch (error: any) {
    console.error('API GET /api/tasks error:', error);
    return NextResponse.json({
      success: false,
      dbConnected: false,
      error: error.message || 'Gagal memuat tugas',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, dueDate, status, description } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama tugas wajib diisi!' }, { status: 422 });
    }

    const validStatuses: TaskStatus[] = ['belum dikerjakan', 'sedang dikerjakan', 'done'];
    const taskStatus: TaskStatus = validStatuses.includes(status) ? status : 'belum dikerjakan';

    const newTask: Omit<Task, 'createdAt' | 'updatedAt'> = {
      id: body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      dueDate: dueDate || null,
      status: taskStatus,
      description: (description || '').trim(),
    };

    if (hasDatabaseConfig()) {
      const created = await createTaskInDb(newTask);
      return NextResponse.json({ success: true, dbConnected: true, data: created });
    }

    // Client mode
    const now = new Date().toISOString();
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...newTask, createdAt: now, updatedAt: now }
    });
  } catch (error: any) {
    console.error('API POST /api/tasks error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan tugas' }, { status: 500 });
  }
}
