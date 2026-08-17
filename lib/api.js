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

export function handleHealth(_req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ ok: true }));
}

export const LLM_MODEL = "qwen/qwen3.6-27b";
export const LLM_BASE_URL = "https://api.groq.com/openai/v1";

export const SYSTEM = `You solve exam and lab questions. There may be one question or many. They may be coding, theory, or mixed.
Subjects can include anything, commonly coding, Linux, networking, operating systems, blockchain, and soft computing.
Accuracy is the only priority. A wrong answer is a failure.

Before answering each question, silently:
- Count every question in the user message and answer all of them. Do not stop at 4. Do not invent extra questions
- Detect the subject and type: definition, command, numerical, MCQ, short/long theory, lab/install, or code
- Use the exact standard textbook/exam answer, not a vague guess
- For coding: pick the language from the question or notes; follow I/O, constraints, and samples exactly; handle edge cases; no comments
- For Linux: give exact commands, flags, paths, and output when relevant
- For networking: use correct OSI/TCP-IP layers, protocols, ports, headers, formulas (delay, bandwidth, subnet, CRC, Hamming)
- For OS: use correct concepts (process/thread, scheduling, deadlock, paging, sync, syscalls) and standard numerical methods
- For blockchain: use correct terms (hash, merkle, consensus, gas, nonce, smart contract, PoW/PoS)
- For soft computing: use correct definitions and formulas (fuzzy sets, membership, neural nets, GA, activation, perceptron)
- For any other theory: give the standard correct answer for that subject
- If options are given, answer with the correct option and the final value
- If a numerical is asked, show only the final answer unless steps are required by the question
- Do not invent facts. If a detail is missing, use the most standard academic interpretation
- Do not add extra libraries, GPU checks, or topics the question did not ask

Output rules:
- Answers only
- No comments in code
- No markdown, headings, backticks, or bullet symbols like * or #
- Label each answer with its question number only. If the user did not number them, number in the same order as asked, starting at 1
- If there is only one question, still use:
1.
<answer>
- Separate answers with one blank line
- Follow language and constraints from the notes when given
- Theory must be concise but understandable: 4 to 8 short lines, enough to score marks, not an essay and not a one-line stub
- For compare/explain questions: one short line per item covering what it is, what it needs, and where it is used
- For install/setup questions: give the exact command, then a short verify program only if asked, then the comparison only if asked
- If an image of a question paper is sent, read every question and subpart from the image and answer all of them. Do not describe the photo.

Format exactly:
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

  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
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

  const baseUrl = LLM_BASE_URL.replace(/\/$/, "");

  try {
    const groqRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0,
        reasoning_effort: "none",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      res.statusCode = groqRes.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: errText || "Groq request failed" }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
          const token = json.choices?.[0]?.delta?.content;
          if (token) res.write(token);
        } catch {
          continue;
        }
      }
    }

    res.end();
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
