import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();
  return (
    <main style={{display:"flex",flexDirection:"column",height:"100vh",justifyContent:"center",alignItems:"center"}} className="fade">
      <h1 style={{fontSize:"4rem",margin:0}}>Echoes</h1>
      <p style={{margin:"8px 0 40px"}}>Your soul remembers.<br/>Step through the Echoes.</p>
      <button className="button-poetic" onClick={()=>router.push("/onboarding")}>Get Started</button>
    </main>
  );
}
