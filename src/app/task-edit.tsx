import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { colors } from "@/theme";
import { sharedStyles } from "@/theme/shared";
import { FieldLabel } from "@/components/FieldLabel";
import { ToggleRow } from "@/components/ToggleRow";
import { FormNavBar } from "@/components/FormNavBar";
import { TimeField } from "@/components/TimeField";
import { useRoutineStore } from "@/store/routine-store";
import { formatTime } from "@/store/time";

const DEFAULT_TIME = "21:30";

export default function TaskEdit() {
  const { routineId, taskId } = useLocalSearchParams<{ routineId: string; taskId?: string }>();
  const { getRoutine, addTask, updateTask } = useRoutineStore();
  const routine = getRoutine(routineId ?? "");
  const existing = taskId ? routine?.tasks.find((t) => t.id === taskId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [hasTime, setHasTime] = useState(!!existing?.time);
  const [time, setTime] = useState(existing?.time ?? routine?.time ?? DEFAULT_TIME);

  // Other tasks, in order — the edited/new task is rendered at `position` among them.
  const otherTasks = useMemo(
    () => routine?.tasks.filter((t) => t.id !== taskId) ?? [],
    [routine, taskId]
  );
  const [position, setPosition] = useState(() => {
    if (!routine || !existing) return otherTasks.length;
    return routine.tasks.findIndex((t) => t.id === existing.id);
  });

  if (!routine) {
    return <SafeAreaView style={styles.screen} edges={["top"]} />;
  }

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name Required", "Give your task a name before saving.");
      return;
    }
    const draft = { name: trimmed, time: hasTime ? time : undefined };
    if (existing) {
      updateTask(routine.id, existing.id, draft, position);
    } else {
      addTask(routine.id, draft, position);
    }
    router.back();
  };

  // Rows for the position list: other tasks with the active row inserted at `position`
  const rows: { key: string; title: string; time?: string; active: boolean }[] = otherTasks.map(
    (t) => ({ key: t.id, title: t.name, time: t.time, active: false })
  );
  rows.splice(position, 0, {
    key: "__active__",
    title: name.trim() || "New task",
    time: hasTime ? time : undefined,
    active: true,
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FormNavBar
        title={existing ? "Edit Task" : "New Task"}
        onCancel={() => router.back()}
        onSave={save}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <FieldLabel>Task Name</FieldLabel>
          <View style={[styles.field, sharedStyles.card]}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Apply serum"
              placeholderTextColor={colors.textSecondary}
              autoFocus={!existing}
            />
          </View>
        </View>

        <View style={[styles.field, sharedStyles.card]}>
          <ToggleRow label="Set a time" value={hasTime} onValueChange={setHasTime} />
          {hasTime && (
            <View style={{ marginTop: 14 }}>
              <TimeField value={time} onChange={setTime} />
            </View>
          )}
        </View>

        {rows.length > 1 && (
          <View>
            <FieldLabel>Position in List</FieldLabel>
            <View style={[styles.positionList, sharedStyles.card]}>
              {rows.map((row, index) => (
                <Pressable
                  key={row.key}
                  style={[
                    styles.positionRow,
                    index < rows.length - 1 && styles.positionRowDivider,
                    row.active && styles.positionRowActive,
                  ]}
                  onPress={() => {
                    if (!row.active) setPosition(index);
                  }}
                >
                  <DragDots active={row.active} />
                  <Text style={[styles.positionTitle, row.active && styles.positionTitleActive]}>
                    {row.title}
                  </Text>
                  {row.time && (
                    <Text style={[styles.positionTime, row.active && styles.positionTimeActive]}>
                      {formatTime(row.time)}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
            <Text style={styles.positionHint}>Tap a row to move this task there.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DragDots({ active }: { active: boolean }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.dot, active && styles.dotActive]} />
      ))}
    </View>
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
  positionList: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
  },
  positionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  positionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  positionRowActive: {
    backgroundColor: "rgba(217,119,87,0.07)",
  },
  dots: {
    width: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    justifyContent: "center",
  },
  dot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#C7C7CC",
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  positionTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  positionTitleActive: {
    fontWeight: "600",
    color: colors.accent,
  },
  positionTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  positionTimeActive: {
    color: colors.accent,
  },
  positionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 4,
  },
});
