/**
 * Deterministic pattern generator
 * Creates unique visual patterns based on a seed string
 * Pattern is the same regardless of dimensions (uses normalized 0-1 coordinates)
 */

interface PatternConfig {
  width: number;
  height: number;
  seed: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Fixed virtual canvas size for pattern generation (patterns are defined in this space)
const VIRTUAL_SIZE = 1000;

/**
 * Simple seeded random number generator (Mulberry32)
 * Produces deterministic pseudo-random numbers based on seed
 */
function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  let state = hash >>> 0;

  return function(): number {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a color palette from seed
 */
function generatePalette(random: () => number): RGB[] {
  const baseHue = random() * 360;
  const palette: RGB[] = [];

  // Generate 5 harmonious colors
  for (let i = 0; i < 5; i++) {
    const hue = (baseHue + (i * 72)) % 360; // Pentadic colors
    const saturation = 0.5 + random() * 0.4;
    const lightness = 0.3 + random() * 0.4;

    palette.push(hslToRgb(hue / 360, saturation, lightness));
  }

  return palette;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function blendColors(c1: RGB, c2: RGB, t: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t)
  };
}

interface Shape {
  type: 'rect' | 'circle';
  x: number;      // normalized 0-1
  y: number;      // normalized 0-1
  w?: number;     // normalized 0-1 (for rect)
  h?: number;     // normalized 0-1 (for rect)
  r?: number;     // normalized 0-1 (for circle)
  color: RGB;
}

interface PatternData {
  type: number;
  palette: RGB[];
  shapes: Shape[];
  stripeWidth: number;    // normalized
  diagonal: boolean;
  vertical: boolean;
  numColors: number;
  tileSize: number;       // normalized
  tileColors: RGB[][];
  gradientAngle: number;
  gradientColor1: RGB;
  gradientColor2: RGB;
}

/**
 * Pre-generate all pattern data based on seed (dimension-independent)
 */
function generatePatternData(seed: string): PatternData {
  const random = createSeededRandom(seed);
  const palette = generatePalette(random);
  const patternType = Math.floor(random() * 5);

  // Generate shapes for geometric/circle patterns
  const shapes: Shape[] = [];
  const numShapes = 10 + Math.floor(random() * 20);

  for (let i = 0; i < numShapes; i++) {
    const isCircle = patternType === 2;
    shapes.push({
      type: isCircle ? 'circle' : 'rect',
      x: random(),
      y: random(),
      w: 0.05 + random() * 0.3,
      h: 0.05 + random() * 0.3,
      r: 0.02 + random() * 0.15,
      color: palette[1 + Math.floor(random() * (palette.length - 1))]
    });
  }

  // Stripe pattern params
  const stripeWidth = 0.02 + random() * 0.08;
  const diagonal = random() > 0.5;
  const vertical = random() > 0.5;
  const numColors = 2 + Math.floor(random() * 3);

  // Mosaic pattern params
  const tileSize = 0.05 + random() * 0.1;
  const tilesX = Math.ceil(1 / tileSize) + 1;
  const tilesY = Math.ceil(1 / tileSize) + 1;

  const tileColors: RGB[][] = [];
  for (let ty = 0; ty < tilesY; ty++) {
    tileColors[ty] = [];
    for (let tx = 0; tx < tilesX; tx++) {
      tileColors[ty][tx] = palette[Math.floor(random() * palette.length)];
    }
  }

  // Gradient params
  const gradientAngle = random() * Math.PI * 2;
  const gradientColor1 = palette[Math.floor(random() * palette.length)];
  const gradientColor2 = palette[Math.floor(random() * palette.length)];

  return {
    type: patternType,
    palette,
    shapes,
    stripeWidth,
    diagonal,
    vertical,
    numColors,
    tileSize,
    tileColors,
    gradientAngle,
    gradientColor1,
    gradientColor2
  };
}

/**
 * Get color at normalized coordinates (0-1)
 */
function getColorAt(nx: number, ny: number, data: PatternData): RGB {
  switch (data.type) {
    case 0:
      return getGeometricColorAt(nx, ny, data);
    case 1:
      return getGradientColorAt(nx, ny, data);
    case 2:
      return getCircleColorAt(nx, ny, data);
    case 3:
      return getStripeColorAt(nx, ny, data);
    case 4:
      return getMosaicColorAt(nx, ny, data);
    default:
      return getGeometricColorAt(nx, ny, data);
  }
}

function getGeometricColorAt(nx: number, ny: number, data: PatternData): RGB {
  // Start with background
  let color = data.palette[0];

  // Check each shape (later shapes override earlier ones)
  for (const shape of data.shapes) {
    if (nx >= shape.x && nx <= shape.x + (shape.w || 0) &&
        ny >= shape.y && ny <= shape.y + (shape.h || 0)) {
      color = shape.color;
    }
  }

  return color;
}

function getGradientColorAt(nx: number, ny: number, data: PatternData): RGB {
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const t = Math.cos(data.gradientAngle) * cx + Math.sin(data.gradientAngle) * cy + 0.5;
  const clampedT = Math.max(0, Math.min(1, t));
  return blendColors(data.gradientColor1, data.gradientColor2, clampedT);
}

function getCircleColorAt(nx: number, ny: number, data: PatternData): RGB {
  // Start with background
  let color = data.palette[0];

  // Check each circle (later circles override earlier ones)
  for (const shape of data.shapes) {
    const dx = nx - shape.x;
    const dy = ny - shape.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= (shape.r || 0)) {
      color = shape.color;
    }
  }

