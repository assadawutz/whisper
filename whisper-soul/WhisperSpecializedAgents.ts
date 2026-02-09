/**
 * 🤖 WHISPER SPECIALIZED AGENTS
 * Each agent has specific responsibilities with self-learning
 */

import { nanoid } from "nanoid";

// ========== AGENT TYPES ==========

export interface AgentAction {
  id: string;
  agentId: string;
  action: string;
  input: any;
  output: any;
  success: boolean;
  ts: number;
  learnings?: string[];
}

export interface SpecializedAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  memory: AgentAction[];
  learnings: Map<string, any>;
  status: "idle" | "active" | "busy";
}

// ========== AGENT DEFINITIONS ==========

const SPECIALIZED_AGENTS: Record<
  string,
  Omit<SpecializedAgent, "memory" | "learnings" | "status">
> = {
  memoria: {
    id: "memoria",
    name: "Memoria",
    role: "Self-Learning Manager",
    description:
      "จัดการระบบ Self-Learning ทั้งหมด เก็บความทรงจำ, วิเคราะห์ Pattern, ปรับปรุงการทำงาน",
    capabilities: [
      "store_memory",
      "analyze_patterns",
      "optimize_behavior",
      "export_learnings",
    ],
  },
  nexus: {
    id: "nexus",
    name: "Nexus",
    role: "Message Router",
    description:
      "รับ-ส่งข้อความระหว่าง Agents, ประสานงานการทำงานร่วมกัน, กระจายภาระงาน",
    capabilities: [
      "route_message",
      "coordinate_agents",
      "load_balance",
      "queue_management",
    ],
  },
  swift: {
    id: "swift",
    name: "Swift",
    role: "Context Controller",
    description:
      "ควบคุม Shortcuts, Combos, Hints, Ghost Text, Inline Suggestions, Autocomplete",
    capabilities: [
      "manage_shortcuts",
      "expand_combos",
      "show_hints",
      "ghost_text",
      "autocomplete",
    ],
  },
  artisan: {
    id: "artisan",
    name: "Artisan",
    role: "Design-to-Code Specialist",
    description:
      "แปลง UI Design เป็น Tailwind CSS, จัดการ Pipeline การสร้างโค้ด",
    capabilities: [
      "analyze_design",
      "generate_tailwind",
      "optimize_css",
      "component_builder",
    ],
  },
  seeker: {
    id: "seeker",
    name: "Seeker",
    role: "Cursor & Context Tracker",
    description:
      "ติดตามตำแหน่ง Cursor, วิเคราะห์บริบท, ค้นหาข้อความในระยะใกล้, ให้ Suggestions ตามตำแหน่ง",
    capabilities: [
      "track_cursor",
      "analyze_context",
      "find_nearby",
      "position_aware_suggest",
    ],
  },
  guardian: {
    id: "guardian",
    name: "Guardian",
    role: "Pipeline Orchestrator",
    description:
      "ควบคุม Pipeline ทั้งหมด, จัดลำดับการทำงาน, ตรวจสอบ Quality Gates",
    capabilities: [
      "manage_pipeline",
      "sequence_tasks",
      "quality_check",
      "error_recovery",
    ],
  },
};

// ========== AGENT MANAGER ==========

class WhisperAgentManager {
  private agents: Map<string, SpecializedAgent> = new Map();
  private actionLog: AgentAction[] = [];

  constructor() {
    this.initAgents();
    this.load();
  }

  private initAgents() {
    for (const [id, config] of Object.entries(SPECIALIZED_AGENTS)) {
      this.agents.set(id, {
        ...config,
        memory: [],
        learnings: new Map(),
        status: "idle",
      });
    }
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("whisper_agents_state");
      if (saved) {
        const data = JSON.parse(saved);
        for (const [id, agentData] of Object.entries(data.agents || {})) {
          const agent = this.agents.get(id);
          if (agent) {
            agent.memory = (agentData as any).memory || [];
            agent.learnings = new Map(
              Object.entries((agentData as any).learnings || {}),
            );
          }
        }
        this.actionLog = data.actionLog || [];
      }
    } catch (err) {
      console.warn("Failed to load agent state:", err);
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      const data: any = {
        agents: {},
        actionLog: this.actionLog.slice(-500),
      };
      for (const [id, agent] of this.agents.entries()) {
        data.agents[id] = {
          memory: agent.memory.slice(-100),
          learnings: Object.fromEntries(agent.learnings),
        };
      }
      localStorage.setItem("whisper_agents_state", JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save agent state:", err);
    }
  }

  // ========== AGENT OPERATIONS ==========

