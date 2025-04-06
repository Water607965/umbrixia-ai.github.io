require("dotenv").config();
const express = require("express");
const cors = require("cors");
const openai = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        });

        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
