require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

// Initialize Express app
const app = express();
app.use(express.json());              // Parse incoming JSON
app.use(cors());                      // Enable CORS for all routes

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check - verifies server is running
app.get('/', (req, res) => {
  res.send('✅ Umbrixia AI backend is running.');
});

// Chat endpoint powered by GPT-3.5-turbo
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }]
    });
    const aiResponse = response.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI' });
  }
});

// Admissions Predictor endpoint
app.post('/api/admissions-predict', async (req, res) => {
  try {
    const { school, grade, essays, recommendations, transcripts, extracurriculars } = req.body;
    if (!school || !grade) {
      return res.status(400).json({ error: 'Missing school or grade in request.' });
    }

    // Build prompt for GPT-4 model
    const prompt = `A student in grade ${grade} is applying to ${school}.
Essays: ${essays.slice(0, 200)}...  
Recommendations: ${recommendations.slice(0, 200)}...  
Transcripts: ${transcripts.slice(0, 200)}...  
Extracurriculars: ${extracurriculars.slice(0, 200)}...  

1. What is their predicted chance (as a percentage) of acceptance?
2. Provide a brief justification.
3. What should they focus on to improve their chances?
Respond in strict JSON:
{
  "chance": "XX%",
  "justification": "...",
  "suggestion": "..."
}`;

    // Call GPT-4 for predictions
    const prediction = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = prediction.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from AI');
    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);
  } catch (err) {
    console.error('Error in /api/admissions-predict:', err);
    res.status(500).json({ error: err.message || 'Prediction failed.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
