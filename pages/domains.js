// pages/domains.js
import { useRouter } from "next/router";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const answers = JSON.parse(localStorage.getItem("echoes_answers")||"[]");

  function pickDomain(domain) {
    localStorage.setItem("echoes_domain", domain);
    router.push("/guide-intro");
  }

  return <DomainSelector answers={answers} onSelect={pickDomain} />;
}
