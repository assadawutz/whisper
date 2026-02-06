import { nanoid } from "nanoid";
import { eventBus } from "../core/eventBus";
import { loadConfig, getActiveProviderConfig } from "../core/configStore";
import { llmClient } from "../llm/llmClient";
import type { LlmMessage } from "../llm/llmTypes";
import type {
  AgentResult,
  ReviewResult,
  ProposedChange,
} from "../agents/agentTypes";
import {
  systemPromptCoder,
  systemPromptReviewer,
  systemPromptFixLoop,
  systemPromptPlanner,
  systemPromptSummarizer,
} from "../agents/prompts";
import { workspaceManager } from "../workspace/workspaceManager";
import { runnerService } from "../runner/runnerService";
import { parseStack } from "../runner/stackTrace";
import { buildDepGraph } from "../analysis/depsGraph";
import { addTaskMemory } from "../memory/taskMemory";

export type TaskStatus =
  | "idle"
  | "running"
  | "pending_approval"
  | "done"
  | "error";

export type FixIteration = {
  i: number;
  coderNotes?: string;
  reviewerNotes?: string;
  run: { stdout: string; stderr: string; error?: string; parsedError?: any };
};

export type Task = {
  id: string;
  status: TaskStatus;
  goal: string;
  focusPaths: string[];
  notes?: string;
  reviewNotes?: string;
  error?: string;
  rawCoder?: string;
  rawReviewer?: string;
  proposed?: ProposedChange[];
  iterations?: FixIteration[];
};

type PlanResult = { notes: string; focusPaths: string[] };
type SummaryResult = {
  summary: string;
  outcome: "success" | "fail" | "partial";
};

class Orchestrator {
  private tasks: Task[] = [];

  list() {
    return this.tasks;
  }

  get(taskId: string) {
    return this.tasks.find((t) => t.id === taskId) ?? null;
  }

  private update(taskId: string, patch: Partial<Task>) {
    this.tasks = this.tasks.map((t) =>
      t.id === taskId ? ({ ...t, ...patch } as Task) : t,
    );
    eventBus.publish({ type: "agents:taskUpdated", payload: { taskId } });
  }

  private getWorkspaceSnapshot() {
    const ws = workspaceManager.getCurrent();
    if (!ws) return null;
    const files: Record<
      string,
      { content: string; language: any; metadata?: any }
    > = {};
    for (const [p, f] of Object.entries(ws.files))
      files[p] = {
        content: f.content,
        language: f.language,
        metadata: f.metadata,
      };
    return { ws, files };
  }

  async planFocus(goal: string) {
    const snap = this.getWorkspaceSnapshot();
    if (!snap) return null;
    const cfg = loadConfig();

    const entry =
      Object.values(snap.ws.files).find((f) => f.metadata?.isEntryPoint)
        ?.path ?? "main.js";
    const graph = buildDepGraph(
      Object.fromEntries(
        Object.entries(snap.files).map(([k, v]) => [k, { content: v.content }]),
      ),
    );

    const plannerMessages: LlmMessage[] = [
      { role: "system", content: systemPromptPlanner() },
      {
        role: "user",
        content:
          `Goal:\n${goal}\n\nEntry:\n${entry}\n\nWorkspace files (paths only):\n${JSON.stringify(Object.keys(snap.files))}` +
          `\n\nDependency adjacency (best-effort):\n${JSON.stringify(graph.adjacency)}`,
      },
    ];

    const activeCfg = getActiveProviderConfig(cfg);
    const response = await llmClient.call(plannerMessages, {
      provider: cfg.llmProvider,
      apiKey: activeCfg?.apiKey || "",
      model: activeCfg?.model || "",
    });
    const plan = JSON.parse(response.content) as PlanResult;
    const existing = new Set(Object.keys(snap.files));
    const focus = (plan.focusPaths || [])
      .filter((p) => existing.has(p))
      .slice(0, 12);
    return {
      notes: plan.notes,
      focusPaths: focus.length ? focus : [entry].filter((p) => existing.has(p)),
    };
  }