  getAgent(id: string): SpecializedAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): SpecializedAgent[] {
    return Array.from(this.agents.values());
  }

  async invokeAgent(agentId: string, action: string, input: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.status = "active";
    const actionId = nanoid();

    try {
      const output = await this.executeAction(agentId, action, input);

      const actionRecord: AgentAction = {
        id: actionId,
        agentId,
        action,
        input,
        output,
        success: true,
        ts: Date.now(),
        learnings: this.extractLearnings(action, input, output),
      };

      agent.memory.push(actionRecord);
      this.actionLog.push(actionRecord);
      this.updateLearnings(agent, actionRecord);
      this.save();

      return output;
    } catch (err: any) {
      const actionRecord: AgentAction = {
        id: actionId,
        agentId,
        action,
        input,
        output: { error: err.message },
        success: false,
        ts: Date.now(),
      };

      agent.memory.push(actionRecord);
      this.actionLog.push(actionRecord);
      this.save();

      throw err;
    } finally {
      agent.status = "idle";
    }
  }

  private async executeAction(
    agentId: string,
    action: string,
    input: any,
  ): Promise<any> {
    // Agent-specific action handlers
    switch (agentId) {
      case "memoria":
        return this.handleMemoriaAction(action, input);
      case "nexus":
        return this.handleNexusAction(action, input);
      case "swift":
        return this.handleSwiftAction(action, input);
      case "artisan":
        return this.handleArtisanAction(action, input);
      case "seeker":
        return this.handleSeekerAction(action, input);
      case "guardian":
        return this.handleGuardianAction(action, input);
      default:
        return { message: "Unknown agent" };
    }
  }

  // ========== AGENT HANDLERS ==========

  private handleMemoriaAction(action: string, input: any): any {
    switch (action) {
      case "store_memory":
        return { stored: true, key: input.key };
      case "analyze_patterns":
        return this.analyzePatterns();
      case "export_learnings":
        return this.exportAllLearnings();
      default:
        return { action, processed: true };
    }
  }

  private handleNexusAction(action: string, input: any): any {
    switch (action) {
      case "route_message":
        return { routed: true, to: input.target };
      case "coordinate_agents":
        return { coordinated: input.agents };
      default:
        return { action, processed: true };
    }
  }

  private handleSwiftAction(action: string, input: any): any {
    switch (action) {
      case "expand_combo":
        return { expanded: input.combo, result: input.expansion };
      case "show_hints":
        return { hints: input.hints };
      case "autocomplete":
        return { suggestions: input.suggestions };
      default:
        return { action, processed: true };
    }
  }

  private handleArtisanAction(action: string, input: any): any {
    switch (action) {
      case "analyze_design":
        return { analyzed: true, components: input.components || [] };
      case "generate_tailwind":
        return { generated: true, code: input.code };
      default:
        return { action, processed: true };
    }
  }

  private handleSeekerAction(action: string, input: any): any {
    switch (action) {
      case "track_cursor":
        return { position: input.position, context: input.context };
      case "find_nearby":
        return { found: input.nearby || [] };
      default:
        return { action, processed: true };
    }
  }

  private handleGuardianAction(action: string, input: any): any {
    switch (action) {
      case "manage_pipeline":
        return { pipeline: input.stages, status: "managed" };
      case "quality_check":
        return { passed: true, score: 95 };
      default:
        return { action, processed: true };
    }
  }

  // ========== SELF-LEARNING ==========

  private extractLearnings(action: string, input: any, output: any): string[] {
    const learnings: string[] = [];

    if (output && !output.error) {
      learnings.push(`Action "${action}" สำเร็จ`);
      if (typeof input === "object") {
        learnings.push(`Input pattern: ${Object.keys(input).join(", ")}`);
      }
    }

    return learnings;
  }

  private updateLearnings(agent: SpecializedAgent, action: AgentAction) {
    // Track action frequency
    const key = `action:${action.action}`;
    agent.learnings.set(key, (agent.learnings.get(key) || 0) + 1);

    // Track success rate
    const successKey = `success:${action.action}`;
    const currentRate = agent.learnings.get(successKey) || {
      success: 0,
      total: 0,
    };
    currentRate.total++;
    if (action.success) currentRate.success++;
    agent.learnings.set(successKey, currentRate);
  }

  private analyzePatterns(): any {
    const patterns: Record<string, any> = {};

    for (const [id, agent] of this.agents.entries()) {
      patterns[id] = {
        totalActions: agent.memory.length,
        successRate: this.calculateSuccessRate(agent),
        topActions: this.getTopActions(agent),
      };
    }

    return patterns;
  }

  private calculateSuccessRate(agent: SpecializedAgent): number {
    if (agent.memory.length === 0) return 100;
    const success = agent.memory.filter((a) => a.success).length;
    return Math.round((success / agent.memory.length) * 100);
  }

  private getTopActions(agent: SpecializedAgent): string[] {
    const actionCounts = new Map<string, number>();
    for (const action of agent.memory) {
      actionCounts.set(
        action.action,
        (actionCounts.get(action.action) || 0) + 1,
      );
    }
    return Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action]) => action);
  }

  private exportAllLearnings(): any {
    const result: Record<string, any> = {};
    for (const [id, agent] of this.agents.entries()) {
      result[id] = {
        learnings: Object.fromEntries(agent.learnings),
        recentActions: agent.memory.slice(-10),
      };
    }
    return result;
  }

  // ========== STATS ==========

  getStats() {
    const stats: Record<string, any> = {};
    for (const [id, agent] of this.agents.entries()) {
      stats[id] = {
        name: agent.name,
        role: agent.role,
        status: agent.status,
        actionsCount: agent.memory.length,
        successRate: this.calculateSuccessRate(agent),
        capabilities: agent.capabilities,
      };
    }
    return stats;
  }

  getActionLog(): AgentAction[] {
    return this.actionLog.slice(-100);
  }
}

export const agentManager = new WhisperAgentManager();
