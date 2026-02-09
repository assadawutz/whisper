import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// Types
type LLMProvider = "gemini" | "ollama" | "openai" | "codex";

const AGENT_REGISTRY: Record<
  string,
  { name: string; role: string; mission: string; principles: string[] }
> = {
  miralyn: {
    name: "Miralyn",
    role: "Architect",
    mission: "วางแผนกว้าง มอง Dependency ทั้งหมด และออกแบบโครงสร้างที่ยั่งยืน",
    principles: ["holistic-design", "dependency-aware", "future-proof"],
  },
  penna: {
    name: "Penna",
    role: "Coder",
    mission: "เขียน TypeScript และ Tailwind CSS ให้เนี้ยบที่สุด 1:1 ตามแบบ",
    principles: ["pixel-perfect", "clean-code", "type-safety"],
  },
  safetia: {
    name: "Safetia",
    role: "Security",
    mission: "คุมกฎความปลอดภัย ห้าม Hardcode, บังคับใช้ .env",
    principles: ["defensive-first", "no-secrets-in-code", "safe-by-default"],
  },
  flux: {
    name: "Flux",
    role: "Weaver",
    mission: "จัดการ State การเขียนไฟล์: snapshot + rollback ได้เร็ว",
    principles: ["atomic-writes", "rollback-ready", "preview-first"],
  },
  checkka: {
    name: "Checkka",
    role: "Runner",
    mission: "รันคำสั่ง ตรวจสอบ Error และเก็บ Evidence จาก Terminal",
    principles: ["evidence-based", "thorough-check", "accurate-reporting"],
  },
};

// In-memory storage
const tasks = new Map<string, any>();
const memories = new Map<string, any[]>();
const scars = new Map<string, any[]>();

/**
 * Call LLM based on provider
 */
async function callLLM(
  prompt: string,
  config: {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
    ollamaUrl?: string;
  },
): Promise<string> {
  const { provider, apiKey, model, ollamaUrl } = config;

  if (provider === "ollama") {
    // Ollama (Local)
    const baseUrl = ollamaUrl || "http://localhost:11434";
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "llama3.2",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message?.content || "";
  }

  if (provider === "openai" || provider === "codex") {
    // OpenAI / Codex
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || (provider === "codex" ? "gpt-4o" : "gpt-4o-mini"),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // Gemini (default)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-2.0-flash"}:generateContent?key=${encodeURIComponent(apiKey || "")}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const {
      goal,
      apiKey,
      provider = "gemini",
      model,
      ollamaUrl,
    } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Missing goal" }, { status: 400 });
    }

    // Validate based on provider
    if (provider !== "ollama" && !apiKey) {
      return NextResponse.json(
        { error: "Missing apiKey for cloud provider" },
        { status: 400 },
      );
    }

    const taskId = nanoid();
    const startAgent = "miralyn";
    const agent = AGENT_REGISTRY[startAgent];

    const task = {
      id: taskId,
      goal,
      status: "in_progress",
      currentAgent: startAgent,
      history: [],
      startedAt: Date.now(),
      provider,
      model,
    };

    // Build memory context
    const agentMemories = memories.get(startAgent) || [];
    const agentScars = scars.get(startAgent) || [];

    let memoryContext = "";

    if (agentMemories.length > 0) {
      const recentSuccesses = agentMemories
        .filter((m) => m.outcome === "success")
        .slice(-3);
      if (recentSuccesses.length > 0) {
        memoryContext += "\n\n## 🧠 PAST LEARNINGS\n";
        recentSuccesses.forEach((m) => {
          memoryContext += `- ✅ ${m.taskType}: ${m.learning}\n`;
        });
      }
    }

    if (agentScars.length > 0) {
      memoryContext += "\n\n## ⚠️ SCARS (ระวังข้อผิดพลาด)\n";
      agentScars.slice(-3).forEach((s) => {
        memoryContext += `- ❌ ${s.error} → ✅ ${s.fix}\n`;
      });
    }

    const fullPrompt = `# 🤖 ${agent.name} - ${agent.role}

## Mission
${agent.mission}

## Principles
${agent.principles.map((p) => `- ${p}`).join("\n")}
${memoryContext}

## 🔄 SELF-LEARNING MODE: ACTIVE
จำบทเรียนจากงานที่ทำ และหลีกเลี่ยงข้อผิดพลาดที่เคยเกิด

## Team Members
- **Miralyn** (Architect), **Penna** (Coder), **Safetia** (Security), **Flux** (Weaver), **Checkka** (Runner)

ถ้าต้องการ handoff: ## 🔀 HANDOFF → ส่งต่อให้ **[ชื่อ Agent]**

---

USER: คุณได้รับมอบหมายงานใหม่:
"${goal}"

วิเคราะห์และวางแผนการทำงาน:

## 📋 ANALYSIS
## 🎯 PLAN
## 🔀 HANDOFF (ถ้ามี)
## 📚 LEARNING`;

    // Call LLM with selected provider
    const response = await callLLM(fullPrompt, {
      provider: provider as LLMProvider,
      apiKey,
      model,
      ollamaUrl,
    });

    // Add to history
    task.history.push({
      id: nanoid(),
      ts: Date.now(),
      from: "system",
      to: startAgent,
      content: `งาน: ${goal}`,
      type: "task",
    });

    task.history.push({
      id: nanoid(),
      ts: Date.now(),
      from: startAgent,
      to: "user",
      content: response,
      type: "result",
    });

    // Store learning
    const existingMemories = memories.get(startAgent) || [];
    existingMemories.push({
      id: nanoid(),
      ts: Date.now(),
      taskType: goal.slice(0, 50),
      outcome: "success",
      learning: `Analyzed using ${provider}/${model || "default"}`,
    });
    memories.set(startAgent, existingMemories.slice(-50));

    // Check handoff
    const handoffMatch = response.match(
      /##\s*🔀\s*HANDOFF[\s\S]*?(?:ส่งต่อให้|→)\s*\*?\*?(\w+)\*?\*?/i,
    );
    if (handoffMatch) {
      const targetAgent = handoffMatch[1].toLowerCase();
      if (AGENT_REGISTRY[targetAgent]) {
        task.currentAgent = targetAgent;
      }
    }

    tasks.set(taskId, task);

    return NextResponse.json(task);
  } catch (err: any) {
    console.error("Agent Team Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const stats: Record<string, any> = {};

  for (const [agentId, agentMemories] of memories.entries()) {
    stats[agentId] = {
      totalMemories: agentMemories.length,
      successRate: Math.round(
        (agentMemories.filter((m) => m.outcome === "success").length /
          (agentMemories.length || 1)) *
          100,
      ),
      scarsCount: (scars.get(agentId) || []).length,
    };
  }

  return NextResponse.json({
    stats,
    tasks: Array.from(tasks.values()),
    providers: ["gemini", "ollama", "openai", "codex"],
  });
}
