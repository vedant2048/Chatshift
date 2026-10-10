// scripts/generate-icons.mjs
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Clean SVG Vector Logo of ChatShift
 * Interlocking S monogram:
 * - Upper White segment (#FFFFFF)
 * - Lower Yellow segment (#FFD23F)
 */
export function getChatShiftSvg(size = 512, withBg = false) {
  const bg = withBg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#161616"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  ${bg}
  <g id="chatshift-icon">
    <!-- Top White Segment -->
    <path d="M 390 120 L 420 150 L 290 280 L 255 245 L 340 160 L 230 160 L 195 125 L 230 90 L 360 90 Z" fill="#FFFFFF" />
    <path d="M 195 125 L 340 270 L 305 305 L 160 160 Z" fill="#FFFFFF" />
  </g>
</svg>`;
}

// Let's refine the exact coordinates for the interlocking S shape
const refinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <!-- Top Segment (White) -->
  <path d="M 280 85 L 405 210 L 345 270 L 305 230 L 335 200 L 265 130 L 205 190 L 165 150 L 225 90 L 280 85 Z" fill="#FFFFFF"/>
  <path d="M 405 210 L 440 245 L 380 305 L 345 270 Z" fill="#FFFFFF"/>
  <!-- Bottom Segment (Yellow) -->
  <path d="M 232 427 L 107 302 L 167 242 L 207 282 L 177 312 L 247 382 L 307 322 L 347 362 L 287 422 L 232 427 Z" fill="#FFD23F"/>
  <path d="M 107 302 L 72 267 L 132 207 L 167 242 Z" fill="#FFD23F"/>
</svg>`;

console.log('Generating assets...');
