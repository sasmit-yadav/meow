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

function loadNetworkLabReference() {
  try {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "network-lab-reference.txt");
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    return "";
  }
}

const NETWORK_LAB_REFERENCE = loadNetworkLabReference();

const NETWORK_LAB_HINT =
  /\b(socket|wireshark|tcp|udp|client.?server|recvfrom|sendto|SOCK_|localhost.?5000|display filter|dns\.|palindrome|reverse text|perfect number|vowel count|word count|gcd|fibonacci|SET-[AB]|wireshark)\b/i;

function buildSystemPrompt(notes, message) {
  const text = `${notes}\n${message}`;
  if (!NETWORK_LAB_REFERENCE || !NETWORK_LAB_HINT.test(text)) {
    return SYSTEM_CORE;
  }
  return `${SYSTEM_CORE}

Networking lab reference (match this code style, logic, and Wireshark answers when the question fits SET-A, SET-B, ODD, EVEN, TCP, or UDP):
${NETWORK_LAB_REFERENCE}`;
}

function groqRetryMs(errText) {
  try {
    const outer = JSON.parse(errText);
    const inner = typeof outer.error === "string" ? JSON.parse(outer.error) : outer;
    const msg = inner?.error?.message || inner?.message || "";
    const match = msg.match(/try again in ([\d.]+)s/i);
    if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 250;
  } catch {}
  return 2500;
}

export function handleHealth(_req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ ok: true }));
}

export const LLM_MODEL = "qwen/qwen3.8-27b";
export const LLM_BASE_URL = "https://api.groq.com/openai/v1";

const SYSTEM_CORE = `You solve exam and lab questions. There may be one question or many. They may be coding, theory, or mixed.
Subjects can include anything, commonly coding, Linux, networking, operating systems, blockchain, and soft computing.
Accuracy is the only priority. A wrong answer is a failure.

Before answering each question, silently:
- Count every question in the user message and answer all of them. Do not stop at 4. Do not invent extra questions
- Detect the subject and type: definition, command, numerical, MCQ, short/long theory, lab/install, or code
- Use the exact standard textbook/exam answer, not a vague guess
- For coding: pick the language from the question or notes; follow I/O, constraints, and samples exactly; handle edge cases; no comments
- For Linux: give exact commands, flags, paths, and output when relevant
- For Python socket client-server or Wireshark lab questions: when a reference block is included below, treat it as the required template. Match its logic, localhost:5000, recv/send sizes, error message text, command keywords (GCD, FIB, REVERSE, PALINDROME), and Wireshark display filters unless the question explicitly changes them
- For that Python socket code, copy the reference syntax and layout exactly, not a cleaner or modern variant: import socket alone on top then a blank line; one blank line between every top-level statement; keep conn,addr and ('localhost',5000) spacing like the reference; use .encode() and .decode() on send/recv; build strings with + and str(), never f-strings or format(); use input("enter ... ") and print("waiting for connection") style prompts; TCP client uses client.shutdown(socket.SHUT_WR) when the reference does; UDP uses recvfrom/sendto and no listen/accept; only add import math when GCD needs math.gcd; when both programs are required write Server: then the server code then Client: then the client code with the same blank-line rhythm as the reference
- For other networking: use correct OSI/TCP-IP layers, protocols, ports, headers, formulas (delay, bandwidth, subnet, CRC, Hamming)
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
- No markdown, backticks, or bullet symbols like * or #
- Socket lab code may use plain Server: and Client: lines like the reference; do not wrap code in markdown fences
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

export const SYSTEM = SYSTEM_CORE;

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
  const systemPrompt = buildSystemPrompt(notes, message);

  try {
    const payload = JSON.stringify({
      model: LLM_MODEL,
      temperature: 0,
      reasoning_effort: "none",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    let groqRes;
    let errText = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      groqRes = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: payload,
      });
      if (groqRes.ok) break;
      errText = await groqRes.text();
      if (groqRes.status !== 429 || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, groqRetryMs(errText)));
    }

    if (!groqRes.ok) {
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