  async runEditTask(goal: string, focusPaths: string[]) {
    const snap = this.getWorkspaceSnapshot();
    if (!snap) {
      eventBus.publish({
        type: "ui:toast",
        payload: { kind: "error", text: "No workspace loaded" },
      });
      return null;
    }
    const id = nanoid();
    const task: Task = {
      id,
      status: "running",
      goal,
      focusPaths,
      iterations: [],
    };
    this.tasks = [task, ...this.tasks];
    eventBus.publish({ type: "agents:taskUpdated", payload: { taskId: id } });

    try {
      const cfg = loadConfig();
      const fileContext = focusPaths
        .map((p) => {
          const f = snap.ws.files[p];
          return f ? `FILE: ${p}\n${f.content}` : `FILE: ${p}\n<missing>`;
        })
        .join("\n\n");

      const coderMessages: LlmMessage[] = [
        { role: "system", content: systemPromptCoder() },
        {
          role: "user",
          content: `Goal:\n${goal}\n\nfocusPaths:\n${JSON.stringify(focusPaths)}\n\nWorkspace files:\n${fileContext}`,
        },
      ];
      const activeCfg = getActiveProviderConfig(cfg);
      const response = await llmClient.call(coderMessages, {
        provider: cfg.llmProvider,
        apiKey: activeCfg?.apiKey || "",
        model: activeCfg?.model || "",
      });
      const coder = JSON.parse(response.content) as AgentResult;
      const proposedEdits = coder.edits.filter((e) =>
        focusPaths.includes(e.path),
      );

      const reviewerMessages: LlmMessage[] = [
        { role: "system", content: systemPromptReviewer() },
        {
          role: "user",
          content: `Goal:\n${goal}\n\nfocusPaths:\n${JSON.stringify(focusPaths)}\n\nOriginal files:\n${fileContext}\n\nProposed edits (JSON):\n${JSON.stringify({ notes: coder.notes, edits: proposedEdits })}`,
        },
      ];
      const responseReviewer = await llmClient.call(reviewerMessages, {
        provider: cfg.llmProvider,
        apiKey: activeCfg?.apiKey || "",
        model: activeCfg?.model || "",
      });
      const review = JSON.parse(responseReviewer.content) as ReviewResult;
      const reviewedEdits = review.edits.filter((e) =>
        focusPaths.includes(e.path),
      );

      const proposed: ProposedChange[] = reviewedEdits.map((e) => {
        const old = snap.ws.files[e.path]?.content ?? "";
        return {
          path: e.path,
          language: e.language,
          oldContent: old,
          newContent: e.newContent,
        };
      });

      this.update(id, {
        status: "pending_approval",
        notes: coder.notes,
        reviewNotes: review.notes,
        rawCoder: response.content,
        rawReviewer: responseReviewer.content,
        proposed,
      });
      eventBus.publish({
        type: "ui:toast",
        payload: {
          kind: "info",
          text: "AI task ready: review diffs and approve.",
        },
      });
      return id;
    } catch (e: any) {
      this.update(id, {
        status: "error",
        error: e?.message ? String(e.message) : String(e),
      });
      eventBus.publish({
        type: "ui:toast",
        payload: {
          kind: "error",
          text: "AI task failed. Check settings/API key.",
        },
      });
      return null;
    }
  }

  private async summarizeAndStore(
    goal: string,
    focusPaths: string[],
    iterations: FixIteration[],
    lastError?: string,
  ) {
    try {
      const cfg = loadConfig();
      const last = iterations[iterations.length - 1];
      const context =
        `Goal: ${goal}\nFocus: ${JSON.stringify(focusPaths)}\n` +
        `Iterations: ${iterations.length}\n` +
        `Last run error: ${lastError ?? "none"}\n` +
        `Last notes: ${last?.coderNotes ?? ""} / ${last?.reviewerNotes ?? ""}`;

      const msgs: LlmMessage[] = [
        { role: "system", content: systemPromptSummarizer() },
        { role: "user", content: context },
      ];
      const activeCfg = getActiveProviderConfig(cfg);
      const response = await llmClient.call(msgs, {
        provider: cfg.llmProvider,
        apiKey: activeCfg?.apiKey || "",
        model: activeCfg?.model || "",
      });
      const sum = JSON.parse(response.content) as SummaryResult;
      addTaskMemory({
        id: nanoid(),
        createdAt: Date.now(),
        goal,
        focusPaths,
        outcome: sum.outcome,
        lastError,
        summary: String(sum.summary || "").slice(0, 400),
      });
    } catch {
      // ignore
    }
  }

