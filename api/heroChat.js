// pages/api/heroChat.js
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  const { prompt } = req.body||{};
  if (!prompt) return res.status(400).end();
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{ Authorization:`Bearer ${process.env.OPENROUTER_KEYS.split(",")[0]}`, "Content-Type":"application/json" },
      body:JSON.stringify({
        model:"deepseek/deepseek-chat-v3-0324:free",
        messages:[{role:"system",content:"You are a heroic mentor."},{role:"user",content:prompt}],
        temperature:0.7,
        stream:false
      })
    });
    const { choices } = await response.json();
    return res.status(200).json({ reply:choices[0].message.content.trim() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ reply:"The hero’s heart is silent…" });
  }
}
