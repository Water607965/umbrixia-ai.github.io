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

// ─── Demographic Trends Stub ───
app.get('/api/demographic-trends', (req, res) => {
  // TODO: Replace with real data from AI or analytics service
  const labels = ["All Students", "STEM Majors", "Humanities", "URM", "Intl"];
  const values = [65, 58, 72, 50, 61];  // percentages
  res.json({ labels, values });
});

// ─── Demographic Trends via OpenAI ───
app.get('/api/demographic-trends', async (req, res) => {
  try {
    const prompt = `
You are a data analytics assistant. Produce JSON showing demographic acceptance rates (%) for a university application pool.
Include these groups as labels: All Students, STEM Majors, Humanities, Underrepresented Minorities, International Students.
Respond _only_ with valid JSON in this exact shape:
{
  "labels": ["All Students", "STEM Majors", "Humanities", "Underrepresented Minorities", "International Students"],
  "values": [ /* five numeric percentages between 0 and 100, no % sign */ ]
}`;
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    // Extract the JSON substring
    const raw = completion.choices[0].message.content.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON.');

    const data = JSON.parse(match[0]);
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/demographic-trends:', err);
    return res.status(500).json({ error: 'Failed to generate demographics.' });
  }
});

// ── Admissions Predictor (AI-generated) ──
app.post("/api/admissions-predict", async (req, res) => {
  const {
    school,
    grade,
    essays,
    recommendations,
    transcripts,
    extracurriculars
  } = req.body;

  // Build GPT-4 prompt
  const prompt = `
A student in grade ${grade} is applying to ${school}.
We have their essays, recommendation letters, transcripts, and extracurriculars.
1. What is their predicted chance (%) of acceptance?
2. Why?
3. What should they focus on to improve their chances?

Respond with ONLY valid JSON:
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
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("AI returned no JSON");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Admissions Error:", err);
    return res.status(500).json({ error: "Prediction failed." });
  }
});

// ── Demographic Trends (AI-generated) ──
app.get("/api/demographic-trends", async (req, res) => {
  const prompt = `
Provide acceptance-rate data by demographic groups:
All Students, STEM Majors, Humanities, URM, International.
Respond in JSON:
{ "labels": [...], "values": [...] }
`;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("AI returned no JSON");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Demographics Error:", err);
    return res.status(500).json({ error: "Failed to fetch demographics." });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// ── Essay Feedback Endpoint ──
app.post("/api/essay-feedback", async (req, res) => {
  const { essay } = req.body;
  if (!essay) return res.status(400).json({ error: "No essay provided." });

  const prompt = `
You are an expert college admissions coach.
Provide detailed feedback on this essay, focusing on clarity, grammar, structure, and emotional impact.
Return ONLY this JSON:
{
  "feedback": "...",
  "suggestions": "..."
}
Essay:
"""${essay}"""
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("AI returned no JSON");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Essay Feedback Error:", err);
    return res.status(500).json({ error: "Feedback generation failed." });
  }
});

// ── AI Study Plan Generator ──
app.post("/api/study-plan", async (req, res) => {
  const { goals, availableHoursPerWeek } = req.body;
  if (!goals || !availableHoursPerWeek) {
    return res.status(400).json({ error: "Missing goals or hours" });
  }
  const prompt = `
You are an expert academic coach.
A student has these goals: ${goals}
They have ${availableHoursPerWeek} hours per week to study.
Generate a 7-day study plan as valid JSON:
{ "plan": [ { "day": "Monday", "hours": 2, "activities": ["..."] }, ... ] }
`;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("AI returned no JSON");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Study Plan Error:", err);
    return res.status(500).json({ error: "Study plan generation failed." });
  }
});

// ── Weekly Performance Summary ──
app.post("/api/weekly-summary", async (req, res) => {
  const { scores } = req.body;
  if (!Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ error: "No scores provided." });
  }

  // Build a prompt summarizing last 7 scores
  const prompt = `
Here are the student's last test results (Math vs. ELA) in chronological order:
${JSON.stringify(scores, null, 2)}

1. Provide a concise summary of their strengths and weaknesses this week.
2. Recommend 3 actionable steps for next week.
3. Encourage them with a motivational closing remark.

Respond with ONLY valid JSON:
{
  "summary": "...",
  "recommendations": ["...", "...", "..."],
  "motivation": "..."
}
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("No JSON in AI response");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Weekly Summary Error:", err);
    return res.status(500).json({ error: "Weekly summary generation failed." });
  }
});

// ── Grammar Check Endpoint ──
app.post("/api/grammar-check", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided." });

  const prompt = `
You are a world-class proofreader.
Correct grammar, punctuation, and style in this text.
Return ONLY JSON:
{ "corrected": "…", "explanation": "…" }
Text:
"""${text}"""
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.data.choices[0].message.content;
    const match = raw.match(/{[\s\S]*}/);
    if (!match) throw new Error("No JSON returned");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("Grammar Check Error:", err);
    return res.status(500).json({ error: "Grammar check failed." });
  }
});

// ── Generate Google Calendar Event Link ──
app.post("/api/calendar-event", (req, res) => {
  const { title, date, duration } = req.body;
  if (!title || !date || !duration) {
    return res.status(400).json({ error: "Missing title, date or duration" });
  }
  // Build ICS parameters
  const start = new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endDate = new Date(new Date(date).getTime() + duration*60000);
  const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  // Return data URI for download/link
  const href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  res.json({ href });
});

// ── AI Learning Path Generator ──
app.post("/api/learning-path", async (req, res) => {
  const { goal, weeks } = req.body;
  if (!goal || !weeks) return res.status(400).json({ error:"Missing goal or weeks" });

  const prompt = `
Create a ${weeks}-week adaptive learning path to achieve: ${goal}.
For each week, list 3 focused activities with estimated daily time.
Return ONLY JSON: { "path": [ { "week":1, "activities":[{"name":"...","dailyMin":...},...] }, ... ] }
`;
  try {
    const c = await openai.createChatCompletion({
      model:"gpt-4",
      messages:[{role:"user",content:prompt}]
    });
    const raw = c.data.choices[0].message.content;
    const m = raw.match(/{[\s\S]*}/);
    if (!m) throw new Error("No JSON");
    res.json(JSON.parse(m[0]));
  } catch(e) {
    console.error(e);
    res.status(500).json({ error:"Path generation failed" });
  }
});

// ── Email Draft Endpoint ──
app.post('/api/email-draft', async (req,res) => {
  const { recipient, subject, points } = req.body;
  if (!recipient||!subject||!points) return res.status(400).json({ error:'Missing fields' });

  const prompt = `
Write a polite email to ${recipient} with subject "${subject}".
Include these bullet points:
${points.map(p=>`- ${p}`).join('\n')}
Return only the email body.
`;
  try {
    const c = await openai.createChatCompletion({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    return res.json({ body: c.data.choices[0].message.content.trim() });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error:'Email draft failed' });
  }
});
