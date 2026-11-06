import { NextRequest, NextResponse } from 'next/server';
import { updateTaskInDb, deleteTaskFromDb, hasDatabaseConfig } from '@/lib/db';
import { TaskStatus } from '@/types/task';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tugas tidak valid' }, { status: 400 });
    }

    if (hasDatabaseConfig()) {
      await updateTaskInDb(id, {
        title: body.title,
        dueDate: body.dueDate,
        status: body.status as TaskStatus,
        description: body.description,
      });

      return NextResponse.json({ success: true, dbConnected: true });
    }

    return NextResponse.json({ success: true, dbConnected: false });
  } catch (error: any) {
    console.error('API PUT /api/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui tugas' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tugas tidak valid' }, { status: 400 });
    }

    if (hasDatabaseConfig()) {
      await deleteTaskFromDb(id);
      return NextResponse.json({ success: true, dbConnected: true });
    }

    return NextResponse.json({ success: true, dbConnected: false });
  } catch (error: any) {
    console.error('API DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus tugas' }, { status: 500 });
  }
}
