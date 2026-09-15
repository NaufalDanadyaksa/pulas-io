import { describe, it, expect } from 'vitest';
import { isElementInViewport, getElementBoundingBox } from '../culling';
import { createCanvasElement } from '../elements';

describe('Viewport Culling', () => {
  const viewport = { zoom: 1, scrollX: 0, scrollY: 0 };
  const screen = { width: 1920, height: 1080 };

  it('calculates bounding box correctly', () => {
    const elem = createCanvasElement('rectangle', { x: 50, y: 100, width: 200, height: 150 });
    const box = getElementBoundingBox(elem);
    expect(box).toEqual({
      minX: 50,
      minY: 100,
      maxX: 250,
      maxY: 250,
    });
  });

  it('detects element inside viewport', () => {
    const insideElem = createCanvasElement('rectangle', { x: 200, y: 200, width: 100, height: 100 });
    expect(isElementInViewport(insideElem, viewport, screen)).toBe(true);
  });

  it('detects element outside viewport', () => {
    const farElem = createCanvasElement('rectangle', { x: 5000, y: 5000, width: 100, height: 100 });
    expect(isElementInViewport(farElem, viewport, screen)).toBe(false);
  });

  it('detects element inside viewport after scrolling', () => {
    const scrolledViewport = { zoom: 1, scrollX: -4900, scrollY: -4900 };
    const farElem = createCanvasElement('rectangle', { x: 5000, y: 5000, width: 100, height: 100 });
    expect(isElementInViewport(farElem, scrolledViewport, screen)).toBe(true);
  });
});
