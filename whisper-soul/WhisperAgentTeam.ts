import { nanoid } from "nanoid";
import { eventBus } from "@whisper/core/core/eventBus";
import { llmClient } from "@whisper/core/llm/llmClient";
import { loadConfig } from "@whisper/core/core/configStore";
import { AGENT_REGISTRY, AgentProfile } from "./agentRegistry";

export type AgentMessageRole = "system" | "user" | "agent";

export interface AgentMessage {
  id: string;
  ts: number;
  from: string; // agent ID or "user" or "system"
  to: string; // agent ID or "all" or "user"
  content: string;
  type: "chat" | "task" | "result" | "handoff" | "approval";
}

export interface AgentTeamTask {
  id: string;
  goal: string;
  status:
    | "pending"
    | "in_progress"
    | "waiting_approval"
    | "completed"
    | "failed";
  currentAgent: string;
  history: AgentMessage[];
  result?: string;
  startedAt: number;
  completedAt?: number;
}

/**
 * 🤖 WHISPER AGENT TEAM
 * Multi-agent collaboration system like Cursor.
 */
class WhisperAgentTeam {
  private tasks: Map<string, AgentTeamTask> = new Map();
  private messageLog: AgentMessage[] = [];

  /**
   * Start a new task with the agent team
   */
  async startTask(
    goal: string,
    startAgent: string = "miralyn",
  ): Promise<AgentTeamTask> {
    const taskId = nanoid();
    const task: AgentTeamTask = {
      id: taskId,
      goal,
      status: "pending",
      currentAgent: startAgent,
      history: [],
      startedAt: Date.now(),
    };

    this.tasks.set(taskId, task);

    // Emit event
    eventBus.publish({
      type: "agent:taskCreated",
      payload: { taskId, goal },
    });

    // Start the conversation
    await this.runAgent(
      taskId,
      startAgent,
      `
คุณได้รับมอบหมายงานใหม่:
"${goal}"

วิเคราะห์งานนี้และวางแผนการทำงาน ถ้าต้องการความช่วยเหลือจาก Agent อื่น ให้บอกว่าต้องการ handoff ไปให้ใคร:
- **PENNA** (Coder): ถ้าต้องเขียน/แก้โค้ด
- **SAFETIA** (Security): ถ้าต้องตรวจสอบความปลอดภัย
- **FLUX** (Weaver): ถ้าต้องจัดการไฟล์/snapshot
- **CHECKKA** (Runner): ถ้าต้องรันคำสั่ง terminal

ตอบในรูปแบบ:
## 📋 ANALYSIS
[วิเคราะห์งาน]

## 🎯 PLAN
[แผนการทำงาน]

## 🔀 HANDOFF (ถ้ามี)
[ชื่อ Agent ที่ต้องการส่งต่อ และเหตุผล]
`,
    );

    return task;
  }

  /**
   * Run a specific agent on a task
   */
  async runAgent(
    taskId: string,
    agentId: string,
    prompt: string,
  ): Promise<string> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");

    const agent = AGENT_REGISTRY[agentId];
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    task.status = "in_progress";
    task.currentAgent = agentId;

    // Add user message to history
    const userMsg: AgentMessage = {
      id: nanoid(),
      ts: Date.now(),
      from: "system",
      to: agentId,
      content: prompt,
      type: "task",
    };
    task.history.push(userMsg);
    this.messageLog.push(userMsg);

    // Build context from history
    const context = this.buildContext(task, agent);
    const cfg = loadConfig();

    // Call LLM as this agent
    const response = await llmClient.call(
      [{ role: "system", content: context.systemPrompt }, ...context.messages],
      {
        provider: cfg.llmProvider,
        apiKey: cfg.apiKey,
        model: cfg.model,
      },
    );

    // Add agent response to history
    const agentMsg: AgentMessage = {
      id: nanoid(),
      ts: Date.now(),
      from: agentId,
      to: "user",
      content: response,
      type: "result",
    };
    task.history.push(agentMsg);
    this.messageLog.push(agentMsg);

    // Emit event
    eventBus.publish({
      type: "agent:response",
      payload: { taskId, agentId, response },
    });

    // Check for handoff
    const handoff = this.detectHandoff(response);
    if (handoff) {
      await this.handleHandoff(
        taskId,
        agentId,
        handoff.targetAgent,
        handoff.reason,
      );
    }

    return response;
  }

  /**
   * Handle handoff between agents
   */
  async handleHandoff(
    taskId: string,
    fromAgent: string,
    toAgent: string,
    reason: string,
  ) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const handoffMsg: AgentMessage = {
      id: nanoid(),
      ts: Date.now(),
      from: fromAgent,
      to: toAgent,
      content: reason,
      type: "handoff",
    };
    task.history.push(handoffMsg);
    this.messageLog.push(handoffMsg);

    eventBus.publish({
      type: "agent:handoff",
      payload: { taskId, from: fromAgent, to: toAgent, reason },
    });

    // Get summary from previous agent's work
    const previousWork = task.history
      .filter((m) => m.from === fromAgent && m.type === "result")
      .map((m) => m.content)
      .join("\n\n");

    // Run the next agent
    await this.runAgent(
      taskId,
      toAgent,
      `
## 🔀 HANDOFF จาก ${AGENT_REGISTRY[fromAgent]?.name || fromAgent}

${reason}

## 📜 งานที่ทำไปแล้ว:
${previousWork}

## 🎯 งานหลัก:
${task.goal}

กรุณาดำเนินการต่อตามบทบาทของคุณ
`,
    );
  }

  /**
   * Detect if agent wants to handoff
   */
  private detectHandoff(
    response: string,
  ): { targetAgent: string; reason: string } | null {
    const handoffMatch = response.match(
      /##\s*🔀\s*HANDOFF[^#]*?(?:ส่งต่อให้|handoff to|ต้องการ)\s*\*?\*?(\w+)\*?\*?[:\s]*([\s\S]*?)(?=##|$)/i,
    );

    if (handoffMatch) {
      const agentName = handoffMatch[1].toLowerCase();
      const agentMap: Record<string, string> = {
        penna: "penna",
        safetia: "safetia",
        flux: "flux",
        checkka: "checkka",
        miralyn: "miralyn",
      };

      const targetAgent = agentMap[agentName];
      if (targetAgent) {
        return {
          targetAgent,
          reason: handoffMatch[2].trim() || "ดำเนินการต่อ",
        };
      }
    }

    return null;
  }

  /**
   * Build context for agent
   */
  private buildContext(task: AgentTeamTask, agent: AgentProfile) {
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
ส่งต่อให้ **[ชื่อ Agent]**: [เหตุผล]
`;

    const messages = task.history
      .filter((m) => m.to === agent.id || m.from === agent.id || m.to === "all")
      .map((m) => ({
        role: (m.from === agent.id ? "assistant" : "user") as
          | "system"
          | "user"
          | "assistant",
        content: m.content,
      }));

    return { systemPrompt, messages };
  }

  /**
   * Send a message to the current agent
   */
  async sendMessage(taskId: string, message: string): Promise<string> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");

    return this.runAgent(taskId, task.currentAgent, message);
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTeamTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): AgentTeamTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, result: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = "completed";
    task.result = result;
    task.completedAt = Date.now();

    eventBus.publish({
      type: "agent:taskCompleted",
      payload: { taskId, result },
    });
  }
}

export const whisperAgentTeam = new WhisperAgentTeam();
