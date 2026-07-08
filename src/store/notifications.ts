import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { parseTime } from "./time";
import type { Routine } from "./types";

const ALARM_CHANNEL_ID = "alarms";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Max-importance Android channel so reminders ring like alarms instead of silent banners. */
async function ensureAlarmChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: "Routine Alarms",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  }).catch(() => {});
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const settings = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

export async function cancelRoutineNotifications(routine: Routine) {
  if (Platform.OS === "web") return;
  await Promise.all(
    routine.notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}

function alarmContent(title: string, body: string): Notifications.NotificationContentInput {
  return {
    title,
    body,
    sound: "default",
    // Breaks through Focus modes on iOS (needs the time-sensitive entitlement in standalone builds)
    interruptionLevel: "timeSensitive",
  };
}

/** One trigger per repeat day, matching the routine's frequency, at the given time. */
function triggersFor(
  routine: Routine,
  time: string
): Notifications.SchedulableNotificationTriggerInput[] {
  const { hour, minute } = parseTime(time);
  const channelId = ALARM_CHANNEL_ID;

  if (routine.frequency === "weekly" && routine.days.length > 0) {
    return routine.days.map((day) => ({
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: day + 1, // expo weekday is 1-indexed, 1 = Sunday
      hour,
      minute,
      channelId,
    }));
  }

  if (routine.frequency === "monthly") {
    const days = routine.days.length > 0 ? routine.days : [1];
    return days.map((day) => ({
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day,
      hour,
      minute,
      channelId,
    }));
  }

  return [
    { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId },
  ];
}

/**
 * (Re)schedules the alarms for a routine — one set for the routine's own time,
 * plus one set per timed task — and returns the new notification ids.
 */
export async function scheduleRoutineNotifications(routine: Routine): Promise<string[]> {
  if (Platform.OS === "web") return [];

  const plans: { content: Notifications.NotificationContentInput; time: string }[] = [];

  if (routine.time) {
    plans.push({
      content: alarmContent(
        routine.name,
        `Time for your ${routine.name.toLowerCase()} — ${routine.tasks.length} task${routine.tasks.length === 1 ? "" : "s"}.`
      ),
      time: routine.time,
    });
  }

  for (const task of routine.tasks) {
    if (!task.time) continue;
    plans.push({ content: alarmContent(routine.name, task.name), time: task.time });
  }

  if (plans.length === 0) return [];

  try {
    await ensureAlarmChannel();
    const ids = await Promise.all(
      plans.flatMap(({ content, time }) =>
        triggersFor(routine, time).map((trigger) =>
          Notifications.scheduleNotificationAsync({ content, trigger })
        )
      )
    );
    return ids;
  } catch {
    // Scheduling is best-effort (e.g. unavailable in some Expo Go configs)
    return [];
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
