import dotenv from "dotenv";
dotenv.config();                                 // load .env in local dev

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userInput } = req.body;
    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const body = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content:
            "You are a master trait extractor. Given a user's free-form text, output exactly 3 personality traits as a comma-separated list with NO commentary."
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.2
    };

    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY_1}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    if (!upstream.ok) {
      const msg = await upstream.text();
      console.error("OpenRouter error:", msg);
      return res.status(upstream.status).json({ error: "Upstream failure" });
    }

    const data   = await upstream.json();
    const traits = (data?.choices?.[0]?.message?.content || "")
      .replace(/\n+/g, "")
      .trim();

    return res.status(200).json({ traits });
  } catch (err) {
    console.error("Trait API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
