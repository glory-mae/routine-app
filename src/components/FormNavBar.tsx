import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";

type FormNavBarProps = {
  title: string;
  onCancel: () => void;
  onSave: () => void;
};

export function FormNavBar({ title, onCancel, onSave }: FormNavBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable onPress={onCancel}>
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onSave}>
        <Text style={styles.save}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  cancel: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  save: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.accent,
  },
});
