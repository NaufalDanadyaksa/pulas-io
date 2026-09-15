import { z } from 'zod';

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const strokeStyleSchema = z.enum(['solid', 'dashed', 'dotted']);
export const fillStyleSchema = z.enum(['none', 'solid', 'hachure', 'zigzag', 'cross-hatch']);
export const textAlignSchema = z.enum(['left', 'center', 'right']);
export const fontFamilySchema = z.enum(['hand-drawn', 'sans-serif', 'monospace']);

export const baseCanvasElementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['rectangle', 'ellipse', 'arrow', 'line', 'text', 'freedraw', 'image']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number().default(0),
  strokeColor: z.string().default('#1e1e1e'),
  backgroundColor: z.string().default('transparent'),
  fillStyle: fillStyleSchema.default('none'),
  strokeWidth: z.number().positive().default(2),
  strokeStyle: strokeStyleSchema.default('solid'),
  roughness: z.number().min(0).max(3).default(1),
  opacity: z.number().min(0).max(100).default(100),
  isLocked: z.boolean().default(false),
  groupIds: z.array(z.string()).default([]),
  seed: z.number().int().default(1),
  version: z.number().int().default(1),
  updatedAt: z.number().default(() => Date.now()),
});

export const rectangleElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('rectangle'),
  roundness: z.number().optional(),
});

export const ellipseElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('ellipse'),
});

export const lineElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('line'),
  points: z.array(pointSchema).min(2),
});

export const arrowElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('arrow'),
  points: z.array(pointSchema).min(2),
});

export const textElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number().positive().default(20),
  fontFamily: fontFamilySchema.default('hand-drawn'),
  textAlign: textAlignSchema.default('left'),
  lineHeight: z.number().positive().default(1.25),
});

export const freeDrawElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('freedraw'),
  points: z.array(pointSchema).min(1),
  pressures: z.array(z.number()).optional(),
});

export const imageElementSchema = baseCanvasElementSchema.extend({
  type: z.literal('image'),
  fileId: z.string(),
  status: z.enum(['pending', 'loaded', 'error']).default('pending'),
  scale: z.tuple([z.number(), z.number()]).default([1, 1]),
});

export const canvasElementSchema = z.discriminatedUnion('type', [
  rectangleElementSchema,
  ellipseElementSchema,
  lineElementSchema,
  arrowElementSchema,
  textElementSchema,
  freeDrawElementSchema,
  imageElementSchema,
]);

export const canvasDataSchema = z.object({
  version: z.number().default(1),
  elements: z.array(canvasElementSchema).default([]),
  appState: z
    .object({
      viewBackgroundColor: z.string().optional(),
      gridSize: z.number().optional(),
    })
    .optional(),
});
