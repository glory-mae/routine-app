# Rune — Routine Tracker

**A calm, minimal iOS app for building daily, weekly and monthly routines, with gentle reminders at the times you choose.**

## Overview

Rune helps people turn habits into routines. You group small tasks into a routine like "Morning Routine" or "Night Skincare", choose how often it repeats, and check off tasks as you go. The home screen shows every routine with its next scheduled time, so you always know what's coming up today, tomorrow, or later in the month.

The design is warm and quiet: soft cards, a single terracotta accent, generous spacing and native iOS sheet presentations. It's meant to feel like a companion, not a productivity tool.

## Screens

| | |
|---|---|
| `01-onboarding.png` | **Onboarding.** A friendly, permission-first prompt that explains reminders only fire at the times you set. |
| `02-home.png` | **Home.** All routines at a glance, with frequency badges and a smart "Next" label (Today, Tomorrow, or a date). |
| `03-routine-detail.png` | **Routine detail.** Check off tasks with a satisfying strike-through. Individual tasks can have their own time. |
| `04-edit-task.png` | **Task editor.** A custom time stepper with an AM/PM toggle, and a tap-to-reorder position list. |
| `05-edit-routine.png` | **Routine editor.** A segmented Daily/Weekly/Monthly control and a calendar grid for picking days of the month. |

## Key features

- **Flexible schedules:** daily routines, one or more weekdays, or specific days of the month.
- **Local reminders:** reminders for the routine and for each timed task, rescheduled automatically whenever a routine changes.
- **Smart "next occurrence" labels:** the next time is worked out from the current time and the routine's schedule.
- **Task ordering:** move a task by tapping where it should go, without fiddly drag gestures.
- **Offline-first:** everything is stored on the device, with no account or network needed.
- **Thoughtful onboarding:** notification permission is asked for with context, and skipping is always possible.

## Tech stack

- **React Native 0.86** with **Expo SDK 57** (TypeScript)
- **Expo Router** for file-based navigation, with native modal sheets for the editors
- **React Compiler** for automatic memoization
- **expo-sqlite** (key-value store) for persistence
- **expo-notifications** for scheduled daily, weekly and monthly reminders
- A custom component set (toggle rows, time stepper, month grid, form nav bar) built on a small shared theme of colors, typography and card styles

## My role

Designed and built the app end to end: UX and visual design, app structure, state and persistence, notification scheduling, and testing on the iOS Simulator.

---

### Short version (for a portfolio card)

> **Rune** is a minimal iOS routine tracker built with React Native and Expo. Users group tasks into daily, weekly or monthly routines, check them off, and get gentle local reminders at the times they choose. It's offline-first, with a warm, calm design and custom form controls.
