import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  progress: number;
  size?: number;
  stroke?: number;
};

export default function ProgressRing({
  progress,
  size = 100,
  stroke = 10,
}: Props) {
  const theme = useTheme();

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.muted}
          strokeWidth={stroke}
          fill="transparent"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text
          style={[
            styles.percent,
            {
              color: theme.foreground,
            },
          ]}
        >
          {progress}%
        </Text>

        <Text
          style={[
            styles.label,
            {
              color: theme.mutedForeground,
            },
          ]}
        >
          Done
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  percent: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },

  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
