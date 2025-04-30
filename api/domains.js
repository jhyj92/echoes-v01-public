// pages/api/domains.js
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  const { answers } = req.body||{};
  if (!answers) return res.status(400).end();

  try {
    const prompt = `Based on these answers: ${answers.join(", ")}, suggest 5 nuanced superpower domains.`;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{ Authorization:`Bearer ${process.env.OPENROUTER_KEYS.split(",")[0]}`, "Content-Type":"application/json" },
      body:JSON.stringify({
        model:"deepseek/deepseek-chat-v3-0324:free",
        messages:[{role:"system",content:"You are an insightful domain suggester."},{role:"user",content:prompt}],
        temperature:0.8
      })
    });
    const { choices } = await response.json();
    const suggestions = choices[0].message.content.split(",").map((s)=>s.trim());
    return res.status(200).json({ suggestions });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ suggestions: ["Curiosity","Courage","Reflection","Discovery","Wonder"] });
  }
}
