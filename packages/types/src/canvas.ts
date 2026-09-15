export type CanvasElementType =
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'text'
  | 'freedraw'
  | 'image';

export type ToolType = CanvasElementType | 'select' | 'pan' | 'eraser';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FillStyle = 'none' | 'solid' | 'hachure' | 'zigzag' | 'cross-hatch';
export type TextAlign = 'left' | 'center' | 'right';
export type FontFamily = 'hand-drawn' | 'sans-serif' | 'monospace';

export interface Point {
  x: number;
  y: number;
}

export interface BaseCanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;
  isLocked: boolean;
  groupIds: string[];
  seed: number;
  version: number;
  updatedAt: number;
}

export interface RectangleElement extends BaseCanvasElement {
  type: 'rectangle';
  roundness?: number;
}

export interface EllipseElement extends BaseCanvasElement {
  type: 'ellipse';
}

export interface LineElement extends BaseCanvasElement {
  type: 'line';
  points: Point[];
}

export interface ArrowElement extends BaseCanvasElement {
  type: 'arrow';
  points: Point[];
}

export interface TextElement extends BaseCanvasElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  lineHeight: number;
}

export interface FreeDrawElement extends BaseCanvasElement {
  type: 'freedraw';
  points: Point[];
  pressures?: number[];
}

export interface ImageElement extends BaseCanvasElement {
  type: 'image';
  fileId: string;
  status: 'pending' | 'loaded' | 'error';
  scale: [number, number];
}

export type CanvasElement =
  | RectangleElement
  | EllipseElement
  | LineElement
  | ArrowElement
  | TextElement
  | FreeDrawElement
  | ImageElement;

export interface Viewport {
  zoom: number;
  scrollX: number;
  scrollY: number;
}

export interface CanvasAppState {
  activeTool: ToolType;
  selectedElementIds: string[];
  viewport: Viewport;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
}
