"use client";
import { useState, useEffect } from "react";
import { assignWorld } from "@/utils/assignWorld";
import { generateCodexEntry } from "@/utils/generateCodexEntry";

export default function EchoesApp() {
  const [input, setInput]   = useState("");
  const [traits, setTraits] = useState("");
  const [world, setWorld]   = useState("");
  const [codex, setCodex]   = useState("");

  useEffect(() => {
    const memory = JSON.parse(localStorage.getItem("echoesMemory") || "null");
    if (memory) {
      setTraits(memory.traits);
      setWorld(memory.world);
      setCodex(memory.codex);
    }
  }, []);

  async function discover() {
    const res = await fetch("/api/extractTraits", {
      method: "POST",
      body: JSON.stringify({ userInput: input })
    });
    const { traits } = await res.json();
    const chosenWorld = assignWorld(traits);
    const newCodex    = generateCodexEntry(traits, chosenWorld);

    setTraits(traits);
    setWorld(chosenWorld);
    setCodex(newCodex);

    localStorage.setItem(
      "echoesMemory",
      JSON.stringify({ traits, world: chosenWorld, codex: newCodex })
    );
  }

  function reset() {
    localStorage.removeItem("echoesMemory");
    setTraits(""); setWorld(""); setCodex(""); setInput("");
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {!traits ? (
        <section className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4">Begin Your Echo</h1>
          <textarea
            className="w-full h-36 bg-gray-800 rounded p-3 mb-4"
            placeholder="Tell Echoes what you love, excel at, or find meaningful…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded"
            onClick={discover}
          >
            Discover
          </button>
        </section>
      ) : (
        <section className="text-center max-w-lg">
          <h2 className="text-2xl font-semibold mb-1">{world}</h2>
          <p className="mb-4">{codex}</p>
          <button className="bg-gray-700 px-4 py-2 rounded" onClick={reset}>
            Restart Journey
          </button>
        </section>
      )}
    </main>
  );
}
