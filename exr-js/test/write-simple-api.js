/**
 * Test the simple writeRgbaFile/writeRgbFile API
 */

import { writeRgbaFile, writeRgbFile, Compression, Encoding, Blocks, Vec2, LineOrder } from '../src/index.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const width = 256;
const height = 256;

console.log(`Testing simple API (writeRgbaFile/writeRgbFile)...`);
console.log(`Resolution: ${width}x${height}\n`);

// Test 1: writeRgbaFile with callback
console.log('Test 1: writeRgbaFile with callback');
try {
  const buffer = await writeRgbaFile(null, width, height, (index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return [x / width, y / height, 0.5, 1.0];
  });

  const filename = 'test-simple-rgba-callback.exr';
  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 2: writeRgbaFile with Float32Array
console.log('\nTest 2: writeRgbaFile with Float32Array');
try {
  const pixels = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    pixels[i * 4] = x / width;      // R
    pixels[i * 4 + 1] = y / height; // G
    pixels[i * 4 + 2] = 0.5;        // B
    pixels[i * 4 + 3] = 1.0;        // A
  }

  const buffer = await writeRgbaFile(null, width, height, pixels);

  const filename = 'test-simple-rgba-array.exr';
  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 3: writeRgbFile
console.log('\nTest 3: writeRgbFile');
try {
  const buffer = await writeRgbFile(null, width, height, (index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return [x / width, y / height, 0.5];
  });

  const filename = 'test-simple-rgb.exr';
  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 4: writeRgbaFile with custom encoding
console.log('\nTest 4: writeRgbaFile with custom encoding (PIZ)');
try {
  const encoding = new Encoding(
    Compression.PIZ,
    Blocks.Tiles(new Vec2(64, 64)),
    LineOrder.Unspecified
  );

  const buffer = await writeRgbaFile(null, width, height, (index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return [x / width, y / height, 0.5, 1.0];
  }, encoding);

  const filename = 'test-simple-rgba-piz.exr';
  writeFileSync(filename, new Uint8Array(buffer));
  console.log(`  Wrote ${filename}: ${buffer.byteLength} bytes`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

// Test 5: writeRgbaFile to file directly
console.log('\nTest 5: writeRgbaFile to file directly');
try {
  const filename = 'test-simple-direct.exr';
  await writeRgbaFile(filename, 128, 128, (index) => [0.5, 0.5, 0.5, 1.0]);
  console.log(`  Wrote ${filename}`);
} catch (error) {
  console.error(`  FAILED: ${error.message}`);
  console.error(error.stack);
}

console.log('\nValidating with exrinfo...\n');
