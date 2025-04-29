// utils/assignGuide.js
import { guides } from "@/data/guides";

// domain → default guide id
const DEFAULT_GUIDE = {
  Mind: "strategist",
  Heart: "dreamweaver",
  Spirit: "guardian"
};

export default function assignGuide(domain = "Mind") {
  const guide = guides.find((g) => g.id === DEFAULT_GUIDE[domain]);
  return guide || guides[0];
}
