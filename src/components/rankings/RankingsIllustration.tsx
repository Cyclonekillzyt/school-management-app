import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";

type Props = {
  rankings: any[];
};

export default function RankingsIllustration({ rankings }: Props) {
  const t = useTheme();

  const first = rankings[0];
  const second = rankings[1];
  const third = rankings[2];

  const PodiumCard = ({
    student,
    medal,
    position,
    height,
  }: {
    student: any;
    medal: string;
    position: string;
    height: number;
  }) => {
    if (!student) return <View style={{ flex: 1 }} />;

    const avatarColor = getAvatarColor(student.student_name);

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            marginBottom: 6,
          }}
        >
          {medal}
        </Text>

        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: avatarColor,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
            }}
          >
            {getInitials(student.student_name)}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={{
            color: t.foreground,
            fontWeight: "700",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          {student.student_name}
        </Text>

        <Text
          style={{
            color: t.primary,
            fontWeight: "700",
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {Number(student.percentage_score)}%
        </Text>

        <View
          style={{
            width: "85%",
            height,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: t.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: 18,
            }}
          >
            {position}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: t.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: t.cardBorder,
        padding: 20,
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons
          name="trophy"
          size={38}
          color="#f59e0b"
        />

        <Text
          style={{
            color: t.foreground,
            fontWeight: "800",
            fontSize: 18,
            marginTop: 8,
          }}
        >
          Class Leaders
        </Text>

        <Text
          style={{
            color: t.mutedForeground,
            marginTop: 4,
            fontSize: 13,
          }}
        >
          Top 3 Performing Students
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <PodiumCard
          student={second}
          medal="🥈"
          position="2"
          height={90}
        />

        <PodiumCard
          student={first}
          medal="🥇"
          position="1"
          height={135}
        />

        <PodiumCard
          student={third}
          medal="🥉"
          position="3"
          height={70}
        />
      </View>
    </View>
  );
}