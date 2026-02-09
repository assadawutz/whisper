/**
 * 🧠 WHISPER AGENT MEMORY - SELF-LEARNING SYSTEM
 * Stores experiences, learns from outcomes, and improves over time.
 */

export interface MemoryEntry {
  id: string;
  ts: number;
  agentId: string;
  taskType: string;
  input: string;
  output: string;
  outcome: "success" | "failure" | "partial";
  feedback?: string;
  learnings: string[];
  embeddings?: number[]; // For semantic search
}

export interface Scar {
  id: string;
  ts: number;
  agentId: string;
  error: string;
  context: string;
  fix: string;
  prevention: string;
}

export interface Skill {
  id: string;
  name: string;
  agentId: string;
  proficiency: number; // 0-100
  usageCount: number;
  lastUsed: number;
  examples: string[];
}

export interface AgentMemoryState {
  memories: MemoryEntry[];
  scars: Scar[];
  skills: Map<string, Skill>;
  learningRate: number;
}

const STORAGE_KEY = "whisper_agent_memory";

class WhisperAgentMemory {
  private state: AgentMemoryState = {
    memories: [],
    scars: [],
    skills: new Map(),
    learningRate: 0.1,
  };

  constructor() {
    this.load();
  }

  /**
   * Load memory from localStorage
   */
  private load() {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.state.memories = data.memories || [];
        this.state.scars = data.scars || [];
        this.state.skills = new Map(Object.entries(data.skills || {}));
        this.state.learningRate = data.learningRate || 0.1;
      }
    } catch (err) {
      console.warn("Failed to load agent memory:", err);
    }
  }

  /**
   * Save memory to localStorage
   */
  private save() {
    if (typeof window === "undefined") return;

    try {
      const data = {
        memories: this.state.memories.slice(-500), // Keep last 500
        scars: this.state.scars.slice(-100), // Keep last 100
        skills: Object.fromEntries(this.state.skills),
        learningRate: this.state.learningRate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save agent memory:", err);
    }
  }

  /**
   * Record a new experience
   */
  recordExperience(entry: Omit<MemoryEntry, "id" | "ts" | "learnings">) {
    const experience: MemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      learnings: this.extractLearnings(entry),
    };

    this.state.memories.push(experience);
    this.updateSkills(entry.agentId, entry.taskType, entry.outcome);
    this.save();

    return experience;
  }

  /**
   * Extract learnings from an experience
   */
  private extractLearnings(
    entry: Omit<MemoryEntry, "id" | "ts" | "learnings">,
  ): string[] {
    const learnings: string[] = [];

    if (entry.outcome === "success") {
      learnings.push(`✅ งาน "${entry.taskType}" สำเร็จ`);
      learnings.push(`📝 วิธีการที่ใช้: ${entry.output.slice(0, 100)}...`);
    } else if (entry.outcome === "failure") {
      learnings.push(`❌ งาน "${entry.taskType}" ล้มเหลว`);
      learnings.push(`⚠️ ต้องระวัง: ${entry.feedback || "ไม่มีรายละเอียด"}`);
    }

    return learnings;
  }

  /**
   * Record a scar (lesson from failure)
   */
  recordScar(scar: Omit<Scar, "id" | "ts">) {
    const newScar: Scar = {
      ...scar,
      id: `scar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
    };

    this.state.scars.push(newScar);
    this.save();

    return newScar;
  }

  /**
   * Update skill proficiency
   */
  private updateSkills(
    agentId: string,
    skillName: string,
    outcome: "success" | "failure" | "partial",
  ) {
    const skillKey = `${agentId}:${skillName}`;
    let skill = this.state.skills.get(skillKey);

    if (!skill) {
      skill = {
        id: skillKey,
        name: skillName,
        agentId,
        proficiency: 50,
        usageCount: 0,
        lastUsed: Date.now(),
        examples: [],
      };
    }

    skill.usageCount++;
    skill.lastUsed = Date.now();

    // Adjust proficiency based on outcome
    const delta = this.state.learningRate * 10;
    if (outcome === "success") {
      skill.proficiency = Math.min(100, skill.proficiency + delta);
    } else if (outcome === "failure") {
      skill.proficiency = Math.max(0, skill.proficiency - delta);
    }

    this.state.skills.set(skillKey, skill);
  }

  /**
   * Get relevant memories for a task
   */
  getRelevantMemories(
    agentId: string,
    taskType: string,
    limit = 5,
  ): MemoryEntry[] {
    return this.state.memories
      .filter((m) => m.agentId === agentId || m.taskType === taskType)
      .sort((a, b) => {
        // Prioritize: same agent + same task > same task > same agent
        const scoreA =
          (a.agentId === agentId ? 2 : 0) +
          (a.taskType === taskType ? 3 : 0) +
          (a.outcome === "success" ? 1 : 0);
        const scoreB =
          (b.agentId === agentId ? 2 : 0) +
          (b.taskType === taskType ? 3 : 0) +
          (b.outcome === "success" ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Get relevant scars (past failures to avoid)
   */
  getRelevantScars(agentId: string, limit = 3): Scar[] {
    return this.state.scars.filter((s) => s.agentId === agentId).slice(-limit);
  }

  /**
   * Build context from memory for an agent
   */
  buildMemoryContext(agentId: string, taskType: string): string {
    const memories = this.getRelevantMemories(agentId, taskType);
    const scars = this.getRelevantScars(agentId);
    const skills = Array.from(this.state.skills.values())
      .filter((s) => s.agentId === agentId)
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5);

    let context = "";

    if (memories.length > 0) {
      context += "## 🧠 PAST EXPERIENCES\n";
      memories.forEach((m) => {
        context += `- [${m.outcome}] ${m.taskType}: ${m.learnings.join(", ")}\n`;
      });
      context += "\n";
    }

    if (scars.length > 0) {
      context += "## ⚠️ LESSONS LEARNED (SCARS)\n";
      scars.forEach((s) => {
        context += `- ❌ ${s.error}\n  ✅ Fix: ${s.fix}\n  🛡️ Prevention: ${s.prevention}\n`;
      });
      context += "\n";
    }

    if (skills.length > 0) {
      context += "## 💪 YOUR SKILLS\n";
      skills.forEach((s) => {
        const bar =
          "█".repeat(Math.floor(s.proficiency / 10)) +
          "░".repeat(10 - Math.floor(s.proficiency / 10));
        context += `- ${s.name}: [${bar}] ${s.proficiency}%\n`;
      });
      context += "\n";
    }

    return context;
  }

  /**
   * Get all memories for export
   */
  getAllMemories(): MemoryEntry[] {
    return this.state.memories;
  }

  /**
   * Get all scars for export
   */
  getAllScars(): Scar[] {
    return this.state.scars;
  }

  /**
   * Get all skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.state.skills.values());
  }

  /**
   * Get stats
   */
  getStats() {
    const totalMemories = this.state.memories.length;
    const successRate =
      this.state.memories.filter((m) => m.outcome === "success").length /
      (totalMemories || 1);
    const totalScars = this.state.scars.length;
    const topSkills = Array.from(this.state.skills.values())
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5);

    return {
      totalMemories,
      successRate: Math.round(successRate * 100),
      totalScars,
      topSkills: topSkills.map((s) => ({
        name: s.name,
        proficiency: s.proficiency,
      })),
    };
  }

  /**
   * Clear all memory
   */
  clear() {
    this.state = {
      memories: [],
      scars: [],
      skills: new Map(),
      learningRate: 0.1,
    };
    this.save();
  }
}

export const agentMemory = new WhisperAgentMemory();
