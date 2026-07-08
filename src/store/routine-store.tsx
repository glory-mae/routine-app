import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Storage from "expo-sqlite/kv-store";

import {
  cancelAllNotifications,
  cancelRoutineNotifications,
  scheduleRoutineNotifications,
} from "./notifications";
import { createId, type Routine, type Task } from "./types";

const ROUTINES_KEY = "routines.v1";
const SETTINGS_KEY = "settings.v1";

type Settings = {
  notificationsEnabled: boolean;
  hasOnboarded: boolean;
};

const DEFAULT_SETTINGS: Settings = { notificationsEnabled: false, hasOnboarded: false };

type RoutineDraft = Pick<Routine, "name" | "frequency" | "days" | "time">;
type TaskDraft = Pick<Task, "name" | "time">;

type StoreValue = {
  routines: Routine[];
  settings: Settings;
  getRoutine: (id: string) => Routine | undefined;
  addRoutine: (draft: RoutineDraft) => Routine;
  updateRoutine: (id: string, draft: RoutineDraft) => void;
  deleteRoutine: (id: string) => void;
  addTask: (routineId: string, draft: TaskDraft, position?: number) => void;
  updateTask: (routineId: string, taskId: string, draft: TaskDraft, position?: number) => void;
  deleteTask: (routineId: string, taskId: string) => void;
  toggleTask: (routineId: string, taskId: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  markOnboarded: () => void;
  clearAllData: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = Storage.getItemSync(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function loadRoutines(): Routine[] {
  try {
    const raw = Storage.getItemSync(ROUTINES_KEY);
    return raw ? (JSON.parse(raw) as Routine[]) : [];
  } catch {
    return [];
  }
}

export function RoutineStoreProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>(loadRoutines);
  const [settings, setSettings] = useState<Settings>(() =>
    loadJson(SETTINGS_KEY, DEFAULT_SETTINGS)
  );
  const settingsRef = useRef(settings);

  const persistRoutines = useCallback((next: Routine[]) => {
    setRoutines(next);
    Storage.setItem(ROUTINES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistSettings = useCallback((next: Settings) => {
    settingsRef.current = next;
    setSettings(next);
    Storage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  /** Cancels a routine's old reminders and schedules fresh ones, storing the new ids. */
  const resyncNotifications = useCallback(
    async (routine: Routine) => {
      await cancelRoutineNotifications(routine);
      const ids = settingsRef.current.notificationsEnabled
        ? await scheduleRoutineNotifications(routine)
        : [];
      setRoutines((current) => {
        const next = current.map((r) => (r.id === routine.id ? { ...r, notificationIds: ids } : r));
        Storage.setItem(ROUTINES_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const getRoutine = useCallback((id: string) => routines.find((r) => r.id === id), [routines]);

  const addRoutine = useCallback(
    (draft: RoutineDraft) => {
      const routine: Routine = { ...draft, id: createId(), tasks: [], notificationIds: [] };
      persistRoutines([...routines, routine]);
      void resyncNotifications(routine);
      return routine;
    },
    [routines, persistRoutines, resyncNotifications]
  );

  const updateRoutine = useCallback(
    (id: string, draft: RoutineDraft) => {
      const existing = routines.find((r) => r.id === id);
      if (!existing) return;
      const updated = { ...existing, ...draft };
      persistRoutines(routines.map((r) => (r.id === id ? updated : r)));
      void resyncNotifications(updated);
    },
    [routines, persistRoutines, resyncNotifications]
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      const existing = routines.find((r) => r.id === id);
      if (existing) void cancelRoutineNotifications(existing);
      persistRoutines(routines.filter((r) => r.id !== id));
    },
    [routines, persistRoutines]
  );

  const mutateTasks = useCallback(
    (routineId: string, mutate: (tasks: Task[]) => Task[], resync = true) => {
      const existing = routines.find((r) => r.id === routineId);
      if (!existing) return;
      const updated = { ...existing, tasks: mutate(existing.tasks) };
      persistRoutines(routines.map((r) => (r.id === routineId ? updated : r)));
      if (resync) void resyncNotifications(updated);
    },
    [routines, persistRoutines, resyncNotifications]
  );

  const addTask = useCallback(
    (routineId: string, draft: TaskDraft, position?: number) => {
      mutateTasks(routineId, (tasks) => {
        const task: Task = { ...draft, id: createId(), done: false };
        const next = [...tasks];
        next.splice(position ?? tasks.length, 0, task);
        return next;
      });
    },
    [mutateTasks]
  );

  const updateTask = useCallback(
    (routineId: string, taskId: string, draft: TaskDraft, position?: number) => {
      mutateTasks(routineId, (tasks) => {
        const index = tasks.findIndex((t) => t.id === taskId);
        if (index === -1) return tasks;
        const updated = { ...tasks[index], ...draft };
        const next = tasks.filter((t) => t.id !== taskId);
        next.splice(position ?? index, 0, updated);
        return next;
      });
    },
    [mutateTasks]
  );

  const deleteTask = useCallback(
    (routineId: string, taskId: string) => {
      mutateTasks(routineId, (tasks) => tasks.filter((t) => t.id !== taskId));
    },
    [mutateTasks]
  );

  const toggleTask = useCallback(
    (routineId: string, taskId: string) => {
      mutateTasks(
        routineId,
        (tasks) => tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        false
      );
    },
    [mutateTasks]
  );

  const setNotificationsEnabled = useCallback(
    (enabled: boolean) => {
      persistSettings({ ...settingsRef.current, notificationsEnabled: enabled });
      if (enabled) {
        for (const routine of routines) void resyncNotifications(routine);
      } else {
        void cancelAllNotifications();
      }
    },
    [routines, persistSettings, resyncNotifications]
  );

  const markOnboarded = useCallback(() => {
    persistSettings({ ...settingsRef.current, hasOnboarded: true });
  }, [persistSettings]);

  const clearAllData = useCallback(() => {
    void cancelAllNotifications();
    persistRoutines([]);
    persistSettings({ ...DEFAULT_SETTINGS, hasOnboarded: true });
  }, [persistRoutines, persistSettings]);

  const value = useMemo<StoreValue>(
    () => ({
      routines,
      settings,
      getRoutine,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      setNotificationsEnabled,
      markOnboarded,
      clearAllData,
    }),
    [
      routines,
      settings,
      getRoutine,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      setNotificationsEnabled,
      markOnboarded,
      clearAllData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useRoutineStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useRoutineStore must be used within RoutineStoreProvider");
  return ctx;
}
