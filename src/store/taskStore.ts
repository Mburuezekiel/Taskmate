import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, isAfter, isBefore, startOfToday } from 'date-fns';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  tags: string[];
  subtasks: SubTask[];
  comments: Comment[];
  timeTracking?: {
    estimated: number; // in minutes
    spent: number; // in minutes
  };
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task['status']) => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addComment: (taskId: string, content: string, author: string) => void;
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id'>) => void;
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getOverdueTasks: () => Task[];
  getDueSoonTasks: () => Task[];
  getTaskCompletion: () => number;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              subtasks: [],
              comments: [],
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      moveTask: (id, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
              : task
          ),
        })),
      addSubTask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [
                    ...task.subtasks,
                    { id: crypto.randomUUID(), title, completed: false },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
      toggleSubTask: (taskId, subTaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subTaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
      addComment: (taskId, content, author) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  comments: [
                    ...task.comments,
                    {
                      id: crypto.randomUUID(),
                      content,
                      author,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
      addAttachment: (taskId, attachment) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  attachments: [
                    ...task.attachments,
                    { ...attachment, id: crypto.randomUUID() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },
      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },
      getOverdueTasks: () => {
        const today = startOfToday();
        return get().tasks.filter(
          (task) =>
            task.status !== 'completed' &&
            isBefore(new Date(task.dueDate), today)
        );
      },
      getDueSoonTasks: () => {
        const today = startOfToday();
        const threeDaysFromNow = addDays(today, 3);
        return get().tasks.filter(
          (task) =>
            task.status !== 'completed' &&
            isAfter(new Date(task.dueDate), today) &&
            isBefore(new Date(task.dueDate), threeDaysFromNow)
        );
      },
      getTaskCompletion: () => {
        const tasks = get().tasks;
        if (tasks.length === 0) return 0;
        const completedTasks = tasks.filter(
          (task) => task.status === 'completed'
        ).length;
        return (completedTasks / tasks.length) * 100;
      },
    }),
    {
      name: 'task-store',
    }
  )
);
