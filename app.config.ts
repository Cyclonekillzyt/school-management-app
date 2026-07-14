import "dotenv/config";

export default {
  expo: {
    name: "school-management-app",
    slug: "school-management-app",
    version: "1.0.0",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
    plugins: ["expo-sharing"],
  },
};
