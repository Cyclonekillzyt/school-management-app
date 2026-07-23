import { View, Text, ScrollView } from "react-native";

const columns = [
  { key: "student_name", label: "Student Name", width: 180 },

  { key: "classwork", label: "CW", width: 70 },

  { key: "groupwork", label: "GW", width: 70 },

  { key: "projectwork", label: "PW", width: 70 },

  { key: "test", label: "Test", width: 70 },

  { key: "exam_score", label: "Exam", width: 70 },
];

export default function ExportTable({ students, t }: any) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View
        style={{
          margin: 16,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >

        <View
          style={{
            flexDirection: "row",
            backgroundColor: t.muted,
          }}
        >
          {columns.map((c) => (
            <View
              key={c.key}
              style={{
                width: c.width,
                padding: 12,
                borderRightWidth: 1,
                borderColor: t.border,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: t.foreground,
                  textAlign: c.key === "student_name" ? "left" : "center",
                }}
              >
                {c.label}
              </Text>
            </View>
          ))}
        </View>


        {students.map((student: any) => (
          <View
            key={student.student_id}
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: t.border,
            }}
          >
            {columns.map((column) => (
              <View
                key={column.key}
                style={{
                  width: column.width,
                  padding: 12,
                  borderRightWidth: 1,
                  borderColor: t.border,
                }}
              >
                <Text
                  style={{
                    color: t.foreground,
                    textAlign:
                      column.key === "student_name" ? "left" : "center",
                  }}
                >
                  {student[column.key] ?? ""}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
