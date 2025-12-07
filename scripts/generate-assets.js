const fs = require('fs');
const path = require('path');

// Simple PNG generator (1x1 pixel expanded)
function createSimplePNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace
  
  // Calculate CRC for IHDR
  const crc32 = require('zlib').crc32 || (() => 0);
  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeInt32BE(ihdrCrc, 21);
  
  // IDAT chunk (image data)
  const zlib = require('zlib');
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  idat.writeInt32BE(idatCrc, compressed.length + 8);
  
  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder images (indigo color #6366F1 = 99, 102, 241)
const icons = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash.png', size: 1284 },
  { name: 'favicon.png', size: 48 },
  { name: 'notification-icon.png', size: 96 },
];

icons.forEach(({ name, size }) => {
  const png = createSimplePNG(size, size, 99, 102, 241);
  fs.writeFileSync(path.join(assetsDir, name), png);
  console.log(`Created ${name} (${size}x${size})`);
});

console.log('\\nAssets created successfully!');
console.log('Note: Replace these placeholder images with your actual app icons.');



