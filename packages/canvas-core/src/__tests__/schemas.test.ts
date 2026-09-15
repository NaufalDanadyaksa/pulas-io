import { describe, it, expect } from 'vitest';
import { canvasElementSchema, canvasDataSchema } from '../schemas';
import { createCanvasElement } from '../elements';

describe('Canvas Zod Schemas', () => {
  it('validates a valid rectangle element', () => {
    const rect = createCanvasElement('rectangle', {
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      strokeColor: '#000000',
    });

    const result = canvasElementSchema.safeParse(rect);
    expect(result.success).toBe(true);
  });

  it('validates a valid text element', () => {
    const text = createCanvasElement('text', {
      text: 'Hello pulas.io',
      fontSize: 24,
      fontFamily: 'hand-drawn',
    });

    const result = canvasElementSchema.safeParse(text);
    expect(result.success).toBe(true);
  });

  it('validates a complete canvas data payload', () => {
    const canvasData = {
      version: 1,
      elements: [
        createCanvasElement('rectangle', { x: 0, y: 0 }),
        createCanvasElement('ellipse', { x: 100, y: 100 }),
      ],
      appState: {
        viewBackgroundColor: '#ffffff',
        gridSize: 20,
      },
    };

    const result = canvasDataSchema.safeParse(canvasData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid element structure', () => {
    const invalidElem = {
      id: 'test',
      type: 'unknown_type',
    };

    const result = canvasElementSchema.safeParse(invalidElem);
    expect(result.success).toBe(false);
  });
});
