export interface Format6Response {
  problem: string;
  evidence: string;
  planA: string;
  planB: string;
  patchPreview: string;
  verifySteps: string[];
}

export function format6ToString(res: Format6Response): string {
  return [
    `### 🎯 1. What I’m solving\n${res.problem}`,
    `### 🔍 2. Evidence\n${res.evidence}`,
    `### 🛠️ 3. Plan A (Minimal Fix)\n${res.planA}`,
    `### 🛡️ 4. Plan B (Safe Fallback)\n${res.planB}`,
    `### 📝 5. Patch Preview\n${res.patchPreview}`,
    `### ✅ 6. Verify Steps\n${res.verifySteps.map((s) => `- ${s}`).join("\n")}`,
  ].join("\n\n");
}

export function parseFormat6(raw: string): Partial<Format6Response> {
  const res: Partial<Format6Response> = {};
  const sections = raw.split(/### \d\./);

  if (sections[1])
    res.problem = sections[1].split("\n").slice(1).join("\n").trim();
  if (sections[2])
    res.evidence = sections[2].split("\n").slice(1).join("\n").trim();
  if (sections[3])
    res.planA = sections[3].split("\n").slice(1).join("\n").trim();
  if (sections[4])
    res.planB = sections[4].split("\n").slice(1).join("\n").trim();
  if (sections[5])
    res.patchPreview = sections[5].split("\n").slice(1).join("\n").trim();
  if (sections[6])
    res.verifySteps = sections[6]
      .split("\n")
      .slice(1)
      .join("\n")
      .filter((l) => l.trim().startsWith("-"))
      .map((l) => l.trim().substring(1).trim());

  return res;
}
