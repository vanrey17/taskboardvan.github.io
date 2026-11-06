import { Pool } from 'pg';
import { Task, TaskStatus } from '@/types/task';

// Dapatkan connection string dari environment variable Vercel / Neon / Supabase
const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_PRISMA_URL;

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

// Inisialisasi tabel di database jika belum ada
export async function initDb(): Promise<boolean> {
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          due_date DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'belum dikerjakan',
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Cek apakah tabel kosong, jika ya isi data awal
      const countRes = await client.query('SELECT COUNT(*) FROM tasks');
      const count = parseInt(countRes.rows[0].count, 10);
      if (count === 0) {
        const seedTasks = [
          {
            id: 'task-1',
            title: 'Membuat Desain Konsep UI Taskboard',
            due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            status: 'done',
            description: 'Desain layout Kanban board dan komponen modal sudah disetujui.'
          },
          {
            id: 'task-2',
            title: 'Migrasi ke Next.js & Setup Vercel',
            due_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
            status: 'sedang dikerjakan',
            description: 'Tahap 80%: Komponen Kanban, Drag and Drop, dan API routing selesai.'
          },
          {
            id: 'task-3',
            title: 'Testing Deployment & Sinkronisasi DB',
            due_date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
            status: 'belum dikerjakan',
            description: 'Uji coba CRUD di production Vercel menggunakan Neon / Supabase.'
          }
        ];

        for (const t of seedTasks) {
          await client.query(`
            INSERT INTO tasks (id, title, due_date, status, description, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          `, [t.id, t.title, t.due_date, t.status, t.description]);
        }
      }

      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export function hasDatabaseConfig(): boolean {
  return Boolean(connectionString);
}

export async function getTasksFromDb(): Promise<Task[]> {
  if (!pool) return [];
  await initDb();

  const res = await pool.query(`
    SELECT id, title, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, status, description, created_at, updated_at
    FROM tasks
    ORDER BY 
      CASE 
        WHEN status = 'sedang dikerjakan' THEN 1
        WHEN status = 'belum dikerjakan' THEN 2
        WHEN status = 'done' THEN 3
        ELSE 4
      END,
      due_date ASC NULLS LAST,
      created_at DESC
  `);

  return res.rows.map(row => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    status: row.status as TaskStatus,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function createTaskInDb(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
  if (!pool) throw new Error('Database not configured');
  await initDb();

  const now = new Date().toISOString();
  await pool.query(`
    INSERT INTO tasks (id, title, due_date, status, description, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [task.id, task.title, task.dueDate || null, task.status, task.description, now, now]);

  return {
    ...task,
    createdAt: now,
    updatedAt: now
  };
}

export async function updateTaskInDb(id: string, updates: Partial<Task>): Promise<boolean> {
  if (!pool) throw new Error('Database not configured');
  await initDb();

  const now = new Date().toISOString();
  await pool.query(`
    UPDATE tasks
    SET title = COALESCE($1, title),
        due_date = $2,
        status = COALESCE($3, status),
        description = COALESCE($4, description),
        updated_at = $5
    WHERE id = $6
  `, [updates.title, updates.dueDate || null, updates.status, updates.description, now, id]);

  return true;
}

export async function deleteTaskFromDb(id: string): Promise<boolean> {
  if (!pool) throw new Error('Database not configured');
  await initDb();

  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return true;
}
