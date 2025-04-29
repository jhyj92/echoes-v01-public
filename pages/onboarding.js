"use client";
import { useRouter } from "next/router";

export default function OnboardingMenu() {
  const router = useRouter();
  return (
    <main style={{padding:"10vh 0",textAlign:"center"}} className="fade">
      <h2 style={{fontSize:"2rem",marginBottom:"3rem"}}>What if the<br/>world whispered<br/>back your truth?</h2>

      <div style={{display:"flex",flexDirection:"column",gap:"20px",maxWidth:"320px",margin:"0 auto"}}>
        <button className="button-poetic" onClick={()=>router.push("/explore")}>Explore Your Strengths</button>
        <button className="button-poetic" onClick={()=>router.push("/journey")}>Begin a Journey</button>
        <button className="button-poetic" onClick={()=>router.push("/discover")}>Discover Your Echo</button>
      </div>
    </main>
  );
}
