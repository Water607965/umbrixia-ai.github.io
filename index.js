// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // <== make sure to set this in Render
});
const openai = new OpenAIApi(configuration);

app.post('/flashcard', async (req, res) => {
  const { exam, subject, prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Create a flashcard for the following prompt in ${exam} ${subject}: ${prompt}`,
        },
      ],
    });

    res.json({ result: completion.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(port, () => {
  console.log(`Flashcard server running on port ${port}`);
});

// server.js — ADD this near other endpoints
app.post('/flashcard', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'No message provided.' });

  try {
    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await openaiResp.json();

    // Defensive parse
    const text = data.choices?.[0]?.message?.content;
    res.json({ response: text || "No response." });

  } catch (err) {
    console.error("❌ Error in /flashcard:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
