import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadLocalEnv() {
  if (process.env.GROQ_API_KEY) return;
  try {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
    const text = fs.readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const split = trimmed.indexOf("=");
      if (split < 1) continue;
      const key = trimmed.slice(0, split).trim();
      let value = trimmed.slice(split + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

loadLocalEnv();

const TEXT_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
const VISION_MODELS = ["qwen/qwen3.8-27b"];

function groqErrorMessage(errText) {
  let msg = errText;
  try {
    const outer = JSON.parse(errText);
    if (typeof outer.error === "string") {
      try {
        msg = JSON.parse(outer.error).error?.message || outer.error;
      } catch {
        msg = outer.error;
      }
    } else {
      msg = outer.error?.message || outer.message || errText;
    }
  } catch {}
  return String(msg);
}

function groqWaitMs(status, errText) {
  if (status !== 429) return 0;
  const msg = groqErrorMessage(errText);
  const match = msg.match(/try again in ([\d.]+)s/i);
  if (match) return Math.min(15000, Math.ceil(parseFloat(match[1]) * 1000) + 400);
  return 3500;
}

function groqShouldTryNextModel(status, errText) {
  if (status === 404) return true;
  const msg = groqErrorMessage(errText).toLowerCase();
  return msg.includes("model") && (msg.includes("not exist") || msg.includes("not found"));
}

function buildGroqBody(model, messages) {
  const body = {
    model,
    temperature: 0,
    stream: true,
    messages,
  };
  if (model.startsWith("qwen/")) body.reasoning_effort = "none";
  return body;
}

async function readGroqStreamText(groqRes) {
  const reader = groqRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;
        const token = delta?.content;
        if (token) text += token;
      } catch {
        continue;
      }
    }
  }
  return text;
}

async function fetchGroqNonStreamText(groqKey, model, messages) {
  const baseUrl = LLM_BASE_URL.replace(/\/$/, "");
  const body = buildGroqBody(model, messages);
  body.stream = false;
  body.max_tokens = 8192;
  const groqRes = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!groqRes.ok) return "";
  const json = await groqRes.json();
  return json.choices?.[0]?.message?.content || "";
}

async function completeGroqChat(groqKey, models, messages) {
  const baseUrl = LLM_BASE_URL.replace(/\/$/, "");
  for (const model of models) {
    const payload = JSON.stringify(buildGroqBody(model, messages));
    for (let attempt = 0; attempt < 10; attempt++) {
      const groqRes = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: payload,
      });
      if (!groqRes.ok) {
        const errText = await groqRes.text();
        if (groqShouldTryNextModel(groqRes.status, errText)) break;
        if (groqRes.status === 429 && attempt < 9) {
          await new Promise((resolve) => setTimeout(resolve, groqWaitMs(groqRes.status, errText)));
          continue;
        }
        if (groqRes.status >= 500 && attempt < 9) {
          await new Promise((resolve) => setTimeout(resolve, 800 + attempt * 400));
          continue;
        }
        break;
      }
      let text = await readGroqStreamText(groqRes);
      if (!text.trim()) {
        text = await fetchGroqNonStreamText(groqKey, model, messages);
      }
      if (text.trim()) return text;
      break;
    }
  }
  return "";
}

export function handleHealth(req, res) {
  res.statusCode = 200;
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
}

export const LLM_MODEL = "qwen/qwen3.8-27b";
export const LLM_BASE_URL = "https://api.groq.com/openai/v1";

export const SYSTEM = `You solve exam and lab questions (coding, theory, Linux, networking, OS, blockchain, soft computing, Django ORM). Accuracy is the only priority.

Answer every question in the message; do not skip or invent questions. Use standard textbook/exam answers. For code: match required language, I/O, and constraints; no comments. For Linux: exact commands and output. For networking/OS/blockchain/soft computing: correct terms, layers, formulas, and methods. MCQ: give the correct option and value. Numericals: final answer unless steps are required.

For Django ORM / manage.py shell lab questions (project+app+model+insert/filter/order/aggregate/update/delete):
- Give only the VS Code / terminal process and Django shell ORM lines. Nothing else
- Do not print full models.py file content, no __str__, no long field definitions, no views/urls/admin/HTML
- VS Code process only: startproject, startapp, add app to INSTALLED_APPS, open models.py and create the model with the fields named in the question (one short class outline if needed, or just say create model X with fields ...), then makemigrations, migrate, shell
- Then shell only: imports, objects.create for inserts, then each required ORM line (filter, order_by, aggregate, values.annotate, update, delete)
- Use exact project name, app name, model name, and field names from the question
- No markdown fences, no theory, no extra variations unless asked
- Keep it short and paste-ready for the lab

Output: answers only; no markdown, backticks, or comments in code. Number each answer (1. 2. ...) even if there is only one. One blank line between answers. Theory: 4–8 short lines. Follow notes when given. For images: read every question and subpart; do not describe the image. For Django ORM questions output only VS Code process + shell ORM lines, not a full model file.

Format:
1.
<answer>

2.
<answer>`;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export async function handleChat(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  let body = req.body;
  if (!body) {
    try {
      body = await readBody(req);
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
  }

  const notesRaw = typeof body.notes === "string" ? body.notes.trim() : "";
  const notes = notesRaw.length > 8000 ? notesRaw.slice(0, 8000) : notesRaw;
  const messageRaw = typeof body.message === "string" ? body.message.trim() : "";
  const message = messageRaw.length > 12000 ? messageRaw.slice(0, 12000) : messageRaw;
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const imageOk = image.startsWith("data:image/");

  if (!message && !imageOk) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Message required" }));
    return;
  }

  const groqKey = process.env.GROQ_API_KEY || "";
  if (!groqKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "GROQ_API_KEY is not set" }));
    return;
  }

  const prompt = message
    ? notes
      ? `Notes:\n${notes}\n\nQuestions:\n${message}`
      : message
    : notes
      ? `Notes:\n${notes}\n\nRead every exam or lab question in this image and answer all of them.`
      : "Read every exam or lab question in this image and answer all of them.";

  const userContent = imageOk
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: image } },
      ]
    : prompt;

  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content: userContent },
  ];
  const models = imageOk ? VISION_MODELS : TEXT_MODELS;

  try {
    const answer = await completeGroqChat(groqKey, models, messages);

    if (!answer.trim()) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Server busy. Wait a few seconds and try again." }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(answer);
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message || "Server error" }));
      return;
    }
    res.end();
  }
}

export async function handleSensex(_req, res) {
  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?interval=1d&range=5d"
    );
    const json = await response.json();
    const meta = json.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const change = ((price - prev) / prev) * 100;
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ change: Number(change.toFixed(2)), price }));
  } catch {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ change: -0.09, price: 81240 }));
  }
}
