import { nanoid } from "nanoid";
import { eventBus } from "@whisper/core/core/eventBus";
import { whisperSoul } from "@whisper/soul/WhisperSoul";
import { workspaceManager } from "@whisper/core/workspace/workspaceManager";
import { runnerService } from "@whisper/core/runner/runnerService";
import { addTaskMemory } from "@whisper/core/memory/taskMemory";

export type WhisperTaskStatus =
  | "idle"
  | "running"
  | "pending_approval"
  | "done"
  | "error";

export interface WhisperTask {
  id: string;
  status: WhisperTaskStatus;
  goal: string;
  agentId: string;
  responses: any[];
  proposedChanges: any[];
}

/**
 * 🛰️ WHISPER ORCHESTRATOR
 * The main control loop for the Soul + Omni system.
 */
class WhisperOrchestrator {
  private tasks: WhisperTask[] = [];

  list() {
    return this.tasks;
  }

  async startTask(goal: string, agentId: string = "miralyn") {
    const id = nanoid();
    const task: WhisperTask = {
      id,
      status: "running",
      goal,
      agentId,
      responses: [],
      proposedChanges: [],
    };

    this.tasks.push(task);
    eventBus.publish({ type: "agents:taskStarted", payload: task });

    try {
      // 1. Invoke the soul agent using the 6-section protocol
      const response = await whisperSoul.invokeAgent(agentId, goal);
      task.responses.push(response);

      // 2. Automated Validation (Checkka - Runner)
      // If there are verify steps, we could run them here if they are safe

      task.status = "pending_approval";
      eventBus.publish({ type: "agents:taskUpdated", payload: task });

      return task;
    } catch (err: any) {
      task.status = "error";
      eventBus.publish({
        type: "agents:taskFailed",
        payload: { id, error: err.message },
      });
      throw err;
    }
  }

  async approveAndApply(taskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");

    // Integration with Flux (Weaver) for atomic writing
    console.log(`[Whisper] Approving task ${taskId} for agent ${task.agentId}`);

    // In a real implementation:
    // 1. Snapshot files
    // 2. Apply patches from patchPreview
    // 3. Run verifySteps

    task.status = "done";
    eventBus.publish({ type: "agents:taskDone", payload: task });
    addTaskMemory(task.id, task.goal, "success", task.responses[0]?.raw);
  }
}

export const whisperOrchestrator = new WhisperOrchestrator();
