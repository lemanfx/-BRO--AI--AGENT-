
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "BRO AI AGENT",
    version: "1.5",
    status: "ONLINE"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Pesan tidak boleh kosong"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY belum dipasang"
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Kamu adalah BRO AI AGENT, asisten AI yang ramah dan pintar. Jawab pengguna dalam bahasa Indonesia."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      success: true,
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("BRO AI ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan pada BRO AI AGENT"
    });
  }
});

app.listen(PORT, () => {
  console.log(`BRO AI AGENT berjalan di port ${PORT}`);
});
