import { ReactNode } from "react";

export type Role = "admin" | "teacher";

export type User = {
  id: string;
  email: string | null;
  role: Role | null;
  userName: string | null;
  gender: string | null
};

export type Profile = {
  role: Role | null;
  full_name: string;
  email: string | null;
  gender: string | null;
};

export type AuthState = {
  user: User | null;
  authLoading: boolean;
  signInLoading: boolean;

  signIn: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  getSession: () => Promise<void>;
  getProfile: (userId: string) => Promise<Profile | null>;
};

export type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: ReactNode;
  secureTextEntry?: boolean;
  rightIcon?: ReactNode;
  borderColor?: string;
};

