/**
 * 🖱️ WHISPER CURSOR TRACKER
 * Tracks mouse and cursor position to provide context-aware suggestions
 */

export interface CursorPosition {
  x: number;
  y: number;
  line: number;
  column: number;
  element?: HTMLElement;
  textContent?: string;
  nearbyText?: string[];
}

export interface TextSelectionInfo {
  text: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
}

class WhisperCursorTracker {
  private position: CursorPosition = { x: 0, y: 0, line: 0, column: 0 };
  private selection: TextSelectionInfo | null = null;
  private listeners: Map<string, ((pos: CursorPosition) => void)[]> = new Map();
  private isTracking = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  /**
   * Start tracking cursor movement
   */
  startTracking() {
    if (typeof window === "undefined" || this.isTracking) return;

    this.isTracking = true;

    // Track mouse movement
    document.addEventListener("mousemove", this.handleMouseMove);

    // Track text selection
    document.addEventListener("selectionchange", this.handleSelectionChange);

    // Track keyboard navigation (for text cursor)
    document.addEventListener("keydown", this.handleKeyDown);

    // Track click for position
    document.addEventListener("click", this.handleClick);
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    if (typeof window === "undefined") return;

    this.isTracking = false;

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("selectionchange", this.handleSelectionChange);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.handleClick);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const element = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement;

      this.position = {
        x: e.clientX,
        y: e.clientY,
        line: 0,
        column: 0,
        element,
        textContent: element?.textContent?.slice(0, 200),
        nearbyText: this.getNearbyText(element),
      };

      this.notifyListeners("mousemove");
    }, 50);
  };

  private handleClick = (e: MouseEvent) => {
    const element = e.target as HTMLElement;

    // Check if clicking in a text input or contenteditable
    if (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.isContentEditable
    ) {
      const input = element as HTMLInputElement | HTMLTextAreaElement;
      const cursorPos = input.selectionStart || 0;
      const text = input.value || element.textContent || "";

      // Calculate line and column
      const beforeCursor = text.slice(0, cursorPos);
      const lines = beforeCursor.split("\n");

      this.position = {
        ...this.position,
        x: e.clientX,
        y: e.clientY,
        line: lines.length,
        column: lines[lines.length - 1]?.length || 0,
        element,
        textContent: text.slice(0, 200),
      };

      this.notifyListeners("click");
    }
  };

  private handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      this.selection = null;
      return;
    }

    const text = selection.toString();
    if (!text) {
      this.selection = null;
      return;
    }

    // Get range info
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;

    this.selection = {
      text,
      startLine: 0,
      endLine: 0,
      startColumn: range.startOffset,
      endColumn: range.endOffset,
    };

    this.notifyListeners("selection");
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;

    // Only track in text inputs
    if (
      target.tagName !== "INPUT" &&
      target.tagName !== "TEXTAREA" &&
      !target.isContentEditable
    ) {
      return;
    }

    // Update position on arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      setTimeout(() => {
        const input = target as HTMLInputElement | HTMLTextAreaElement;
        const cursorPos = input.selectionStart || 0;
        const text = input.value || target.textContent || "";

        const beforeCursor = text.slice(0, cursorPos);
        const lines = beforeCursor.split("\n");

        this.position = {
          ...this.position,
          line: lines.length,
          column: lines[lines.length - 1]?.length || 0,
          textContent: text.slice(0, 200),
        };

        this.notifyListeners("keydown");
      }, 10);
    }
  };

  private getNearbyText(element: HTMLElement | null): string[] {
    if (!element) return [];

    const nearby: string[] = [];

    // Get parent text
    if (element.parentElement?.textContent) {
      nearby.push(element.parentElement.textContent.slice(0, 100));
    }

    // Get sibling text
    const siblings = element.parentElement?.children || [];
    for (let i = 0; i < Math.min(siblings.length, 5); i++) {
      const sib = siblings[i];
      if (sib !== element && sib.textContent) {
        nearby.push(sib.textContent.slice(0, 50));
      }
    }

    return nearby;
  }

  private notifyListeners(event: string) {
    const listeners = this.listeners.get(event) || [];
    for (const listener of listeners) {
      listener(this.position);
    }

    // Also notify "all" listeners
    const allListeners = this.listeners.get("all") || [];
    for (const listener of allListeners) {
      listener(this.position);
    }
  }

  /**
   * Subscribe to cursor position changes
   */
  subscribe(
    event: "mousemove" | "click" | "selection" | "keydown" | "all",
    callback: (pos: CursorPosition) => void,
  ) {
    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);

    // Return unsubscribe function
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  /**
   * Get current cursor position
   */
  getPosition(): CursorPosition {
    return this.position;
  }

  /**
   * Get current text selection
   */
  getSelection(): TextSelectionInfo | null {
    return this.selection;
  }

  /**
   * Get context around cursor for suggestions
   */
  getContextForSuggestions(): {
    position: CursorPosition;
    selection: TextSelectionInfo | null;
    contextText: string;
    wordAtCursor: string;
  } {
    const text = this.position.textContent || "";
    const cursorIndex = this.position.column;

    // Find word at cursor
    const beforeCursor = text.slice(0, cursorIndex);
    const afterCursor = text.slice(cursorIndex);

    const wordBefore = beforeCursor.split(/\s/).pop() || "";
    const wordAfter = afterCursor.split(/\s/)[0] || "";
    const wordAtCursor = wordBefore + wordAfter;

    return {
      position: this.position,
      selection: this.selection,
      contextText: text,
      wordAtCursor,
    };
  }

  /**
   * Find elements within a radius of current position
   */
  findNearbyElements(radiusPx: number = 100): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const { x, y } = this.position;

    // Sample points in a grid around cursor
    const step = 20;
    for (let dx = -radiusPx; dx <= radiusPx; dx += step) {
      for (let dy = -radiusPx; dy <= radiusPx; dy += step) {
        const el = document.elementFromPoint(x + dx, y + dy) as HTMLElement;
        if (el && !elements.includes(el)) {
          elements.push(el);
        }
      }
    }

    return elements;
  }

  /**
   * Get text content from nearby elements
   */
  getNearbyTextContent(radiusPx: number = 100): string[] {
    const elements = this.findNearbyElements(radiusPx);
    const texts: string[] = [];

    for (const el of elements) {
      if (el.textContent && el.textContent.length > 2) {
        const text = el.textContent.trim().slice(0, 100);
        if (!texts.includes(text)) {
          texts.push(text);
        }
      }
    }

    return texts;
  }
}

export const cursorTracker = new WhisperCursorTracker();