  async runAutoFix(
    goal: string,
    focusPaths: string[],
    maxIters = 4,
    testAlso = true,
  ) {
    const snap = this.getWorkspaceSnapshot();
    if (!snap) {
      eventBus.publish({
        type: "ui:toast",
        payload: { kind: "error", text: "No workspace loaded" },
      });
      return null;
    }

    const entry =
      Object.values(snap.ws.files).find((f) => f.metadata?.isEntryPoint)
        ?.path ?? "main.js";
    const id = nanoid();
    const task: Task = {
      id,
      status: "running",
      goal,
      focusPaths,
      iterations: [],
    };
    this.tasks = [task, ...this.tasks];
    eventBus.publish({ type: "agents:taskUpdated", payload: { taskId: id } });

    const cfg = loadConfig();

    // working copy (in-memory)
    const working: Record<string, { language: any; content: string }> = {};
    for (const [p, f] of Object.entries(snap.ws.files))
      working[p] = { language: f.language, content: f.content };

    let last = {
      stdout: "",
      stderr: "",
      error: undefined as string | undefined,
      parsedError: null as any,
    };
    let lastMsg = "";
    let sameErrCount = 0;
    let madeChange = false;

    const runTests = async (): Promise<{
      ok: boolean;
      out: string;
      err?: string;
    }> => {
      if (!testAlso) return { ok: true, out: "" };
      const testFiles = Object.keys(working).filter(
        (p) => /(^|\/)tests?\//.test(p) || /\.test\.(js|ts)$/.test(p),
      );
      if (!testFiles.length) return { ok: true, out: "" };
      let out = "";
      for (const tf of testFiles.slice(0, 6)) {
        const res = await runnerService.runProjectAndCapture(
          Object.fromEntries(
            Object.entries(working).map(([k, v]) => [
              k,
              { language: v.language, content: v.content },
            ]),
          ) as any,
          tf,
          2500,
        );
        out += `\n[test] ${tf}\n${res.stdout}${res.stderr}`;
        if (res.error) return { ok: false, out, err: res.error };
      }
      return { ok: true, out };
    };

    try {
      for (let i = 1; i <= maxIters; i++) {
        const fileContext = focusPaths
          .map((p) => `FILE: ${p}\n${working[p]?.content ?? "<missing>"}`)
          .join("\n\n");

        const runContext = last.error
          ? `LAST RUN ERROR:\n${last.error}\n\nPARSED_ERROR:\n${JSON.stringify(last.parsedError)}\n\nSTDOUT:\n${last.stdout}\n\nSTDERR:\n${last.stderr}`
          : `LAST RUN: (no error)\nSTDOUT:\n${last.stdout}\n\nSTDERR:\n${last.stderr}`;

        const memoryHint = `HINTS:\n- If the same error repeats, change strategy.\n- Keep edits minimal.\n- Do not touch files outside focusPaths.`;

        const coderMessages: LlmMessage[] = [
          { role: "system", content: systemPromptFixLoop() },
          {
            role: "user",
            content: `Goal:\n${goal}\n\nfocusPaths:\n${JSON.stringify(focusPaths)}\n\nCurrent focused files:\n${fileContext}\n\n${runContext}\n\n${memoryHint}`,
          },
        ];
        const activeCfg = getActiveProviderConfig(cfg);
        const responseCoder = await llmClient.call(coderMessages, {
          provider: cfg.llmProvider,
          apiKey: activeCfg?.apiKey || "",
          model: activeCfg?.model || "",
        });
        const coder = JSON.parse(responseCoder.content) as AgentResult;
        const coderEdits = coder.edits.filter((e) =>
          focusPaths.includes(e.path),
        );

        // critic: stop if no edits produced while still failing
        if ((!coderEdits || coderEdits.length === 0) && last.error) {
          break;
        }

        const reviewerMessages: LlmMessage[] = [
          { role: "system", content: systemPromptReviewer() },
          {
            role: "user",
            content: `Goal:\n${goal}\n\nfocusPaths:\n${JSON.stringify(focusPaths)}\n\nOriginal files:\n${fileContext}\n\nProposed edits (JSON):\n${JSON.stringify({ notes: coder.notes, edits: coderEdits })}`,
          },
        ];
        const responseReviewer = await llmClient.call(reviewerMessages, {
          provider: cfg.llmProvider,
          apiKey: activeCfg?.apiKey || "",
          model: activeCfg?.model || "",
        });
        const review = JSON.parse(responseReviewer.content) as ReviewResult;
        const reviewedEdits = review.edits.filter((e) =>
          focusPaths.includes(e.path),
        );

        for (const e of reviewedEdits) {
          const prev = working[e.path]?.content ?? "";
          if (e.newContent !== prev) madeChange = true;
          working[e.path] = { language: e.language, content: e.newContent };
        }

        // tester: entry
        const entryCode =
          working[entry]?.content ?? snap.ws.files[entry]?.content ?? "";
        const run = await runnerService.runProjectAndCapture(
          Object.fromEntries(
            Object.entries(working).map(([k, v]) => [
              k,
              { language: v.language, content: v.content },
            ]),
          ) as any,
          entry,
          2500,
        );
        last = {
          stdout: run.stdout,
          stderr: run.stderr,
          error: run.error,
          parsedError: run.error ? parseStack(run.error) : null,
        };

        // optional tests
        if (!last.error) {
          const tRes = await runTests();
          if (!tRes.ok) {
            last = {
              stdout: last.stdout + tRes.out,
              stderr: last.stderr,
              error: tRes.err,
              parsedError: tRes.err ? parseStack(tRes.err) : null,
            };
          } else {
            last = { ...last, stdout: last.stdout + tRes.out };
          }
        }

        const cur = this.get(id);
        const iterations = [...(cur?.iterations ?? [])];
        iterations.push({
          i,
          coderNotes: coder.notes,
          reviewerNotes: review.notes,
          run: {
            stdout: last.stdout,
            stderr: last.stderr,
            error: last.error,
            parsedError: last.parsedError,
          },
        });
        this.update(id, { iterations });

        // critic: repeated same error message
        const msg = String(last.parsedError?.message ?? last.error ?? "");
        if (msg && msg === lastMsg) sameErrCount += 1;
        else sameErrCount = 0;
        lastMsg = msg;
        if (sameErrCount >= 1) {
          // after 2 consecutive identical error messages (count>=1 because we increment after match)
          break;
        }

        if (!last.error) break;
      }

      // propose diffs vs original workspace
      const proposed: ProposedChange[] = [];
      for (const p of focusPaths) {
        const old = snap.ws.files[p]?.content ?? "";
        const cur = working[p]?.content ?? old;
        const lang = (working[p]?.language ??
          snap.ws.files[p]?.language ??
          "text") as any;
        if (cur !== old)
          proposed.push({
            path: p,
            language: lang,
            oldContent: old,
            newContent: cur,
          });
      }

      const outcomeNote = !madeChange
        ? "No changes made."
        : last.error
          ? `Still failing: ${parseStack(last.error).message}`
          : "No runtime error detected.";

      const iters = (this.get(id)?.iterations ?? []) as FixIteration[];
      await this.summarizeAndStore(goal, focusPaths, iters, last.error);

      this.update(id, {
        status: "pending_approval",
        notes: "Auto-fix loop completed. Review final diffs.",
        reviewNotes: outcomeNote,
        proposed,
      });
      eventBus.publish({
        type: "ui:toast",
        payload: {
          kind: "info",
          text: "Auto-fix finished: review diffs and approve.",
        },
      });
      return id;
    } catch (e: any) {
      this.update(id, {
        status: "error",
        error: e?.message ? String(e.message) : String(e),
      });
      eventBus.publish({
        type: "ui:toast",
        payload: {
          kind: "error",
          text: "Auto-fix failed. Check settings/API key.",
        },
      });
      return null;
    }
  }

  applyChanges(taskId: string, paths?: string[]) {
    const t = this.get(taskId);
    if (!t || t.status !== "pending_approval" || !t.proposed) return;
    const allow = paths && paths.length ? new Set(paths) : null;
    for (const ch of t.proposed) {
      if (allow && !allow.has(ch.path)) continue;
      workspaceManager.upsertFile(ch.path, ch.language as any, ch.newContent);
    }
    this.update(taskId, { status: "done" });
    eventBus.publish({
      type: "ui:toast",
      payload: { kind: "info", text: "Changes applied." },
    });
  }

  rejectChanges(taskId: string) {
    const t = this.get(taskId);
    if (!t) return;
    this.update(taskId, { status: "done", proposed: [] });
    eventBus.publish({
      type: "ui:toast",
      payload: { kind: "info", text: "Changes rejected." },
    });
  }
}

export const orchestrator = new Orchestrator();
