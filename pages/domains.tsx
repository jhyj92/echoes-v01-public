/* ----------------------------------------------------------------
   Domains  ▸ shows 5 suggestions and routes to /world
-----------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      const res   = await fetch("/api/domains");
      const data  = await res.json();
      setDomains(data.domains);
    })();
  }, []);

  if (!domains) return <p className="p-8">Loading domains…</p>;

  return (
    <main className="flex items-center justify-center min-h-screen px-6 py-12">
      <section className="space-y-6 max-w-xl w-full">
        <h1 className="text-3xl font-serif text-gold">Discover&nbsp;Your&nbsp;Domain</h1>
        <DomainSelector
          domains={domains}
          onSelect={(domain) => {
            localStorage.setItem("echoes_domain", domain);
            router.push("/world");
          }}
        />
      </section>
    </main>
  );
}
