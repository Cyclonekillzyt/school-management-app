import React from "react";
import { View, Text, TextInput } from "react-native";
import { SCORE_LIMITS } from "@/constants/assessmentContants";

type SelectedAssessment = keyof typeof SCORE_LIMITS;

type Props = {
  s: any;
  t: any;
  getValue: (s: any) => any;
  inputRefs: any;
  borderColor: any;
  selectedAssessment: SelectedAssessment;
  setInputStatus: (p: any) => void;
  updateScore: (
    studentId: any,
    assessment: SelectedAssessment,
    value: number | null,
  ) => void;
  inputStatus: any;
  students: any[];
};

export default function StudentRow({
  s,
  t,
  getValue,
  inputRefs,
  borderColor,
  selectedAssessment,
  setInputStatus,
  updateScore,
  inputStatus,
  students,
}: Props) {
  const key = `${s.student_id}-${selectedAssessment}`;

  return (
    <View
      style={{
        flexDirection: "row",
        padding: 12,
        borderBottomWidth: 1,
        borderColor: t.border,
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: t.foreground,
            fontWeight: "600",
          }}
        >
          {s.student_name}
        </Text>
      </View>

      <TextInput
        value={String(getValue(s) ?? "")}
        ref={(ref) => {
          inputRefs.current[s.student_id] = ref;
        }}
        keyboardType="numeric"
        style={{
          width: 70,
          backgroundColor: t.card,
          padding: 8,
          borderRadius: 8,
          textAlign: "center",
          color: t.foreground,
          borderWidth: 1,
          borderColor,
        }}
        onChangeText={(text) => {
          const max = SCORE_LIMITS[selectedAssessment];
          const num = text === "" ? null : Number(text);

          if (text === "") {
            setInputStatus((p: any) => ({ ...p, [key]: "empty" }));
            updateScore(s.student_id, selectedAssessment, null);
            return;
          }

          if (num === null || isNaN(num) || num > max || num < 0) {
            setInputStatus((p: any) => ({ ...p, [key]: "invalid" }));
            updateScore(s.student_id, selectedAssessment, 0);
            return;
          }

          setInputStatus((p: any) => ({ ...p, [key]: "valid" }));
          updateScore(s.student_id, selectedAssessment, num);
        }}
        onSubmitEditing={() => {
          const index = students.findIndex(
            (st: any) => st.student_id === s.student_id,
          );

          const next = students[index + 1];

          if (next) {
            inputRefs.current[next.student_id]?.focus();
          }
        }}
        returnKeyType="next"
      />
    </View>
  );
}
