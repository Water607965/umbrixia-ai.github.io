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

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY
});
const openai = new OpenAIApi(configuration);

app.post("/predict", async (req, res) => {
  const { school, grade, email } = req.body;

  const prompt = `
A student in grade ${grade} wants to apply to ${school}.
Assume we know their past academic performance, interest in extracurriculars, and test readiness from similar students.
1. What is their predicted chance (%) of acceptance?
2. Why?
3. What should they focus on to improve their chances?

Respond in JSON like:
{
  "chance": "XX%",
  "justification": "...",
  "suggestion": "..."
}
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    // Attempt to parse JSON response from GPT
    const raw = completion.data.choices[0].message.content;
    const clean = raw.trim().match(/{[\s\S]*}/);
    const parsed = clean ? JSON.parse(clean[0]) : null;

    if (parsed) {
      res.json(parsed);
    } else {
      res.status(500).json({ error: "Unable to parse AI response." });
    }
  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
