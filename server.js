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

// ── Burnout Prediction Endpoint ──
app.get('/api/burnout-alert/:uid', async (req, res) => {
  const uid = req.params.uid;
  // Simplest heuristic: less activity in last 7 days
  const weekAgo = Date.now() - 7*24*60*60*1000;
  const snaps = await db.collection('users').doc(uid)
    .collection('activity')
    .where('timestamp','>=', weekAgo)
    .get();
  const count = snaps.size;
  const risk = count < 3 ? 'HIGH' : count < 7 ? 'MEDIUM' : 'LOW';
  res.json({ risk, count });
});

// ── Mock Insurance Subscription ──
app.post('/api/subscribe-insurance', async (req, res) => {
  const uid = req.body.uid || 'demo-user';
  await db.collection('users').doc(uid).set({ insurance: true },{merge:true});
  res.json({ success:true });
});

// ── Flashcard Generation Endpoint ──
app.post('/api/flashcards', async (req, res) => {
  const { text } = req.body;
  const prompt = `
Extract up to 5 Q&A flashcards from this lesson text:
"${text}"
Return JSON: [ { "q":"…", "a":"…" }, … ]
`;
  const ai = await openai.chat.completions.create({
    model:'gpt-4',
    messages:[{role:'user',content:prompt}]
  });
  const blob = ai.choices[0].message.content.match(/\[[\s\S]*\]/)[0];
  res.json(JSON.parse(blob));
});

// ───────────── APPEND NEW AI ROUTES HERE ─────────────

// 1) Mood Analysis & Motivation
app.post('/api/mood-check', async (req, res) => {
  const { journalEntry } = req.body;
  if (!journalEntry) return res.status(400).json({ error: 'No entry provided.' });
  const prompt = `
Analyze the sentiment of this student journal entry. Respond JSON:
{ "sentiment":"positive|neutral|negative", "message":"..." }
Entry:
"""${journalEntry}"""`;
  const ai = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  const raw = ai.choices[0].message.content;
  const m = raw.match(/\{[\s\S]*\}/);
  return res.json(m ? JSON.parse(m[0]) : { error: 'Invalid AI response' });
});

// 2) Calendar Event (ICS) Generator
app.post('/api/create-event', (req, res) => {
  const { title, startISO, endISO } = req.body;
  if (!title || !startISO || !endISO) return res.status(400).json({ error: 'Missing fields.' });
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
    `DTSTART:${startISO}`, `DTEND:${endISO}`, `SUMMARY:${title}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\n');
  const href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  res.json({ href });
});

// 3) Peer Chat (Socket.IO)
const http = require('http').createServer(app);
const io   = require('socket.io')(http);
io.on('connection', sock => {
  sock.on('join', room => sock.join(room));
  sock.on('msg', ({ room, user, text }) => {
    io.to(room).emit('msg', { user, text, ts: Date.now() });
  });
});

// 4) On‑Demand Test Generator
app.post('/api/generate-test', async (req, res) => {
  const { subject, num } = req.body;
  if (!subject || !num) return res.status(400).json({ error: 'Missing subject or count.' });
  const prompt = `
Generate ${num} ${subject} multiple‑choice questions.
Return JSON array: [ { "q":"…", "choices":["A","B","C","D"], "answer":"A" }, … ]
`;
  const ai = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  const raw = ai.choices[0].message.content;
  const m = raw.match(/\[[\s\S]*\]/);
  res.json(m ? JSON.parse(m[0]) : []);
});

// replace your existing app.listen with http.listen so Socket.IO works:
http.listen(PORT, () => console.log(`🌐 Server live on port ${PORT}`));

// ── Adaptive Drill by Test Type ──
app.post('/api/adaptive-question', async (req, res) => {
  const { uid, testType } = req.body;
  try {
    // pull last 10 interactions for this testType
    const snaps = await db.collection('analytics').doc(uid)
      .collection('interactions')
      .where('testType','==', testType)
      .orderBy('ts','desc').limit(10).get();

    // collect topics where the user was weakest
    const wrong = snaps.docs
      .filter(d => !d.data().correct)
      .map(d => d.data().topic);
    const topics = [...new Set(wrong)].join(', ') || 'all';

    // prompt the AI for real, test‑specific drills
    const prompt = `
      You are an expert tutor for the ${testType.toUpperCase()}.
      Generate 5 practice questions focused on these weak topics: ${topics}.
      Each item should be JSON with:
      { "q": "...", "choices": [...], "answer": "...", "topic": "..." }.
      Return a JSON array.
    `;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    const arr = JSON.parse(ai.choices[0].message.content);
    return res.json(arr);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Adaptive drill failed' });
  }
});

// ── Score Forecast by Test Type ──
app.get('/api/forecast-score', async (req, res) => {
  const { uid, testType } = req.query;
  try {
    // grab past N scores for that test
    const snaps = await db.collection('users').doc(uid)
      .collection('scores')
      .where('testType','==', testType)
      .orderBy('ts','asc').get();

    const hist = snaps.docs.map(d => d.data().score);
    const prompt = `
      Given this history of ${testType.toUpperCase()} scores: ${JSON.stringify(hist)},
      predict the next 5 scores and give 3 concrete study tips.
      Respond in JSON: { "forecast":[...], "recommendations":[...] }.
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{ role:'user', content:prompt }]
    });

    return res.json(JSON.parse(ai.choices[0].message.content));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:'Forecast failed' });
  }
});

