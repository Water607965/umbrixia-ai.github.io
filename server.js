// Firestore setup
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();


// ——————————————
// 0️⃣ Firestore setup using your service account
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }       = require('firebase-admin/firestore');
const serviceAccount         = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
// ——————————————


// ——————————————
// 1️⃣ Kill-trigger middleware
app.use('/api', async (req, res, next) => {
  // You must be sending a userId in headers or body:
  const userId = req.headers['x-user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Missing userId' });
  }
  // Fetch user doc
  const userDoc = await db.collection('users').doc(userId).get();
  const data    = userDoc.data() || {};
  if (!data.hasTakenTest) {
    // Kill the request if they've never done a practice test.
    return res.status(403).json({
      error: 'You must complete at least one practice test before using the API.'
    });
  }
  // OK, let it continue to the real handler
  next();
});


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

// Initialize Express app
const app = express();
app.use(express.json());              // Parse incoming JSON
app.use(cors());                      // Enable CORS for all routes

// Initialize OpenAI client
const openai = new OpenAI({
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
    const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: userMessage }]
});
const aiResponse = completion.choices[0].message.content;

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
    const prediction = await openai.chat.completions.create({
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
    // **capture** the AI response in `completion`
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    // pull out the JSON blob from the AI’s reply
    const raw = completion.choices[0].message.content.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON.');
    // parse and return it
    const data = JSON.parse(match[0]);
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/demographic-trends:', err);
    return res.status(500).json({ error: 'Failed to generate demographics.' });
  }
});







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

// ── AI Document Search ──
app.post("/api/search-docs", async (req, res) => {
  const { uid, query } = req.body;
  if (!uid || !query) return res.status(400).json({ error: "Missing uid or query." });

  // Fetch all user-uploaded text fields
  const userSnap = await db.collection("users").doc(uid).get();
  const data = userSnap.data() || {};
  const docs = [
    ...(data.essays || []),
    ...(data.recommendations || []),
    ...(data.transcripts || []),
    ...(data.extracurriculars || [])
  ].join("\n\n---\n\n");

  const prompt = `
You are a document search assistant.
Search through the following USER CONTENT and return the most relevant excerpts for: "${query}"
USER CONTENT:
${docs}
Return a JSON array of up to 3 objects: [{ excerpt: "...", source: "essay/recommendation/transcript/extracurricular" }, ...]
`;
  try {
    await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = ai.choices[0].message.content;
    const m = raw.match(/\[.*\]/s);
    const results = m ? JSON.parse(m[0]) : [];
    res.json({ results });
  } catch (e) {
    console.error("Search Docs Error:", e);
    res.status(500).json({ error: "Search failed." });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
