import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
};

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <Pressable style={styles.row} onPress={() => onValueChange?.(!value)}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.track, !value && styles.trackOff]}>
        <View style={[styles.knob, !value && styles.knobOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  track: {
    width: 51,
    height: 31,
    borderRadius: 999,
    backgroundColor: colors.accent,
    justifyContent: "center",
  },
  trackOff: {
    backgroundColor: "rgba(120,120,128,0.16)",
  },
  knob: {
    width: 27,
    height: 27,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginLeft: "auto",
    marginRight: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  knobOff: {
    marginLeft: 2,
    marginRight: "auto",
  },
});