// ── Flashcard Generator (Spaced‑Repetition) ──
app.post('/api/flashcards', async (req, res) => {
  const { uid, testType } = req.body;
  try {
    // pull recent wrong items for this user & test
    const wrongSnap = await db.collection('analytics').doc(uid)
      .collection('interactions')
      .where('testType','==', testType)
      .where('correct','==', false)
      .orderBy('ts','desc').limit(20).get();

    const mistakes = wrongSnap.docs.map(d => ({
      q: d.data().question,
      topic: d.data().topic,
      answer: d.data().answer
    }));

    // ask GPT‑4 to turn them into flashcards
    const prompt = `
      You are a spaced‑repetition flashcard generator.
      Given these mistakes from a ${testType.toUpperCase()} practice:
      ${JSON.stringify(mistakes, null,2)}
      Produce JSON: [{ "front":"…", "back":"…" }, …] with clear Q/A pairs.
    `;
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user', content:prompt}]
    });
    const cards = JSON.parse(ai.choices[0].message.content);
    return res.json(cards);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:'Flashcards failed' });
  }
});

// ── Automated Essay Scoring & Feedback ──
app.post('/api/grade-essay', async (req, res) => {
  const { essay, uid } = req.body;
  if (!essay) return res.status(400).json({ error:'No essay provided.' });

  const prompt = `
    You are an expert admissions grader.
    Grade this essay (0–100) and give:
      1) score
      2) 3 strengths
      3) 3 weakness areas + improvement tip each.
    Return ONLY JSON:
    { "score": 0, "strengths": [...], "weaknesses":[{"issue":"…","tip":"…"}] }
    Essay:
    """${essay}"""
  `;
  try {
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user', content:prompt}]
    });
    const out = JSON.parse(ai.choices[0].message.content);
    // log score for analytics
    await db.collection('users').doc(uid)
      .collection('essay-grades').add({...out, ts: Date.now()});
    return res.json(out);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error:'Essay grading failed' });
  }
});

// ── 30‑Day Adaptive Study Plan ──
app.post('/api/study-plan-30', async (req, res) => {
  const { uid, testType, dailyHours } = req.body;
  if (!testType||!dailyHours) return res.status(400).json({ error:'Missing data' });

  const prompt = `
    Create a personalized 30‑day ${testType.toUpperCase()} study plan.
    User can study ${dailyHours}h/day.
    Each day: { "day":"YYYY‑MM‑DD", "focus":["topic1","topic2"], "minutes":… }.
    Return ONLY JSON array.
  `;
  try {
    const ai = await openai.chat.completions.create({
      model:'gpt-4',
      messages:[{role:'user', content:prompt}]
    });
    return res.json(JSON.parse(ai.choices[0].message.content));
  } catch(e) {
    console.error(e);
    res.status(500).json({ error:'Plan generation failed' });
  }
});

// ── Sentiment Analysis & Motivator ──
app.post('/api/sentiment', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error:'No message.' });

  const prompt = `
    Analyze the sentiment of: "${message}".
    If negative, reply with an encouraging line.
    JSON: { "sentiment":"positive|neutral|negative", "encouragement":"…" }
  `;
  try {
    const ai = await openai.chat.completions.create({
      model:'gpt-3.5-turbo',
      messages:[{role:'user', content:prompt}]
    });
    res.json(JSON.parse(ai.choices[0].message.content));
  } catch(e) {
    console.error(e);
    res.status(500).json({ error:'Sentiment failed' });
  }
});


