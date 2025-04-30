// components/DomainSelector.js
"use client";

import { useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

export default function DomainSelector({ answers, onSelect }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState(false);

  async function fetchDomains() {
    setLoading(true);
    const timer = setTimeout(()=>setOverlay(true),5000);
    try {
      const res = await fetchWithTimeout("/api/domains", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ answers })
      },10000);
      const { suggestions } = await res.json();
      setDomains(suggestions);
    } catch {
      setDomains(["Curiosity","Courage","Reflection","Discovery","Wonder"]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  useState(() => { fetchDomains() }, []);

  if (loading) return <p>Loading domains…</p>;

  return (
    <div style={{ padding:"2rem" }}>
      {overlay && <LatencyOverlay text="The echoes are pondering…" />}
      <Bridge text="Your possible domains" delay={0} />
      <div style={{ display:"grid", gap:"1rem", marginTop:"1rem" }}>
        {domains.map((d,i)=>(
          <button
            key={i}
            className="button-poetic"
            style={{ padding:"16px", fontSize:"1rem" }}
            onClick={()=>onSelect(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
