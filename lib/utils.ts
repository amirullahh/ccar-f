import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DOMAIN_LABELS: Record<number, string> = {
  1: "Agentic Architecture",
  2: "Tool Design & MCP",
  3: "Claude Code",
  4: "Prompt Engineering",
  5: "Context Management",
};
