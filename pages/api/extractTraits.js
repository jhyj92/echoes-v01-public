import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userInput } = await req.json();
    const body = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content:
            "You are a master trait extractor. Given free-form text, output ONLY the top 3 personality traits as a comma-separated list. No commentary."
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.2,
      max_tokens: 50
    };

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY_1}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data   = await res.json();
    const traits = (data?.choices?.[0]?.message?.content || "")
      .replace(/\n+/g, "")
      .trim();

    return NextResponse.json({ traits });
  } catch (e) {
    console.error("Trait API error:", e);
    return NextResponse.json({
      traits: "Creativity, Resilience, Strategic Thinking" // graceful fallback
    });
  }
}
