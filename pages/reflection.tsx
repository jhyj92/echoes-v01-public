import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import ReflectionLetter from "@/components/ReflectionLetter";

export default function ReflectionPage() {
  const router = useRouter();
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const history = localStorage.getItem("echoes_history");
    const superpower = localStorage.getItem("echoes_superpower");

    if (!history || !superpower) {
      router.push("/");
      return;
    }

    fetch("/api/reflectionLetter", {
      method: "POST",
      body: JSON.stringify({
        history: JSON.parse(history),
        superpower,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLetter(data?.letter || "");
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    router.push("/hero");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {!loading && letter && (
        <ReflectionLetter letter={letter} onContinue={handleContinue} />
      )}
    </main>
  );
}
