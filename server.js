// ── Load env & core deps ──
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const { OpenAI }  = require('openai');
const killTrigger = require('./middleware/killTrigger');

// ── Firestore admin init ──
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }        = require('firebase-admin/firestore');
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Express & OpenAI clients ──
const app    = express();
app.use(express.json());
app.use(cors());
app.use('/api', killTrigger);                 // ← mount your kill‑trigger here
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Health check
app.get('/', (req, res) => res.send('✅ Umbrixia AI backend is running.'));
 

// Example chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: req.body.message }]
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI error' });
  }
});





app.post('/api/admissions-predict', async (req, res) => {
  try {
    const { school, grade, essays, recommendations, transcripts, extracurriculars } = req.body;
    if (!school || !grade) {
      return res.status(400).json({ error: 'Missing school or grade in request.' });
    }

    const prompt = `A student in grade ${grade} is applying to ${school}.
Essays: ${essays.slice(0,200)}...
Recommendations: ${recommendations.slice(0,200)}...
Transcripts: ${transcripts.slice(0,200)}...
Extracurriculars: ${extracurriculars.slice(0,200)}...

1. What is their predicted chance (as a percentage) of acceptance?
2. Provide a brief justification.
3. What should they focus on to improve their chances?
Respond in strict JSON:
{
  "chance": "XX%",
  "justification": "...",
  "suggestion": "..."
}`;

    const prediction = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = prediction.choices[0].message.content.trim();

    // **Extract only the JSON blob, non‑greedy match**
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON from AI');
    }
    const data = JSON.parse(jsonMatch[0]);

    // **Return it once and only once**
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/admissions-predict:', err);
    return res.status(500).json({ error: err.message || 'Prediction failed.' });
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = completion.choices[0].message.content.trim();

    // **Extract JSON blob**
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON from AI');
    }
    const data = JSON.parse(jsonMatch[0]);

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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.choices[0].message.content;
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.choices[0].message.content;
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.choices[0].message.content;
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw = completion.choices[0].message.content;
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
    const c = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});
const raw = c.choices[0].message.content;
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
    const c = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    return res.json({ body: c.choices[0].message.content.trim() });
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
    const resp = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    const raw  = resp.choices[0].message.content;
    const m = raw.match(/\[.*?\]/s);
    const results = m ? JSON.parse(m[0]) : [];
    res.json({ results });
  } catch (e) {
    console.error("Search Docs Error:", e);
    res.status(500).json({ error: "Search failed." });
  }
});

// ── AI Flashcards Endpoint ──
app.post('/api/flashcards', async (req, res) => {
  try {
    const uid  = req.body.uid;      // from client
    const test = req.body.test;     // 'shsat' | 'isee' | 'sat'

    // 1) load user's topic breakdown from Firestore
    const userSnap = await db.collection('users').doc(uid).get();
    const topics   = userSnap.data()?.[test]?.topics || {}; 
    // topics: { "Algebra":30, "Geometry":70, ... } percentages correct

    // 2) find weakest topic
    const weakest = Object.entries(topics)
      .sort((a,b)=> a[1] - b[1])[0]?.[0] || 'General';

    // 3) ask OpenAI for 5 flashcards on that topic
    const prompt = `
You are a test‐prep coach.  Create 5 flashcards (Q&A) for the ${test.toUpperCase()} exam on the weakest topic "${weakest}". 
Respond as JSON array: [{"front":"…","back":"…"},…].
    `;
    const ai = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role:'user', content: prompt }]
    });
    const raw = ai.choices[0].message.content;
    const cards = JSON.parse(raw);

    res.json({ weakest, cards });
  } catch(err) {
    console.error('Flashcards Error', err);
    res.status(500).json({ error:'Couldn’t generate flashcards.' });
  }
});

// ── AI Achievements Endpoint ──
app.get('/api/achievements', async (req, res) => {
  try {
    const uid = req.query.uid;
    const test = req.query.test || 'shsat';

    // fetch user's history
    const userSnap = await db.collection('users').doc(uid).get();
    const history  = userSnap.data()?.[test]?.scores || []; // [{math, ela, timestamp},...]

    // compute streak = days in a row they've done a test
    const dates = history.map(d=>new Date(d.timestamp).toDateString());
    const today = new Date().toDateString();
    let streak = 0, cur = today;
    while (dates.includes(cur)) {
      streak++;
      cur = new Date(new Date(cur).getTime() - 24*60*60*1000).toDateString();
    }

    // ask AI to generate badge titles
    const prompt = `
You are a gamification expert.  Given this ${test.toUpperCase()} score history:
${JSON.stringify(history.slice(-5),null,2)}
Generate up to 3 achievement badges (title + one‑sentence description) and respond as JSON:
[{"title":"…","desc":"…"},…]
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    const badges = JSON.parse(ai.choices[0].message.content);

    res.json({ streak, badges });
  } catch(err){
    console.error('Achievements Error', err);
    res.status(500).json({ error:'Couldn’t load achievements.' });
  }
});

// ── AI Forecast Endpoint ──
app.post('/api/forecast', async (req, res) => {
  try {
    const { uid, test } = req.body;
    const userSnap = await db.collection('users').doc(uid).get();
    const scores   = userSnap.data()?.[test]?.scores || []; // array of {math,ela}

    const prompt = `
You are a data scientist.  Given these ${test.toUpperCase()} math scores (chronologically):
${JSON.stringify(scores.map(s=>s.math))}
Forecast the next 3 math scores.  Respond as JSON array of numbers.
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    const forecast = JSON.parse(ai.choices[0].message.content);

    res.json({ forecast });
  } catch(err){
    console.error('Forecast Error', err);
    res.status(500).json({ error:'Forecast failed.' });
  }
});

