import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";

type Props = {
  rankings: any[];
};

export default function RankingsTable({ rankings }: Props) {
  const t = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: t.card,
        borderWidth: 1,
        borderColor: t.cardBorder,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {/* Header */}

      <View
        style={{
          flexDirection: "row",
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: t.muted,
          borderBottomWidth: 1,
          borderColor: t.border,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            width: 35,
            color: t.foreground,
            fontWeight: "700",
            fontSize: 12,
          }}
        >
          #
        </Text>

        <Text
          style={{
            flex: 1,
            color: t.foreground,
            fontWeight: "700",
            fontSize: 12,
          }}
        >
          Student
        </Text>

        <Text
          style={{
            width: 70,
            textAlign: "right",
            color: t.foreground,
            fontWeight: "700",
            fontSize: 12,
          }}
        >
          %
        </Text>
      </View>

      {rankings.slice(3).map((student: any, index: number) => (
        <View
          key={student.student_id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: index === rankings.length - 1 ? 0 : 1,
            borderColor: t.border,
          }}
        >
          <Text
            style={{
              width: 35,
              color: t.foreground,
              fontWeight: "700",
            }}
          >
            {student.position}
          </Text>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: getAvatarColor(student.student_name),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {getInitials(student.student_name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: t.foreground,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {student.student_name}
              </Text>

              <Text
                style={{
                  color: t.mutedForeground,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Position #{student.position}
              </Text>
            </View>
          </View>

          <Text
            style={{
              width: 70,
              textAlign: "right",
              color: t.primary,
              fontWeight: "800",
              fontSize: 14,
            }}
          >
            {Number(student.percentage_score)}%
          </Text>
        </View>
      ))}

      {rankings.length === 0 && (
        <View
          style={{
            padding: 30,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: t.mutedForeground,
            }}
          >
            No rankings available.
          </Text>
        </View>
      )}
    </View>
  );
}
