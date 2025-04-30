// components/HeroChat.js
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import { loadChat, saveChat } from "@/utils/chatManager";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

export default function HeroChat() {
  const [history, setHistory] = useState(loadChat());
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);

  useEffect(() => {
    if (history.length===0) {
      // seed with chosen scenario
      const scenario = localStorage.getItem("echoes_scenario");
      setHistory([ { role:"hero", text:scenario } ]);
    }
  }, []);

  useEffect(() => {
    saveChat(history);
  }, [history]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role:"user", text: input.trim() };
    setHistory(h => [...h, userMsg]);
    setInput("");
    setLoading(true);
    const timer = setTimeout(()=>setOverlay(true),5000);

    try {
      const prompt = history.concat(userMsg).map(m=>`${m.role}: ${m.text}`).join("\n");
      const res = await fetchWithTimeout("/api/heroChat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ prompt })
      },10000);
      const { reply } = await res.json();
      setHistory(h => [...h, { role:"hero", text:reply }]);
    } catch {
      setHistory(h=>[...h, { role:"hero", text:"The hero’s voice falters…" }]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  if (history.length > 20) {
    // after 10 exchanges (20 messages), finish
    return <p>Your reflection arc is complete.</p>;
  }

  return (
    <div style={{ padding:"1rem", maxWidth:"600px", margin:"0 auto" }}>
      {overlay && <LatencyOverlay text="The echoes are responding…" />}
      <Bridge text="Your conversation" delay={0} />
      <div style={{ maxHeight:"60vh", overflowY:"auto", margin:"1rem 0" }}>
        {history.map((m,i)=>(
          <p key={i} style={{ textAlign: m.role==="user"?"right":"left", opacity: m.role==="hero"?1:0.8 }}>
            <strong>{m.role==="user"?"You":"Hero"}:</strong> {m.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&sendMessage()}
        style={{ width:"100%", padding:"12px", border:"1px solid #444", background:"#0F1116", color:"#fff" }}
      />
      <button className="button-poetic" onClick={sendMessage} disabled={loading} style={{ marginTop:"8px" }}>
        {loading?"Thinking…":"Send"}
      </button>
    </div>
  );
}