// ── Adaptive Quiz Endpoint ──
app.post('/api/quiz', async (req, res) => {
  try {
    const { uid, test } = req.body;
    // Fetch user's topic strengths
    const userSnap = await db.collection('users').doc(uid).get();
    const topics   = userSnap.data()?.[test]?.topics || {};
    // Pick 3 medium‐strength topics for challenge
    const sorted = Object.entries(topics).sort((a,b)=>Math.abs(a[1]-70) - Math.abs(b[1]-70));
    const selected = sorted.slice(0,3).map(e=>e[0]).join(', ');
    // Ask AI for a 10‐question quiz
    const prompt = `
You are a test‑prep AI.  Create a 10‑question multiple‑choice quiz for the ${test.toUpperCase()} exam covering these topics: ${selected}.
Each question must have 4 options (A–D) and indicate the correct letter.
Respond as JSON: [{question:"…", options:["…","…","…","…"], answer:"B"}, …].
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    const quiz = JSON.parse(ai.choices[0].message.content);
    res.json({ selected, quiz });
  } catch(err){
    console.error('Quiz Error', err);
    res.status(500).json({error:'Failed to generate quiz.'});
  }
});

// ── Quiz Review Endpoint ──
app.post('/api/quiz-review', async (req, res) => {
  try {
    const { uid, test, answers } = req.body;
    // re‑generate quiz to know correct answers
    // (or better yet, store it in Firestore when generating)
    // For simplicity, we re‑request from AI:
    const prompt = `
You are a grading AI.  Here are the user's answers (A–D) for a previously generated 10‑question ${test.toUpperCase()} quiz.
User answers: ${JSON.stringify(answers)}
Also assume the correct answers were: ["${answers.map(_=>'A').join('","')}"]  // For demonstration
Produce a JSON: {score: X, feedback:["Q1:…",…]}
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user',content:prompt}]
    });
    const parsed = JSON.parse(ai.choices[0].message.content);
    res.json({ review: JSON.stringify(parsed, null, 2) });
  } catch(err){
    console.error('Quiz Review Error', err);
    res.status(500).json({ error:'Review failed.' });
  }
});

// ── Leaderboard Endpoint ──
app.get('/api/leaderboard', async (req, res) => {
  const users = [];
  const snap = await db.collection('users').get();
  for (let doc of snap.docs) {
    const data = await db.collection('users')
      .doc(doc.id)
      .collection('scores')
      .orderBy('timestamp','asc')
      .get();
    const scores = data.docs.map(d=>d.data().score).filter(x=>typeof x==='number');
    const avg = scores.length
      ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)
      : 0;
    users.push({ name: doc.id, avg });
  }
  users.sort((a,b)=>b.avg - a.avg);
  res.json(users.slice(0,10));
});

const cron = require('node-cron');
const nodemailer = require('nodemailer');

// configure your SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
// send daily at 8am
cron.schedule('0 8 * * *', async () => {
  const usersSnap = await db.collection('users').get();
  for (let u of usersSnap.docs) {
    const email = u.data().email;
    await transporter.sendMail({
      from: '"Umbrixia AI" <no-reply@umbrixia.ai>',
      to: email,
      subject: '📚 Time for today’s practice!',
      text: 'Hey there! Ready for your daily AI‑powered practice? Log in now 👉 https://umbrixia.ai/dashboard'
    });
  }
});

// ── Achievements Endpoint ──
app.get('/api/achievements/:uid', async (req, res) => {
  const { uid } = req.params;
  const scoresSnap = await db.collection('users').doc(uid).collection('scores').get();
  const count = scoresSnap.size;
  const badges = [];
  if (count >= 1) badges.push('First Practice ✅');
  if (count >= 5) badges.push('5 Tests Master 🏅');
  if (count >= 10) badges.push('10x Champion 🏆');
  res.json({ badges });
});

// ── ELI5 Explanation Endpoint ──
app.post('/api/eli5', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided.' });
  const prompt = `Explain this like I’m 5:\n\n${text}\n`;
  const ai = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role:'user', content: prompt }]
  });
  res.json({ eli5: ai.choices[0].message.content.trim() });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
