import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra;

export const ENV = {
  SUPABASE_URL: extra?.supabaseUrl as string,
  SUPABASE_PUBLISHABLE_KEY: extra?.supabasePublishableKey as string,
};
