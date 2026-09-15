import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';
import type { CanvasElement } from '@pulas/types';

/**
 * Converts a CanvasElement properties into Rough.js options.
 */
export function getRoughOptions(element: CanvasElement): Options {
  const options: Options = {
    seed: element.seed,
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    roughness: element.roughness,
  };

  if (element.fillStyle !== 'none' && element.backgroundColor !== 'transparent') {
    options.fill = element.backgroundColor;
    options.fillStyle = element.fillStyle;
  }

  if (element.strokeStyle === 'dashed') {
    options.strokeLineDash = [8, 8];
  } else if (element.strokeStyle === 'dotted') {
    options.strokeLineDash = [3, 4];
  }

  return options;
}

/**
 * Generates Rough.js drawable shapes for a given CanvasElement.
 */
export function generateRoughShape(
  generator: ReturnType<typeof rough.generator>,
  element: CanvasElement
) {
  const options = getRoughOptions(element);

  switch (element.type) {
    case 'rectangle':
      return generator.rectangle(
        element.x,
        element.y,
        element.width,
        element.height,
        options
      );

    case 'ellipse': {
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      return generator.ellipse(
        cx,
        cy,
        Math.abs(element.width),
        Math.abs(element.height),
        options
      );
    }

    case 'line': {
      const p1 = element.points[0] ?? { x: 0, y: 0 };
      const p2 = element.points[element.points.length - 1] ?? { x: element.width, y: element.height };
      return generator.line(
        element.x + p1.x,
        element.y + p1.y,
        element.x + p2.x,
        element.y + p2.y,
        options
      );
    }

    case 'arrow': {
      // Return line for stem, arrowhead will be drawn at endpoint
      const p1 = element.points[0] ?? { x: 0, y: 0 };
      const p2 = element.points[element.points.length - 1] ?? { x: element.width, y: element.height };
      return generator.line(
        element.x + p1.x,
        element.y + p1.y,
        element.x + p2.x,
        element.y + p2.y,
        options
      );
    }

    case 'freedraw': {
      if (element.points.length < 2) return null;
      const pts = element.points.map((p) => [element.x + p.x, element.y + p.y] as [number, number]);
      return generator.linearPath(pts, options);
    }

    case 'text':
    case 'image':
      // Text and images are rendered with native Canvas 2D APIs rather than Rough.js geometry
      return null;

    default:
      return null;
  }
}
