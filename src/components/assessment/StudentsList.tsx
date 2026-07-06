import StudentRow from "./StudentRow";

export default function StudentsList({
  students,
  selectedAssessment,
  inputStatus,
  inputRefs,
  setInputStatus,
  updateScore,
  getValue,
  t,
}: any) {
  return (
    <>
      {students.map((s: any) => {
        const key = `${s.student_id}-${selectedAssessment}`;

        const borderColor =
          inputStatus[key] === "invalid"
            ? "#ef4444"
            : inputStatus[key] === "valid"
              ? "#eab208"
              : t.border;

        return (
          <StudentRow
            key={s.student_id}
            s={s}
            t={t}
            getValue={getValue}
            inputRefs={inputRefs}
            borderColor={borderColor}
            selectedAssessment={selectedAssessment}
            setInputStatus={setInputStatus}
            updateScore={updateScore}
            inputStatus={inputStatus}
            students={students}
          />
        );
      })}
    </>
  );
}
