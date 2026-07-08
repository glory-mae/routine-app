import type { Routine } from "./types";

export function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

export function toTimeString(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "21:30" → "9:30 PM" */
export function formatTime(time: string) {
  const { hour, minute } = parseTime(time);
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

/** Header subtitle, e.g. "Friday, July 3" */
export function formatToday(now = new Date()) {
  return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** "Next: Today, 7:00 AM" style label for a routine card, or null when untimed */
export function nextOccurrenceLabel(routine: Routine, now = new Date()): string | null {
  if (!routine.time) return null;
  const { hour, minute } = parseTime(routine.time);
  const timeLabel = formatTime(routine.time);
  const passedToday =
    now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);

  if (routine.frequency === "daily") {
    return `${passedToday ? "Tomorrow" : "Today"}, ${timeLabel}`;
  }

  if (routine.frequency === "weekly" && routine.days.length > 0) {
    const today = now.getDay();
    for (let offset = 0; offset < 8; offset++) {
      const day = (today + offset) % 7;
      if (!routine.days.includes(day)) continue;
      if (offset === 0 && passedToday) continue;
      if (offset === 0) return `Today, ${timeLabel}`;
      if (offset === 1) return `Tomorrow, ${timeLabel}`;
      return `${WEEKDAYS[day]}, ${timeLabel}`;
    }
    return `${WEEKDAYS[routine.days[0]]}, ${timeLabel}`;
  }

  if (routine.frequency === "monthly") {
    if (routine.days.length === 0) return `Monthly, ${timeLabel}`;
    for (let offset = 0; offset < 62; offset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      if (!routine.days.includes(date.getDate())) continue;
      if (offset === 0 && passedToday) continue;
      if (offset === 0) return `Today, ${timeLabel}`;
      if (offset === 1) return `Tomorrow, ${timeLabel}`;
      const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${dateLabel}, ${timeLabel}`;
    }
    return `Monthly, ${timeLabel}`;
  }

  return timeLabel;
}
