import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * ChatShift Icon Generator
 * Generates exact vector SVG and PNG icons at 16, 32, 48, 128, and 1024px.
 */

// Define 1000x1000 polygon coordinates for the top white piece
// Center is at (500, 500)
const whitePoly = [
  [330, 230], // Top-left flare inner
  [270, 170], // Top-left sharp outer tip
  [410, 170], // Top outer horizontal flare
  [770, 230], // Outer diagonal down-right
  [830, 290], // Right-most outer apex
  [590, 530], // Diagonal down-left to inner tip
  [540, 480], // Inner tip bottom cut
  [580, 440], // Inner tip notch
  [710, 310], // Inner right diagonal
  [670, 270], // Inner turn
  [440, 270], // Inner top diagonal
  [380, 280], // Inner left approach
  [330, 230]
];

// Better yet, let's use exact geometric parametric polygon:
// We can define the piece using 45-degree ribbon math:
function createPieces() {
  // Top White Piece
  const white = [
    [400, 160], // top tip notch start
    [320, 140], // top tip flare peak
    [430, 140], // top edge start
    [760, 220], // top outer diagonal
    [830, 290], // right outer corner
    [600, 520], // right inner diagonal
    [540, 460], // bottom tip notch
    [590, 410], // inner turn
    [700, 300], // inner right edge
    [430, 250], // inner top edge
    [400, 160]
  ];

  // Refined clean coordinates aligned with reference image
  // In the reference image:
  // Top piece:
  // Top hook: [310, 170] -> [250, 130] -> [400, 130] -> [790, 230] -> [850, 290] -> [620, 520] -> [570, 470] -> [600, 440] -> [730, 310] -> [430, 230] -> [310, 170]
  
  const whiteClean = [
    [330, 180],
    [260, 140],
    [400, 140],
    [780, 230],
    [840, 290],
    [620, 510],
    [560, 450],
    [600, 410],
    [720, 290],
    [430, 220],
    [330, 180]
  ];

  // Rotate 180 degrees around (500, 500) for yellow piece
  const yellowClean = whiteClean.map(([x, y]) => [1000 - x, 1000 - y]);

  return { white: whiteClean, yellow: yellowClean };
}

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function createPng(width, height, getPixel) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const { white, yellow } = createPieces();

// Generate SVG
function toSvgPath(poly) {
  return `M ${poly.map(p => `${p[0]},${p[1]}`).join(' L ')} Z`;
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <!-- ChatShift Logo (White + Yellow Interlocking S) -->
  <path d="${toSvgPath(white)}" fill="#FFFFFF" />
  <path d="${toSvgPath(yellow)}" fill="#FFD23F" />
</svg>`;

const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'logo.svg'), svgContent);
console.log('Saved assets/logo.svg');

// Render PNGs with 4x4 supersampling for crisp edges
const sizes = [16, 32, 48, 128, 1024];

sizes.forEach(size => {
  const pngBuf = createPng(size, size, (px, py, w, h) => {
    let whiteHits = 0;
    let yellowHits = 0;
    const samples = 4;
    const step = 1 / samples;

    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const cx = ((px + (sx + 0.5) * step) / w) * 1000;
        const cy = ((py + (sy + 0.5) * step) / h) * 1000;

        if (pointInPoly(cx, cy, white)) {
          whiteHits++;
        } else if (pointInPoly(cx, cy, yellow)) {
          yellowHits++;
        }
      }
    }

    const totalSamples = samples * samples;
    const totalHits = whiteHits + yellowHits;
    if (totalHits === 0) return [0, 0, 0, 0];

    const alpha = Math.round((totalHits / totalSamples) * 255);
    const whiteRatio = whiteHits / totalHits;

    // White: #FFFFFF (255, 255, 255), Yellow: #FFD23F (255, 210, 63)
    const r = 255;
    const g = Math.round(255 * whiteRatio + 210 * (1 - whiteRatio));
    const b = Math.round(255 * whiteRatio + 63 * (1 - whiteRatio));

    return [r, g, b, alpha];
  });

  const filename = `icon-${size}.png`;
  fs.writeFileSync(path.join(assetsDir, filename), pngBuf);
  console.log(`Saved assets/${filename}`);
});

console.log('All icons successfully generated!');
