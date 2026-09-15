import type {
  CanvasElement,
  CanvasElementType,
  RectangleElement,
  EllipseElement,
  LineElement,
  ArrowElement,
  TextElement,
  FreeDrawElement,
  ImageElement,
} from '@pulas/types';
import { generateId } from '@pulas/utils';

export function createBaseElement(
  type: CanvasElementType,
  x = 0,
  y = 0,
  width = 100,
  height = 100
) {
  return {
    id: generateId('elem'),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'none' as const,
    strokeWidth: 2,
    strokeStyle: 'solid' as const,
    roughness: 1,
    opacity: 100,
    isLocked: false,
    groupIds: [],
    seed: Math.floor(Math.random() * 2000000000),
    version: 1,
    updatedAt: Date.now(),
  };
}

export function createCanvasElement(
  type: CanvasElementType,
  overrides: Partial<CanvasElement> = {}
): CanvasElement {
  const base = createBaseElement(type, overrides.x, overrides.y, overrides.width, overrides.height);

  switch (type) {
    case 'rectangle': {
      const rect: RectangleElement = {
        ...base,
        type: 'rectangle',
        roundness: undefined,
        ...overrides,
      } as RectangleElement;
      return rect;
    }
    case 'ellipse': {
      const ellipse: EllipseElement = {
        ...base,
        type: 'ellipse',
        ...overrides,
      } as EllipseElement;
      return ellipse;
    }
    case 'line': {
      const line: LineElement = {
        ...base,
        type: 'line',
        points: [
          { x: 0, y: 0 },
          { x: overrides.width ?? 100, y: overrides.height ?? 0 },
        ],
        ...overrides,
      } as LineElement;
      return line;
    }
    case 'arrow': {
      const arrow: ArrowElement = {
        ...base,
        type: 'arrow',
        points: [
          { x: 0, y: 0 },
          { x: overrides.width ?? 100, y: overrides.height ?? 0 },
        ],
        ...overrides,
      } as ArrowElement;
      return arrow;
    }
    case 'text': {
      const text: TextElement = {
        ...base,
        type: 'text',
        text: 'Text',
        fontSize: 20,
        fontFamily: 'hand-drawn',
        textAlign: 'left',
        lineHeight: 1.25,
        ...overrides,
      } as TextElement;
      return text;
    }
    case 'freedraw': {
      const freedraw: FreeDrawElement = {
        ...base,
        type: 'freedraw',
        points: [{ x: 0, y: 0 }],
        ...overrides,
      } as FreeDrawElement;
      return freedraw;
    }
    case 'image': {
      const image: ImageElement = {
        ...base,
        type: 'image',
        fileId: '',
        status: 'pending',
        scale: [1, 1],
        ...overrides,
      } as ImageElement;
      return image;
    }
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled element type: ${exhaustiveCheck}`);
    }
  }
}
