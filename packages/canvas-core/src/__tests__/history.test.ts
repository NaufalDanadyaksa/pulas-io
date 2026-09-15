import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '../history';
import { createCanvasElement } from '../elements';

describe('HistoryManager', () => {
  let history: HistoryManager;

  beforeEach(() => {
    history = new HistoryManager(100);
  });

  it('starts with empty stacks', () => {
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
    expect(history.undoCount).toBe(0);
    expect(history.redoCount).toBe(0);
  });

  it('records state transitions and allows undo/redo', () => {
    const elem1 = createCanvasElement('rectangle', { x: 10, y: 10 });
    const elem2 = createCanvasElement('ellipse', { x: 50, y: 50 });

    // Step 1: Initial state (1 element)
    history.push([elem1]);
    expect(history.canUndo).toBe(true);

    // Step 2: Modified state (2 elements)
    const currentElements = [elem1, elem2];

    // Undo should return previous state
    const previous = history.undo(currentElements);
    expect(previous).not.toBeNull();
    expect(previous?.length).toBe(1);
    expect(previous?.[0]?.id).toBe(elem1.id);
    expect(history.canRedo).toBe(true);

    // Redo should return the modified state
    const next = history.redo(previous!);
    expect(next).not.toBeNull();
    expect(next?.length).toBe(2);
  });

  it('enforces maximum history limit (100)', () => {
    const customHistory = new HistoryManager(5);
    for (let i = 0; i < 10; i++) {
      customHistory.push([createCanvasElement('rectangle', { x: i })]);
    }
    expect(customHistory.undoCount).toBe(5);
  });

  it('clears redo stack when a new push occurs', () => {
    const elem1 = createCanvasElement('rectangle', { x: 0 });
    history.push([elem1]);
    history.undo([elem1, createCanvasElement('ellipse')]);
    expect(history.canRedo).toBe(true);

    // New action should invalidate redo stack
    history.push([elem1, createCanvasElement('text')]);
    expect(history.canRedo).toBe(false);
  });
});
