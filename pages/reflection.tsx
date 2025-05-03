// /pages/reflection.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "../components/LatencyOverlay";
import Starfield from "../components/Starfield";
import ReflectionLetter from "../components/ReflectionLetter";

export default function ReflectionPage() {
  const router = useRouter();
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const history = localStorage.getItem("echoes_history");
    const superpower = localStorage.getItem("echoes_superpower");

    if (!history || !superpower) {
      router.replace("/hero");
      return;
    }

    const fetchLetter = async () => {
      try {
        const res = await fetch("/api/reflectionLetter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: JSON.parse(history),
            superpower,
          }),
        });

        if (!res.ok) throw new Error("Failed to fetch reflection letter");
        const data = await res.json();
        setLetter(data.letter);
      } catch (err) {
        console.error(err);
        setLetter("A letter could not be generated at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [router]);

  const handleContinue = () => {
    localStorage.removeItem("echoes_history");
    router.replace("/hero");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {loading ? (
        <p className="text-xl animate-fade-in">The echoes are composing your reflection…</p>
      ) : (
        <ReflectionLetter letter={letter ?? ""} onContinue={handleContinue} />
      )}
    </main>
  );
}
