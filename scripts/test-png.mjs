import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, getPixel) {
  // width x height RGBA
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x / width, y / height, x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG chunks: IHDR, IDAT, IEND
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
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure assets directory exists
const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// S-Monogram SDF (Signed Distance Field) / Shape Math:
// S is rotated 45 degrees. Let's compute rotated coordinates (u, v):
// u = (x - cx) * cos(-45) - (y - cy) * sin(-45)
// v = (x - cx) * sin(-45) + (y - cy) * cos(-45)
function sampleLogo(nx, ny) {
  // Center is (0.5, 0.5)
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;

  // 45 degree rotation
  const cos45 = Math.SQRT1_2;
  const sin45 = Math.SQRT1_2;
  const u = dx * cos45 - dy * sin45; // along diagonal
  const v = dx * sin45 + dy * cos45; // across diagonal

  // In rotated frame (u, v):
  // Upper piece (White): spans from top to center-right
  // Lower piece (Yellow): spans from bottom to center-left
  // Ribbon thickness: ~0.09 in scale
  // Outer box size in (u,v): u in [-0.34, 0.34], v in [-0.34, 0.34]

  const thickness = 0.085;
  const outerU = 0.32;
  const outerV = 0.32;
  const innerU = outerU - thickness * 2;
  const innerV = outerV - thickness * 2;
  const gap = 0.038;

  // Upper hook: v > u - gap, outer boundary v <= outerV, u <= outerU
  // Upper top horizontal bar: u in [-0.22, outerU], v in [outerV - thickness * 1.5, outerV]
  // Upper right vertical bar: u in [outerU - thickness * 1.5, outerU], v in [-0.04, outerV]
  // Upper inner diagonal fold / hook

  // Let's use precise polygon point testing for both ribbons!
  return null;
}

console.log('Testing PNG generation...');
