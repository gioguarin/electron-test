const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using sharp
async function generateIcons() {
  const svgContent = fs.readFileSync(path.join(__dirname, 'assets', 'icon.svg'), 'utf-8');
  
  // Icon sizes for different platforms
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  
  for (const size of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'assets', `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
  
  // Create main icon.png (256x256)
  await sharp(Buffer.from(svgContent))
    .resize(256, 256)
    .png()
    .toFile(path.join(__dirname, 'assets', 'icon.png'));
  console.log('Generated main icon.png');
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);