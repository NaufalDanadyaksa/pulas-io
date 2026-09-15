import type { CanvasElement } from '@pulas/types';

export interface HistoryEntry {
  elements: CanvasElement[];
  timestamp: number;
}

export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxHistory: number;

  constructor(maxHistory = 100) {
    this.maxHistory = maxHistory;
  }

  /**
   * Pushes a new snapshot of elements to the undo stack and clears redo.
   */
  public push(elements: CanvasElement[]): void {
    // Deep clone snapshot to prevent external mutations
    const snapshot = JSON.parse(JSON.stringify(elements)) as CanvasElement[];
    
    this.undoStack.push({
      elements: snapshot,
      timestamp: Date.now(),
    });

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.redoStack = [];
  }

  /**
   * Reverts to the previous state.
   */
  public undo(currentElements: CanvasElement[]): CanvasElement[] | null {
    if (!this.canUndo) return null;

    const previous = this.undoStack.pop()!;
    // Save current elements to redo stack before applying previous
    const currentSnapshot = JSON.parse(JSON.stringify(currentElements)) as CanvasElement[];
    this.redoStack.push({
      elements: currentSnapshot,
      timestamp: Date.now(),
    });

    return JSON.parse(JSON.stringify(previous.elements)) as CanvasElement[];
  }

  /**
   * Re-applies an undone state.
   */
  public redo(currentElements: CanvasElement[]): CanvasElement[] | null {
    if (!this.canRedo) return null;

    const next = this.redoStack.pop()!;
    // Save current to undo stack before redoing
    const currentSnapshot = JSON.parse(JSON.stringify(currentElements)) as CanvasElement[];
    this.undoStack.push({
      elements: currentSnapshot,
      timestamp: Date.now(),
    });

    return JSON.parse(JSON.stringify(next.elements)) as CanvasElement[];
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public get undoCount(): number {
    return this.undoStack.length;
  }

  public get redoCount(): number {
    return this.redoStack.length;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
