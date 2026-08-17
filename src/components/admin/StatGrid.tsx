import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Stat = {
  label: string;
  value: number | string;
};

type Props = {
  stats: Stat[];
};

export default function StatGrid({ stats }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <Text style={[styles.value, { color: theme.foreground }]}>
            {stat.value}
          </Text>
          <Text style={[styles.label, { color: theme.mutedForeground }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: "31%",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
