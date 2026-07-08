import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";
import { sharedStyles } from "@/theme/shared";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type MonthDayGridProps = {
  selected: number[];
  onToggle: (day: number) => void;
};

export function MonthDayGrid({ selected, onToggle }: MonthDayGridProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <View style={[styles.container, sharedStyles.card]}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>

      <View style={styles.grid}>
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.cell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}

        {Array.from({ length: firstWeekday }, (_, i) => (
          <View key={`blank-${i}`} style={styles.cell} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isSelected = selected.includes(day);
          const isToday = day === today;
          return (
            <View key={day} style={styles.cell}>
              <Pressable
                style={[styles.day, isToday && !isSelected && styles.dayToday, isSelected && styles.daySelected]}
                onPress={() => onToggle(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && !isSelected && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 14,
    gap: 10,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
  },
  cell: {
    // Seven columns per row, like a calendar month
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  dayTextToday: {
    color: colors.accent,
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
