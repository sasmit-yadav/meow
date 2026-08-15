import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleChat, handleSensex } from "./lib/api.js";

function groqPlugin() {
  return {
    name: "groq-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", handleChat);
      server.middlewares.use("/api/sensex", handleSensex);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/chat", handleChat);
      server.middlewares.use("/api/sensex", handleSensex);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GROQ_API_KEY && !process.env.GROQ_API_KEY) {
    process.env.GROQ_API_KEY = env.GROQ_API_KEY;
  }
  return {
    plugins: [react(), groqPlugin()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: true,
    },
  };
});
