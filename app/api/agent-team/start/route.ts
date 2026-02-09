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

// In-memory task storage
const tasks = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { goal, apiKey } = await req.json();

    if (!goal || !apiKey) {
      return NextResponse.json(
        { error: "Missing goal or apiKey" },
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
    };

    // Build system prompt
    const systemPrompt = `# 🤖 ${agent.name} - ${agent.role}

## Mission
${agent.mission}

## Principles
${agent.principles.map((p) => `- ${p}`).join("\n")}

## Team Members
- **Miralyn** (Architect): วางแผนและออกแบบโครงสร้าง
- **Penna** (Coder): เขียนและแก้ไข Code
- **Safetia** (Security): ตรวจสอบความปลอดภัย
- **Flux** (Weaver): จัดการไฟล์และ Snapshot
- **Checkka** (Runner): รันคำสั่งและเก็บ Evidence

## Response Format
ตอบเป็นภาษาไทย ใช้ Markdown อย่างสวยงาม
ถ้าต้องการ handoff ให้ใช้:
## 🔀 HANDOFF
ส่งต่อให้ **[ชื่อ Agent]**: [เหตุผล]`;

    const userPrompt = `คุณได้รับมอบหมายงานใหม่:
"${goal}"

วิเคราะห์งานนี้และวางแผนการทำงาน ถ้าต้องการความช่วยเหลือจาก Agent อื่น ให้บอกว่าต้องการ handoff ไปให้ใคร

ตอบในรูปแบบ:
## 📋 ANALYSIS
[วิเคราะห์งาน]

## 🎯 PLAN
[แผนการทำงาน]

## 🔀 HANDOFF (ถ้ามี)
[ชื่อ Agent ที่ต้องการส่งต่อ และเหตุผล]`;

    // Call Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUSER: ${userPrompt}` }],
          },
        ],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini Error:", errorText);
      return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
    }

    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Add messages to history
    task.history.push({
      id: nanoid(),
      ts: Date.now(),
      from: "system",
      to: startAgent,
      content: userPrompt,
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

    // Check for handoff
    const handoffMatch = response.match(
      /##\s*🔀\s*HANDOFF[\s\S]*?(?:ส่งต่อให้|handoff to)\s*\*?\*?(\w+)\*?\*?/i,
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