  return color;
}

function getStripeColorAt(nx: number, ny: number, data: PatternData): RGB {
  let position: number;
  const totalWidth = data.stripeWidth * data.numColors;

  if (data.diagonal) {
    position = (nx + ny) % totalWidth;
  } else if (data.vertical) {
    position = nx % totalWidth;
  } else {
    position = ny % totalWidth;
  }

  // Handle negative modulo
  if (position < 0) position += totalWidth;

  const colorIndex = Math.floor(position / data.stripeWidth) % data.numColors;
  return data.palette[colorIndex];
}

function getMosaicColorAt(nx: number, ny: number, data: PatternData): RGB {
  const tx = Math.floor(nx / data.tileSize);
  const ty = Math.floor(ny / data.tileSize);

  // Clamp to tile array bounds
  const safeX = Math.max(0, Math.min(tx, data.tileColors[0].length - 1));
  const safeY = Math.max(0, Math.min(ty, data.tileColors.length - 1));

  return data.tileColors[safeY][safeX];
}

/**
 * Generate raw pixel data for a deterministic pattern
 * The pattern maintains 1:1 aspect ratio and crops to fit requested dimensions (cover mode)
 * This ensures the pattern looks the same regardless of output dimensions
 */
export function generatePatternBuffer(config: PatternConfig): Buffer {
  const { width, height, seed } = config;

  // Generate pattern data once (dimension-independent)
  const patternData = generatePatternData(seed);

  // Create raw RGB buffer
  const buffer = Buffer.alloc(width * height * 3);

  // Calculate scaling to maintain 1:1 aspect ratio (cover mode - crop to fit)
  // The pattern is defined in a 1x1 square, we scale it to cover the output
  const maxDim = Math.max(width, height);
  const offsetX = (maxDim - width) / 2;
  const offsetY = (maxDim - height) / 2;

  // Render at requested resolution
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Convert to normalized coordinates (0-1) with 1:1 aspect ratio
      // Center crop: map output pixels to the center of a square pattern
      const nx = (x + offsetX) / maxDim;
      const ny = (y + offsetY) / maxDim;

      // Get color at this normalized position
      const color = getColorAt(nx, ny, patternData);

      // Set pixel
      const idx = (y * width + x) * 3;
      buffer[idx] = color.r;
      buffer[idx + 1] = color.g;
      buffer[idx + 2] = color.b;
    }
  }

  return buffer;
}

export default { generatePatternBuffer };
