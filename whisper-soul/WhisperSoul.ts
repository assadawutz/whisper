import { AGENT_REGISTRY, AgentProfile } from "./agentRegistry";
import { format6ToString, Format6Response } from "./format6";
import { llmClient } from "@whisper/core/llm/llmClient";
import { loadConfig } from "@whisper/core/core/configStore";

/**
 * 🧠 WHISPER SOUL AGENT SYSTEM
 * Manages the multi-persona collaboration loop.
 */
export class WhisperSoul {
  async invokeAgent(
    agentId: string,
    prompt: string,
  ): Promise<Format6Response & { raw: string }> {
    const agent = AGENT_REGISTRY[agentId];
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const cfg = loadConfig();

    const systemPrompt = `You are ${agent.name}, the ${agent.role}. 
Mission: ${agent.mission}
Principles: ${agent.principles.join(", ")}

You MUST respond using the 6-SECTION PROTOCOL:
### 1. What I’m solving
### 2. Evidence
### 3. Plan A (Minimal Fix)
### 4. Plan B (Safe Fallback)
### 5. Patch Preview
### 6. Verify Steps

Be concise and deterministic.`;

    const raw = await llmClient.call(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      {
        provider: cfg.llmProvider,
        apiKey: cfg.apiKey,
        model: cfg.model,
      },
    );

    // Simple parser for 6 sections
    return {
      ...this.parse6(raw),
      raw,
    };
  }

  private parse6(raw: string): Format6Response {
    // Basic extraction logic
    const sections = raw.split(/### \d\./);
    return {
      problem: sections[1]?.trim() || "Unknown",
      evidence: sections[2]?.trim() || "None",
      planA: sections[3]?.trim() || "No Plan A",
      planB: sections[4]?.trim() || "No Plan B",
      patchPreview: sections[5]?.trim() || "No Preview",
      verifySteps:
        sections[6]
          ?.trim()
          .split("\n")
          .filter((l) => l.includes("-"))
          .map((l) => l.replace("-", "").trim()) || [],
    };
  }
}

export const whisperSoul = new WhisperSoul();
