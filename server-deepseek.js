const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- ĐÂY LÀ PHẦN QUAN TRỌNG CẦN SỬA ---
function getClient() {
console.log("Starting server with DeepSeek integration...");
  // Lấy API Key từ biến môi trường (bạn có thể đặt trong file .env)
  // const apiKey = process.env.DEEPSEEK_API_KEY;
// const apiKey = 'sk-caff59faa398481a90e081f464e53b0e'; // Thay bằng key thật của bạn
const apiKey = 'AIzaSyDO8bTw4UeEbEVrRzmqJTDuVV-iFWcIexI';
  
  if (!apiKey) {
    console.error("Lỗi: Chưa tìm thấy DEEPSEEK_API_KEY");
    return null;
  }

  // Khởi tạo client với endpoint và key của DeepSeek
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.deepseek.com" // ĐÂY LÀ ENDPOINT CỦA DEEPSEEK
  });
}
// --- KẾT THÚC PHẦN CẦN SỬA ---

// Hàm này giữ nguyên, không cần sửa
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
      error: "Server config error: Missing DeepSeek API Key"
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "'text' is required"
    });
  }

  try {
    const response = await client.chat.completions.create({
      // Bạn có thể thử model 'deepseek-chat' hoặc 'deepseek-reasoner'
      model: "deepseek-chat", // Model mặc định, rất tốt cho hội thoại
      messages: [
        { role: "system", content: "You are an encouraging and helpful English teacher." },
        { role: "user", content: buildPrompt(topic, text) }
      ]
    });

    res.json({
      reply: response.choices?.[0]?.message?.content || "Can you try saying that again?"
    });
  } catch (err) {
    console.error("DeepSeek API Error:", err);
    res.status(err.status || 500).json({
      error: err?.message || "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));