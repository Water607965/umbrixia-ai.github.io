require("dotenv").config();
const express = require("express");
const cors = require("cors");
const openai = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

// Setup OpenAI client with secret key
const client = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Optional: Health check route for Render root
app.get("/", (req, res) => {
  res.send("✅ Umbrixia AI backend is running.");
});

// Main POST route for ChatGPT
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    const aiResponse = response.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

// PORT for Render (or fallback for local dev)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server live on port ${PORT}`));
