import { guides } from "@/data/guides";
const DEFAULT_GUIDE={Mind:"strategist",Heart:"dreamweaver",Spirit:"guardian"};
export default function assignGuide(domain="Mind"){return guides.find(g=>g.id===DEFAULT_GUIDE[domain])||guides[0];}
