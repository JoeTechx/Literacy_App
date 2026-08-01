// app.config.js - Replaces app.json. Reads env vars and injects them into the app via 'extra'.
// This file is committed. Secrets go in .env (which is gitignored).
const { config } = require('dotenv');
config(); // load .env file

module.exports = {
  expo: {
    name: "LiteracyApp",
    slug: "LiteracyApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-secure-store"],
    extra: {
      // This is the backend API URL. Set API_URL in your .env file.
      // For a physical device on the same WiFi, use your computer's local IP e.g. http://192.168.x.x:3000/api/v1
      // For Android emulator, use: http://10.0.2.2:3000/api/v1
      // For iOS simulator, use: http://localhost:3000/api/v1
      apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
    },
  },
};
