import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images');

const logos = [
  'logo-light-theme.png',
  'logo-dark-theme.png'
];

async function convertLogos() {
  console.log('Converting logo PNGs to WebP...\n');

  for (const logo of logos) {
    const inputPath = path.join(imagesDir, logo);
    const outputPath = path.join(imagesDir, logo.replace('.png', '.webp'));

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;

      await sharp(inputPath)
        .webp({ quality: 90, method: 6 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const reduction = Math.round((1 - newSize / originalSize) * 100);

      console.log(`✓ ${logo}`);
      console.log(`  ${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB (${reduction}% reduction)`);
      console.log(`  Saved to: ${logo.replace('.png', '.webp')}\n`);
    } catch (error) {
      console.error(`✗ Error converting ${logo}:`, error.message);
    }
  }

  console.log('Logo conversion complete!');
}

convertLogos();
