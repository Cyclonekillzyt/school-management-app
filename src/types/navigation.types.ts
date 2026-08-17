import { Assignment } from "./dashboard.types";

export type AuthStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  VerifyResetCode: undefined;
  NewPassword: undefined;
};

export type TeacherTabsParamList = {
  Home: undefined;
  Classes: undefined;
  People: undefined;
  Rankings: undefined;
  Settings: undefined;
};

export type TeacherStackParamList = {
  AssessmentEntry: {
    assignment: Assignment;
  };
};
