module.exports = {
  name: "WithMe Travel",
  slug: "withme-travel",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "travel.withme.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "travel.withme.mobile"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.withme.travel",
    eas: {
      projectId: "f7522d2e-9d01-4e6b-8857-00c138bc9570"
    }
  }
  // Remove the plugins array as we're not configuring them properly yet
};
