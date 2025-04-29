"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/router";
import WorldReveal from "@/components/WorldReveal";

export default function WorldPage(){
  const [world,setWorld]=useState(null); const router=useRouter();
  useEffect(()=>{setWorld(JSON.parse(localStorage.getItem("echoes_world")||"null"));},[]);
  if(!world)return null;

  return(
    <main style={{textAlign:"center",paddingTop:"30vh"}} className="fade">
      <WorldReveal world={world}/>
      <button className="button-poetic" style={{marginTop:"40px"}} onClick={()=>router.push("/guide")}>
        Continue
      </button>
    </main>
  );
}
