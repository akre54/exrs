# exr-js

A JavaScript library for writing OpenEXR image files. Port of the [exrs](https://github.com/johannesvollmer/exrs) Rust library.

Write multi-layer EXR images with AOVs (render passes) from web-based 3D renderers, Node.js applications, or any JavaScript environment.

## Features

- **Full compression support**: Uncompressed, RLE, ZIP, PIZ, PXR24, B44, B44A
- **Flexible storage**: Scanlines or tiles with configurable sizes
- **Mip maps & rip maps**: Automatic level generation with box filtering
- **Multi-layer images**: Multiple render passes in a single file
- **Sample types**: F16 (half), F32 (float), U32 (unsigned int)
- **Universal runtime**: Works in Node.js and browsers

## Installation

```bash
npm install exr-js
```

For browser usage with ZIP/PXR24 compression, include [pako](https://github.com/nodeca/pako):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
<script type="module" src="your-app.js"></script>
```

## Quick Start

### Simple API

```javascript
import { writeRgbaFile } from 'exr-js';

// Write RGBA image with callback
await writeRgbaFile('output.exr', 1920, 1080, (index) => {
  const x = index % 1920;
  const y = Math.floor(index / 1920);
  return [x / 1920, y / 1080, 0.5, 1.0]; // [R, G, B, A]
});

// Or with Float32Array (interleaved RGBARGBA...)
const pixels = new Float32Array(1920 * 1080 * 4);
// ... fill pixels ...
await writeRgbaFile('output.exr', 1920, 1080, pixels);
```

### Builder API (Render Passes)

```javascript
import { EXRWriter, Compression, SampleType } from 'exr-js';

const writer = new EXRWriter(1920, 1080);

// Beauty pass (RGBA with PIZ compression)
writer.addLayer('beauty')
  .rgba(beautyPixels)
  .compression(Compression.PIZ)
  .tiled(64, 64)
  .end();

// Normal pass (RGB)
writer.addLayer('normal')
  .rgb(normalPixels)
  .compression(Compression.ZIP16)
  .end();

// Depth pass (single F32 channel)
writer.addLayer('depth')
  .channel('Z', SampleType.F32, depthData)
  .compression(Compression.PXR24)
  .end();

// Object ID pass (single U32 channel)
writer.addLayer('objectId')
  .channel('ID', SampleType.U32, idData)
  .end();

// Write to file (Node.js) or trigger download (browser)
await writer.write('render_passes.exr');

// Or get ArrayBuffer
const buffer = await writer.write();
```

### Direct API (Full Control)

```javascript
import {
  Image, Layer, AnyChannels, AnyChannel, FlatSamples,
  Vec2, Encoding, Compression, Blocks, LineOrder, LayerAttributes
} from 'exr-js';

// Create channel data
const channels = new AnyChannels([
  new AnyChannel('B', FlatSamples.f32(blueData)),
  new AnyChannel('G', FlatSamples.f32(greenData)),
  new AnyChannel('R', FlatSamples.f32(redData)),
]);

// Create layer with custom encoding
const encoding = new Encoding(
  Compression.PIZ,
  Blocks.Tiles(new Vec2(256, 256)),
  LineOrder.Unspecified
);

const layer = Layer.create(
  new Vec2(1920, 1080),
  channels,
  encoding,
  LayerAttributes.named('main')
);

// Write to ArrayBuffer
const buffer = Image.fromLayer(layer).write().toArrayBuffer();
```

## Compression Methods

| Method | Type | Best For |
|--------|------|----------|
| `Uncompressed` | Lossless | Maximum speed |
| `RLE` | Lossless | Simple images, fast encoding |
| `ZIP1` | Lossless | Single scanline, good compression |
| `ZIP16` | Lossless | 16 scanlines, best compression |
| `PIZ` | Lossless | Noisy/grainy images |
| `PXR24` | Lossy (F32) | HDR images where slight precision loss is acceptable |
| `B44` | Lossy (F16) | Fixed-rate, real-time playback |
| `B44A` | Lossy (F16) | Like B44 but better for flat areas |

## Mip Maps

```javascript
import { Blocks, RoundingMode } from 'exr-js';

// Create encoding with mip maps
const encoding = new Encoding(
  Compression.ZIP16,
  Blocks.MipMaps(new Vec2(64, 64), RoundingMode.Down),
  LineOrder.Unspecified
);

// Mip levels are automatically generated using box filtering
```

## Browser Usage

In browsers, `writeToFile()` triggers a download. For in-memory operations:

```javascript
// Get ArrayBuffer without triggering download
const buffer = await writer.write(); // pass null or no argument

// Create Blob for custom handling
const blob = new Blob([buffer], { type: 'image/x-exr' });
const url = URL.createObjectURL(blob);
```

## API Reference

### Simple Functions

- `writeRgbaFile(path, width, height, pixels, encoding?)` - Write RGBA image
- `writeRgbFile(path, width, height, pixels, encoding?)` - Write RGB image

### EXRWriter

- `new EXRWriter(width, height)` - Create writer
- `.addLayer(name)` - Add a layer, returns `LayerBuilder`
- `.write(filename?)` - Write to file or return ArrayBuffer

### LayerBuilder

- `.rgba(data)` / `.rgb(data)` - Set pixel data (callback or Float32Array)
- `.channel(name, sampleType, data)` - Add custom channel
- `.compression(method)` - Set compression (from `Compression` enum)
- `.tiled(width?, height?)` - Use tiled storage
- `.scanlines()` - Use scanline storage
- `.sampleType(type)` - Set sample type for RGB/RGBA
- `.end()` - Finish layer, return to writer

### Types

- `Vec2` - 2D vector for dimensions
- `SampleType` - `F16`, `F32`, `U32`
- `Compression` - `Uncompressed`, `RLE`, `ZIP1`, `ZIP16`, `PIZ`, `PXR24`, `B44`, `B44A`
- `Blocks` - `ScanLines`, `Tiles(size)`, `MipMaps(size, rounding)`, `RipMaps(size, rounding)`
- `LineOrder` - `Increasing`, `Decreasing`, `Unspecified`
- `RoundingMode` - `Down`, `Up`

## Requirements

- **Node.js**: 18+ (uses ES modules)
- **Browser**: Modern browsers with ES module support
- **For ZIP/PXR24 in browser**: Include pako library

## Acknowledgments

This is a JavaScript port of the excellent [exrs](https://github.com/johannesvollmer/exrs) Rust library by Johannes Vollmer. The compression algorithms and file format handling are derived from that implementation.

## License

MIT (same as exrs)
