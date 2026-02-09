// Whisper Soul Exports

// Agent Memory with Self-Learning
export { agentMemory } from "./WhisperAgentMemory";
export type {
  MemoryEntry,
  Scar,
  Skill,
  AgentMemoryState,
} from "./WhisperAgentMemory";

// Agent Team
export { whisperAgentTeam } from "./WhisperAgentTeam";
export type { AgentMessage, AgentTeamTask } from "./WhisperAgentTeam";

// Specialized Agents
export { agentManager } from "./WhisperSpecializedAgents";
export type { AgentAction, SpecializedAgent } from "./WhisperSpecializedAgents";

// Agent Registry
export { AGENT_REGISTRY } from "./agentRegistry";
export type { AgentProfile } from "./agentRegistry";
