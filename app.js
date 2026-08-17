import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handleChat, handleSensex, handleHealth } from "./lib/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "12mb" }));
app.get("/health", handleHealth);
app.head("/health", handleHealth);
app.post("/api/chat", (req, res) => handleChat(req, res));
app.get("/api/sensex", (req, res) => handleSensex(req, res));
app.use(express.static(path.join(__dirname, "dist")));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const Passenger = globalThis.PhusionPassenger;
if (typeof Passenger !== "undefined") {
  Passenger.configure({ autoInstall: false });
  app.listen("passenger");
} else {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0");
}
