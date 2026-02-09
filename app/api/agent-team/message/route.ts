import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

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

// Simple in-memory store (in production, use Redis or database)
const tasks = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { taskId, message, apiKey } = await req.json();

    if (!taskId || !message || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get task (in production, fetch from database)
    let task = tasks.get(taskId);

    if (!task) {
      // Try to reconstruct from request
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const currentAgent = task.currentAgent || "miralyn";
    const agent = AGENT_REGISTRY[currentAgent];

    // Build context from history
    const historyContext = task.history
      .slice(-10) // Last 10 messages
      .map((m: any) => `${m.from.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `# 🤖 ${agent.name} - ${agent.role}

## Mission
${agent.mission}

## Principles
${agent.principles.map((p) => `- ${p}`).join("\n")}

## Current Task
${task.goal}

## Conversation History
${historyContext}

## Response Format
ตอบเป็นภาษาไทย ใช้ Markdown
ถ้าต้องการส่งต่อให้ Agent อื่น ใช้:
## 🔀 HANDOFF
ส่งต่อให้ **[ชื่อ Agent]**: [เหตุผล]`;

    // Call Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUSER: ${message}` }],
          },
        ],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
    }

    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Add messages
    task.history.push({
      id: nanoid(),
      ts: Date.now(),
      from: "user",
      to: currentAgent,
      content: message,
      type: "chat",
    });

    task.history.push({
      id: nanoid(),
      ts: Date.now(),
      from: currentAgent,
      to: "user",
      content: response,
      type: "result",
    });

    // Check for handoff
    const handoffMatch = response.match(
      /##\s*🔀\s*HANDOFF[\s\S]*?(?:ส่งต่อให้|handoff to)\s*\*?\*?(\w+)\*?\*?/i,
    );
    if (handoffMatch) {
      const targetAgent = handoffMatch[1].toLowerCase();
      if (AGENT_REGISTRY[targetAgent]) {
        task.history.push({
          id: nanoid(),
          ts: Date.now(),
          from: currentAgent,
          to: targetAgent,
          content: `Handoff: ${handoffMatch[0]}`,
          type: "handoff",
        });
        task.currentAgent = targetAgent;
      }
    }

    tasks.set(taskId, task);

    return NextResponse.json(task);
  } catch (err: any) {
    console.error("Message Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
