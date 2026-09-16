/** Petite bibliothèque de dessin pixel (RGBA, origine en haut à gauche). */

export const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

export const mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
  255,
];

export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  set(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    if (color[3] === 255) {
      this.data.set(color, i);
      return;
    }
    const a = color[3] / 255; // alpha blending
    for (let c = 0; c < 3; c++) this.data[i + c] = Math.round(this.data[i + c] * (1 - a) + color[c] * a);
    this.data[i + 3] = Math.max(this.data[i + 3], color[3]);
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return [0, 0, 0, 0];
    const i = (y * this.width + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  clearRect(x, y, w, h) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const px = Math.round(x + i);
        const py = Math.round(y + j);
        if (px < 0 || py < 0 || px >= this.width || py >= this.height) continue;
        this.data.fill(0, (py * this.width + px) * 4, (py * this.width + px) * 4 + 4);
      }
    }
  }

  rect(x, y, w, h, color) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color);
  }

  /** Ellipse pleine, ombrée : la lumière vient du haut à gauche. */
  ellipse(cx, cy, rx, ry, dark, light, { shade = true } = {}) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny > 1) continue;
        const t = shade ? Math.min(1, Math.max(0, 0.62 - 0.45 * nx - 0.62 * ny)) : 1;
        this.set(x, y, mix(dark, light, t));
      }
    }
  }

  /** Triangle plein (corne, aile, oreille…). */
  triangle(p0, p1, p2, color) {
    const minX = Math.floor(Math.min(p0[0], p1[0], p2[0]));
    const maxX = Math.ceil(Math.max(p0[0], p1[0], p2[0]));
    const minY = Math.floor(Math.min(p0[1], p1[1], p2[1]));
    const maxY = Math.ceil(Math.max(p0[1], p1[1], p2[1]));
    const sign = (a, b, c) => (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = [x + 0.5, y + 0.5];
        const d1 = sign(p, p0, p1);
        const d2 = sign(p, p1, p2);
        const d3 = sign(p, p2, p0);
        const neg = d1 < 0 || d2 < 0 || d3 < 0;
        const pos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(neg && pos)) this.set(x, y, color);
      }
    }
  }

  line(x0, y0, x1, y1, color, thickness = 1) {
    const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2) + 1;
    for (let s = 0; s <= steps; s++) {
      const x = x0 + ((x1 - x0) * s) / steps;
      const y = y0 + ((y1 - y0) * s) / steps;
      const r = (thickness - 1) / 2;
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) this.set(x + i, y + j, color);
    }
  }

  /** Contour noir autour de tout ce qui a été dessiné (aspect pixel-art). */
  outline(color) {
    const copy = new Uint8Array(this.data);
    const alphaAt = (x, y) => (x < 0 || y < 0 || x >= this.width || y >= this.height ? 0 : copy[(y * this.width + x) * 4 + 3]);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (alphaAt(x, y) !== 0) continue;
        if (alphaAt(x - 1, y) || alphaAt(x + 1, y) || alphaAt(x, y - 1) || alphaAt(x, y + 1)) this.set(x, y, color);
      }
    }
  }

  /** Agrandissement entier au plus proche voisin : garde les pixels nets. */
  scale(factor) {
    const out = new Canvas(this.width * factor, this.height * factor);
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        out.set(x, y, this.get(Math.floor(x / factor), Math.floor(y / factor)));
      }
    }
    return out;
  }

  /** Copie ce canvas dans un autre, avec un décalage. */
  blitInto(target, ox, oy) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = this.get(x, y);
        if (c[3] !== 0) target.set(ox + x, oy + y, c);
      }
    }
  }
}
