import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

export type BoxId = 'pc' | 'mlp' | 'compliance' | 'infra' | 'contracts' | 'dashboard';

export interface Task {
  id: string;
  box: BoxId;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  assignee?: string;
  dod?: string;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  relatedContractId?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'voice' | 'manual' | 'git' | 'email' | 'teams';
  transcript?: string;
}

interface DB {
  tasks: Task[];
}

export class TaskStore {
  private db: DB = { tasks: [] };

  constructor(private filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath)) {
      this.db = JSON.parse(fs.readFileSync(filePath, 'utf8')) as DB;
    } else {
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.db, null, 2));
  }

  add(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Task['status'] }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      status: input.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    this.db.tasks.push(task);
    this.save();
    return task;
  }

  list(box?: BoxId): Task[] {
    return box ? this.db.tasks.filter((t) => t.box === box) : this.db.tasks;
  }

  pendingCount(box: BoxId): number {
    return this.db.tasks.filter((t) => t.box === box && t.status !== 'done').length;
  }

  markDone(id: string): Task | null {
    const task = this.db.tasks.find((t) => t.id === id);
    if (!task) return null;
    task.status = 'done';
    task.updatedAt = new Date().toISOString();
    this.save();
    return task;
  }

  speakDailySummary(): void {
    const today = new Date().toISOString().slice(0, 10);
    const due = this.db.tasks.filter((t) => t.dueDate === today && t.status !== 'done');
    const overdue = this.db.tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done');
    // TODO: 実際には `say` コマンドやWhisperローカルに投げる
    // eslint-disable-next-line no-console
    console.log('[daily]', { today, dueToday: due.length, overdue: overdue.length });
  }
}
