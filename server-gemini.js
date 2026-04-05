const express = require("express");
const cors = require("cors");
// 1. Thay đổi thư viện
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- PHẦN CẤU HÌNH GEMINI ---
function getGeminiClient() {
    console.log("Starting server with Gemini integration...");

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
        console.error("Lỗi: Chưa tìm thấy API Key");
        return null;
    }

    // Khởi tạo Google Generative AI
    return new GoogleGenerativeAI(apiKey);
}

const DEFAULT_MODEL_CANDIDATES = [
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
];

function normalizeModelName(name) {
    return String(name || "").trim().replace(/^models\//, "");
}

const envModels = (process.env.GEMINI_MODELS || "")
    .split(",")
    .map(normalizeModelName)
    .filter(Boolean);

const MODEL_CANDIDATES = [...new Set([...envModels, ...DEFAULT_MODEL_CANDIDATES])];

function isQuotaError(error) {
    const message = String(error?.message || "").toLowerCase();
    return error?.status === 429 || message.includes("quota") || message.includes("too many requests");
}

function parseRetryDelaySeconds(error) {
    const message = String(error?.message || "");
    const match = message.match(/retry in\s+([\d.]+)s/i);
    if (!match) return null;
    return Math.ceil(Number(match[1]));
}

function buildPrompt(topic, userText, history = []) {
    const safeTopic = topic?.trim() || "daily life";
    const safeText = userText?.trim() || "";
    const safeHistory = Array.isArray(history) ? history : [];

    const historyBlock = safeHistory
        .slice(-12)
        .map((item) => {
            const role = item?.role === "assistant" ? "AI" : "User";
            const content = String(item?.content || "").trim();
            return content ? `${role}: ${content}` : "";
        })
        .filter(Boolean)
        .join("\n");

    return `You are a friendly English speaking partner.
Topic: ${safeTopic}

Conversation so far:
${historyBlock || "(first turn)"}

Latest user message: "${safeText}"

Rules:
- Continue the same conversation context naturally.
- Correct grammar.
- Give short feedback.
- Ask 1 follow-up question.
- Keep under 3 sentences.
- Be natural and encouraging.`;
}

app.post("/chat", async (req, res) => {
    const { topic, text, history } = req.body;
    const genAI = getGeminiClient();

    if (!genAI) {
        return res.status(500).json({ error: "Server config error: Missing API Key" });
    }

    if (!text || !text.trim()) {
        return res.status(400).json({ error: "'text' is required" });
    }

    try {
        const prompt = buildPrompt(topic, text, history);
        let outputText = "";
        let lastError = null;

        for (const modelName of MODEL_CANDIDATES) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: "You are an encouraging and helpful English teacher."
                });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                outputText = response.text();

                if (outputText) break;
            } catch (error) {
                if (isQuotaError(error)) {
                    const retryAfter = parseRetryDelaySeconds(error);
                    return res.status(429).json({
                        error: "Gemini quota exceeded. Please check billing/limits or wait and retry.",
                        retryAfterSeconds: retryAfter,
                        details: error?.message
                    });
                }
                lastError = error;
            }
        }

        if (!outputText) {
            throw lastError || new Error("No available Gemini model for generateContent");
        }

        return res.json({
            reply: outputText
        });
    } catch (err) {
        console.error("Gemini API Error:", err);
        if (isQuotaError(err)) {
            const retryAfter = parseRetryDelaySeconds(err);
            return res.status(429).json({
                error: "Gemini quota exceeded. Please check billing/limits or wait and retry.",
                retryAfterSeconds: retryAfter,
                details: err?.message
            });
        }
        res.status(500).json({
            error: err?.message || "Server error"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));