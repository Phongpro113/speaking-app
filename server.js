const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

console.log("Starting server open AI...");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function getClient() {
//   const apiKey = process.env.OPENAI_API_KEY;
const apiKey='abc';
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function buildPrompt(topic, userText) {
  const safeTopic = topic?.trim() || "daily life";
  const safeText = userText?.trim() || "";

  return `
You are a friendly English speaking partner.

Topic: ${safeTopic}

User said: "${safeText}"

Do:
- Correct grammar
- Give short feedback
- Ask 1 follow-up question

Rules:
- Keep under 3 sentences
- Be natural and encouraging
`;
}

app.post("/chat", async (req, res) => {
  const { topic, text } = req.body;
  const client = getClient();

  if (!client) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY in environment variables"
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "'text' is required"
    });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an English teacher." },
        { role: "user", content: buildPrompt(topic, text) }
      ]
    });

    res.json({
      reply: response.choices?.[0]?.message?.content || "Can you try saying that again?"
    });
  } catch (err) {
    res.status(err.status || 500).json({
      error: err?.message || "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));