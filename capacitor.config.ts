import type { CapacitorConfig } from "@capacitor/cli";

/**
 * AG Fresh Eggs is a full Next.js app with a live server (Supabase, Razorpay, Gemini) —
 * it can't be statically exported into the app bundle. This config makes the native
 * shell load the real deployed site directly, same as a browser would. Everything
 * (checkout, AI assistant, admin dashboard) works exactly as it does on the web.
 */
const config: CapacitorConfig = {
  appId: "com.agenterprises.freshegs",
  appName: "AG Fresh Eggs",
  webDir: "public",
  server: {
    url: "https://ag-fresh-eggs.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
