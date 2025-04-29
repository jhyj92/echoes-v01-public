"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import categoriseDomains from "@/utils/categoriseDomains";

export default function Explore() {
  const [text,setText]=useState("");
  const [loading,setLoad]=useState(false);
  const router = useRouter();

  async function handleDiscover(){
    if(!text.trim())return;
    setLoad(true);
    const res=await fetch("/api/extractTraits",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userInput:text})});
    const {traits}=await res.json();
    const list=traits.split(",").map(t=>t.trim());
    const world=assignWorldWeighted(list);
    const domain=categoriseDomains(list);

    localStorage.setItem("echoes_traits",JSON.stringify(list));
    localStorage.setItem("echoes_world",JSON.stringify(world));
    localStorage.setItem("echoes_domain",JSON.stringify(domain));

    router.push("/world");
  }

  return(
    <main style={{maxWidth:"600px",margin:"15vh auto"}} className="fade">
      <h2>Enter your thoughts freely</h2>
      <textarea rows={6} value={text} onChange={e=>setText(e.target.value)}
        style={{width:"100%",padding:"12px",background:"#0F1116",color:"#fff",border:"1px solid #444"}} />
      <button className="button-poetic" style={{marginTop:"20px"}} onClick={handleDiscover} disabled={loading}>
        {loading?"Discovering…":"Discover"}
      </button>
    </main>
  );
}
