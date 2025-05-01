/* ---- fetch domains after answers hydrated ------------------ */
useEffect(() => {
  (async () => {
    const answers = JSON.parse(localStorage.getItem("echoes_answers") ?? "[]");
    try {
      const res  = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setDomains(data.domains);
    } catch {
      setDomains([]);
    }
  })();
}, []);
