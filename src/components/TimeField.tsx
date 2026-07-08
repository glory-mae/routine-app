import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";
import { formatTime, parseTime, toTimeString } from "@/store/time";

type TimeFieldProps = {
  /** 24h "HH:mm" */
  value: string;
  onChange: (value: string) => void;
};

/**
 * "Time | 9:00 PM" row that expands into hour / minute steppers and an
 * AM/PM toggle when tapped.
 */
export function TimeField({ value, onChange }: TimeFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const { hour, minute } = parseTime(value);
  const isPM = hour >= 12;
  const h12 = hour % 12 === 0 ? 12 : hour % 12;

  const setHour12 = (nextH12: number) => {
    const wrapped = ((nextH12 - 1 + 12) % 12) + 1;
    const h24 = (wrapped % 12) + (isPM ? 12 : 0);
    onChange(toTimeString(h24, minute));
  };

  const stepMinute = (delta: number) => {
    const next = (minute + delta + 60) % 60;
    onChange(toTimeString(hour, next));
  };

  const setPeriod = (pm: boolean) => {
    if (pm === isPM) return;
    onChange(toTimeString((hour + 12) % 24, minute));
  };

  return (
    <View>
      <Pressable style={styles.row} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{formatTime(value)}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.picker}>
          <Stepper
            value={String(h12)}
            onUp={() => setHour12(h12 + 1)}
            onDown={() => setHour12(h12 - 1)}
          />
          <Text style={styles.colon}>:</Text>
          <Stepper
            value={String(minute).padStart(2, "0")}
            onUp={() => stepMinute(5)}
            onDown={() => stepMinute(-5)}
          />
          <View style={styles.periods}>
            {(["AM", "PM"] as const).map((p) => {
              const active = (p === "PM") === isPM;
              return (
                <Pressable
                  key={p}
                  style={[styles.period, active && styles.periodActive]}
                  onPress={() => setPeriod(p === "PM")}
                >
                  <Text style={[styles.periodText, active && styles.periodTextActive]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepButton} onPress={onUp} hitSlop={6}>
        <Text style={styles.stepGlyph}>▲</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable style={styles.stepButton} onPress={onDown} hitSlop={6}>
        <Text style={styles.stepGlyph}>▼</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.accent,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 14,
  },
  stepper: {
    alignItems: "center",
    gap: 2,
  },
  stepButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  stepGlyph: {
    fontSize: 12,
    color: colors.accent,
  },
  stepValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    minWidth: 36,
    textAlign: "center",
  },
  colon: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  periods: {
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: "rgba(120,120,128,0.12)",
    padding: 2,
    gap: 2,
  },
  period: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  periodActive: {
    backgroundColor: colors.cardBackground,
  },
  periodText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.accent,
  },
});
