export type Frequency = "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  name: string;
  /** 24h "HH:mm", unset when the task has no time */
  time?: string;
  done: boolean;
};

export type Routine = {
  id: string;
  name: string;
  frequency: Frequency;
  /** Weekly: selected weekdays (0 = Sunday). Monthly: selected days of the month (1–31). */
  days: number[];
  /** 24h "HH:mm", unset when the routine has no time */
  time?: string;
  tasks: Task[];
  /** Ids of scheduled local notifications so they can be cancelled on change */
  notificationIds: string[];
};

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
