import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { colors } from "@/theme";
import { sharedStyles } from "@/theme/shared";
import { FieldLabel } from "@/components/FieldLabel";
import { ToggleRow } from "@/components/ToggleRow";
import { FormNavBar } from "@/components/FormNavBar";
import { MonthDayGrid } from "@/components/MonthDayGrid";
import { TimeField } from "@/components/TimeField";
import { useRoutineStore } from "@/store/routine-store";
import type { Frequency } from "@/store/types";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const FREQUENCIES: { label: string; value: Frequency }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];
const DEFAULT_TIME = "21:00";

export default function RoutineEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getRoutine, addRoutine, updateRoutine } = useRoutineStore();
  const existing = id ? getRoutine(id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  // Latest typed text, read by save() so a tap right after typing never sees a stale name.
  const nameRef = useRef(name);
  const changeName = (text: string) => {
    nameRef.current = text;
    setName(text);
  };
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? "daily");
  const [days, setDays] = useState<number[]>(
    existing?.frequency === "weekly" ? existing.days : []
  );
  const [multiDay, setMultiDay] = useState(
    existing?.frequency === "weekly" && existing.days.length > 1
  );
  const [monthDays, setMonthDays] = useState<number[]>(
    existing?.frequency === "monthly" ? existing.days : []
  );
  const [hasTime, setHasTime] = useState(!!existing?.time);
  const [time, setTime] = useState(existing?.time ?? DEFAULT_TIME);

  const toggleDay = (day: number) => {
    setDays((current) => {
      if (current.includes(day)) return current.filter((d) => d !== day);
      return multiDay ? [...current, day].sort() : [day];
    });
  };

  const toggleMonthDay = (day: number) => {
    setMonthDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b)
    );
  };

  const save = () => {
    const trimmed = nameRef.current.trim();
    if (!trimmed) {
      Alert.alert("Name Required", "Give your routine a name before saving.");
      return;
    }
    if (frequency === "weekly" && days.length === 0) {
      Alert.alert("Pick a Day", "Choose at least one day for a weekly routine.");
      return;
    }
    if (frequency === "monthly" && monthDays.length === 0) {
      Alert.alert("Pick a Day", "Choose at least one day of the month for a monthly routine.");
      return;
    }
    const draft = {
      name: trimmed,
      frequency,
      days: frequency === "weekly" ? days : frequency === "monthly" ? monthDays : [],
      time: hasTime ? time : undefined,
    };
    if (existing) {
      updateRoutine(existing.id, draft);
      router.back();
    } else {
      const routine = addRoutine(draft);
      router.dismiss();
      router.push({ pathname: "/routine-detail", params: { id: routine.id } });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FormNavBar
        title={existing ? "Edit Routine" : "New Routine"}
        onCancel={() => router.back()}
        onSave={save}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <FieldLabel>Name</FieldLabel>
          <View style={[styles.field, sharedStyles.card]}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={changeName}
              placeholder="e.g. Night Routine"
              placeholderTextColor={colors.textSecondary}
              autoFocus={!existing}
            />
          </View>
        </View>

        <View>
          <FieldLabel>Frequency</FieldLabel>
          <View style={styles.segment}>
            {FREQUENCIES.map(({ label, value }) => (
              <Pressable
                key={value}
                style={[styles.segmentOption, frequency === value && styles.segmentOptionActive]}
                onPress={() => setFrequency(value)}
              >
                <Text
                  style={[styles.segmentText, frequency === value && styles.segmentTextActive]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {frequency === "weekly" && (
          <>
            <View style={[styles.field, sharedStyles.card]}>
              <ToggleRow
                label="Repeat multiple days a week"
                value={multiDay}
                onValueChange={(next) => {
                  setMultiDay(next);
                  if (!next) setDays((current) => current.slice(0, 1));
                }}
              />
            </View>

            <View>
              <FieldLabel>Days</FieldLabel>
              <View style={styles.days}>
                {DAY_LABELS.map((label, index) => {
                  const selected = days.includes(index);
                  return (
                    <Pressable
                      key={`${label}-${index}`}
                      style={[styles.day, selected && styles.daySelected]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {frequency === "monthly" && (
          <View>
            <FieldLabel>Days of the Month</FieldLabel>
            <MonthDayGrid selected={monthDays} onToggle={toggleMonthDay} />
          </View>
        )}

        <View style={[styles.field, sharedStyles.card, { gap: 0 }]}>
          <ToggleRow label="Set a time" value={hasTime} onValueChange={setHasTime} />
          {hasTime && (
            <View style={{ marginTop: 14 }}>
              <TimeField value={time} onChange={setTime} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
    gap: 20,
  },
  field: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(120,120,128,0.12)",
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  segmentOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 11,
  },
  segmentOptionActive: {
    backgroundColor: colors.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B6B70",
  },
  segmentTextActive: {
    fontWeight: "700",
    color: colors.accent,
  },
  days: {
    flexDirection: "row",
    gap: 7,
  },
  day: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