// Middleware to validate Firebase ID tokens
const { getAuth } = require('firebase-admin/auth');
async function authGuard(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).send('Unauthorized');
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

// Apply globally to all /api routes:
app.use('/api', authGuard);

// Fetch a new SHSAT/ISEE/SAT question set
app.get('/api/tests/:type/next', async (req, res) => {
  const { type } = req.params;       // “shsat”, “isee” or “sat”
  const pool = await db.collection(`questions_${type}`).get();
  const all = pool.docs.map(d=>d.data());
  const next = all[Math.floor(Math.random()*all.length)];
  res.json(next);
});

// Grade a submitted test
app.post('/api/tests/:type/grade', async (req, res) => {
  const { type } = req.params;
  const { answers } = req.body;     // { qId: 'A', qId2: 'B', … }
  const pool = await db.collection(`questions_${type}`).get();
  let correct = 0, total = 0;
  pool.docs.forEach(doc => {
    const { id, answer } = doc.data();
    if (answers[id] !== undefined) {
      total++;
      if (answers[id] === answer) correct++;
    }
  });
  const score = Math.round((correct/total)*100);
  // save to Firestore
  await db.collection('users').doc(req.uid)
    .collection('scores')
    .add({ type, correct, total, score, timestamp: Date.now() });
  res.json({ correct, total, score });
});

app.post('/api/tests/:type/feedback', async (req, res) => {
  const { type } = req.params;
  const { correct, total, mistakes } = req.body; // mistakes = [{ id, yourAnswer, correctAnswer, questionText }]
  const prompt = `
You are a seasoned tutor. A student just took the ${type.toUpperCase()}:
Score: ${correct}/${total}.
They missed these questions:
${mistakes.map(m=>`• Q: ${m.questionText}\n  Your: ${m.yourAnswer} | Correct: ${m.correctAnswer}`).join('\n')}
Give them:
1) A short motivation.
2) Three targeted tips to improve in ${type}.
Respond in JSON:
{ "motivation":"…", "tips":["…","…","…"] }`;
  const ai = await openai.chat.completions.create({
    model:'gpt-4', messages:[{role:'user',content:prompt}]
  });
  const match = ai.choices[0].message.content.match(/\{[\s\S]*\}/);
  res.json(JSON.parse(match[0]));
});

app.post('/api/study-plan', async (req, res) => {
  const { goals, history } = req.body; 
  // history = last few scores & feedback summaries
  const prompt = `
You are an AI coach. The student’s goals: ${goals}.
Their recent performance: ${JSON.stringify(history,0,2)}.
Generate a 4‑week adaptive study plan. Each week has 3–4 focused activities, with daily time estimates.
Respond ONLY with valid JSON:
{ "plan":[ { "week":1,"activities":[{"activity":"…","dailyMin":…},…] }, … ] }
`;
  const ai = await openai.chat.completions.create({
    model:'gpt-4', messages:[{role:'user',content:prompt}]
  });
  const m = ai.choices[0].message.content.match(/\{[\s\S]*\}/);
  res.json(JSON.parse(m[0]));
});

const stripe = require('stripe')(process.env.STRIPE_SECRET);
app.post('/api/create-checkout', authGuard, async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    payment_method_types: ['card'],
    line_items: [{ price: 'price_XXXX', quantity: 1 }],
    mode: 'subscription',
    success_url: `${FRONTEND_URL}/thank-you`,
    cancel_url: `${FRONTEND_URL}/pricing`
  });
  res.json({ sessionId: session.id });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/flashcard', async (req, res) => {
  const prompt = req.body.prompt;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ flashcard: reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/flashcard', async (req, res) => {
  const { exam, subject, prompt } = req.body;

  if (!exam || !subject || !prompt) {
    return res.status(400).json({ error: 'Missing exam, subject, or prompt' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `You are a flashcard tutor for the ${exam} exam, focused on ${subject}. Generate a clear, memorable answer with moral reasoning and real-world examples. Topic: "${prompt}".`
      }]
    });

    const aiReply = completion.choices[0].message.content;
    res.json({ response: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
