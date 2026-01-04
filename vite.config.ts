import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files (dev/local) and ALSO read from process.env (CI/hosted).
  const envFromFiles = loadEnv(mode, process.cwd(), "");
  const readEnv = (key: string) =>
    (process.env[key] as string | undefined) ||
    (envFromFiles[key] as string | undefined) ||
    "";

  // Public backend config (safe for frontend).
  // Fallbacks keep the app booting even if the host temporarily fails to inject env.
  const FALLBACK_SUPABASE_URL = "https://iqiebyifudmlgdkvapsk.supabase.co";
  const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWVieWlmdWRtbGdka3ZhcHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Njg2MjcsImV4cCI6MjA4MTE0NDYyN30.5TM0dp8EGdq_2mHp9uTGmfoh66Ng0R92KPFvWEvtfWk";

  // Bridge backend-provided vars into VITE_* vars when needed.
  const supabaseUrl =
    readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL") || FALLBACK_SUPABASE_URL;
  const supabaseKey =
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    FALLBACK_SUPABASE_PUBLISHABLE_KEY;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    // Ensure the frontend always receives the required public backend config.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
    },
  };
});
