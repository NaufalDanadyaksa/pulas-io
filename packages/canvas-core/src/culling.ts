import type { CanvasElement, Viewport } from '@pulas/types';

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Calculates the axis-aligned bounding box for a canvas element.
 */
export function getElementBoundingBox(element: CanvasElement): BoundingBox {
  let minX = element.x;
  let minY = element.y;
  let maxX = element.x + element.width;
  let maxY = element.y + element.height;

  // Handle free draw / line / arrow where width & height might be negative
  if (minX > maxX) {
    [minX, maxX] = [maxX, minX];
  }
  if (minY > maxY) {
    [minY, maxY] = [maxY, minY];
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Checks whether an element is visible within the current viewport and screen dimensions.
 * Includes a margin buffer (padding) to avoid pop-in during panning.
 */
export function isElementInViewport(
  element: CanvasElement,
  viewport: Viewport,
  screen: ScreenDimensions,
  buffer = 50
): boolean {
  // Screen bounds in canvas world coordinates
  const viewMinX = -viewport.scrollX - buffer;
  const viewMinY = -viewport.scrollY - buffer;
  const viewMaxX = -viewport.scrollX + screen.width / viewport.zoom + buffer;
  const viewMaxY = -viewport.scrollY + screen.height / viewport.zoom + buffer;

  const box = getElementBoundingBox(element);

  // Check AABB intersection
  const isOutside =
    box.maxX < viewMinX ||
    box.minX > viewMaxX ||
    box.maxY < viewMinY ||
    box.minY > viewMaxY;

  return !isOutside;
}
