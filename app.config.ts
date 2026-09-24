import "dotenv/config";

export default {
  expo: {
    name: "school-management-app",
    slug: "school-management-app",
    version: "1.0.0",
    ios: {
      bundleIdentifier: "com.cycloneking.schoolmanagementapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.cycloneking.schoolmanagementapp",
      versionCode: 1,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      eas: {
        projectId: "73489df7-ee7d-4ca0-8f20-6c9772137794",
      },
    },
    plugins: ["expo-sharing", "expo-splash-screen"],
  },
};
