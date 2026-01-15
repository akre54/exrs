/**
 * Test writing EXR files with mip maps
 */

import { Image, Layer, SpecificChannels, Encoding, Vec2, Compression, Blocks, LineOrder, LevelMode, RoundingMode } from '../src/index.js';
import { writeFileSync } from 'fs';

const width = 256;
const height = 256;

console.log(`Testing mip map EXR writing...`);
console.log(`Base resolution: ${width}x${height}\n`);

// Generate RGBA pixels with a pattern that shows downscaling clearly
function getPixel(index) {
  const x = index % width;
  const y = Math.floor(index / width);

  // Create a checkerboard pattern with gradients
  const checker = ((Math.floor(x / 16) + Math.floor(y / 16)) % 2) * 0.3;
  const r = x / width + checker;
  const g = y / height + checker;
  const b = 0.5;
  const a = 1.0;

  return [r, g, b, a];
}

// Test 1: Basic mip map with round-down
console.log('Test 1: MipMap with RoundDown');
try {
  const channels = SpecificChannels.rgba(getPixel);
  const encoding = new Encoding(
    Compression.ZIP16,
    Blocks.MipMaps(new Vec2(64, 64), RoundingMode.Down),
    LineOrder.Unspecified
  );
  const image = Image.fromChannels(new Vec2(width, height), channels, encoding);

  const buffer = image.write().toArrayBuffer();
  const filename = 'test-mipmap-down.exr';

  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 2: MipMap with round-up
console.log('\nTest 2: MipMap with RoundUp');
try {
  const channels = SpecificChannels.rgba(getPixel);
  const encoding = new Encoding(
    Compression.ZIP16,
    Blocks.MipMaps(new Vec2(64, 64), RoundingMode.Up),
    LineOrder.Unspecified
  );
  const image = Image.fromChannels(new Vec2(width, height), channels, encoding);

  const buffer = image.write().toArrayBuffer();
  const filename = 'test-mipmap-up.exr';

  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 3: Non-power-of-2 dimensions
console.log('\nTest 3: Non-power-of-2 dimensions (300x200)');
try {
  const w = 300;
  const h = 200;
  function getPixelNpot(index) {
    const x = index % w;
    const y = Math.floor(index / w);
    return [x / w, y / h, 0.5, 1.0];
  }

  const channels = SpecificChannels.rgba(getPixelNpot);
  const encoding = new Encoding(
    Compression.RLE,
    Blocks.MipMaps(new Vec2(32, 32), RoundingMode.Down),
    LineOrder.Unspecified
  );
  const image = Image.fromChannels(new Vec2(w, h), channels, encoding);

  const buffer = image.write().toArrayBuffer();
  const filename = 'test-mipmap-npot.exr';

  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 4: Small image to verify all levels down to 1x1
console.log('\nTest 4: Small image (16x16 -> 1x1)');
try {
  const w = 16;
  const h = 16;
  function getPixelSmall(index) {
    const x = index % w;
    const y = Math.floor(index / w);
    return [x / w, y / h, (x + y) / (w + h), 1.0];
  }

  const channels = SpecificChannels.rgba(getPixelSmall);
  const encoding = new Encoding(
    Compression.Uncompressed,
    Blocks.MipMaps(new Vec2(8, 8), RoundingMode.Down),
    LineOrder.Unspecified
  );
  const image = Image.fromChannels(new Vec2(w, h), channels, encoding);

  const buffer = image.write().toArrayBuffer();
  const filename = 'test-mipmap-small.exr';

  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);

  // Calculate expected mip levels: 16 -> 8 -> 4 -> 2 -> 1 = 5 levels
  console.log(`  Expected levels: 5 (16, 8, 4, 2, 1)`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

console.log('\nValidating with exrinfo...\n');
