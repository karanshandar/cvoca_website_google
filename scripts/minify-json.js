import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'public', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

let totalOriginal = 0;
let totalMinified = 0;

console.log('Minifying JSON data files...\n');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const original = content.length;

  try {
    // Parse and re-stringify without whitespace
    const data = JSON.parse(content);
    const minified = JSON.stringify(data);

    fs.writeFileSync(filePath, minified, 'utf8');

    totalOriginal += original;
    totalMinified += minified.length;

    const reduction = Math.round((1 - minified.length / original) * 100);
    console.log(`✓ ${file}: ${original} → ${minified.length} bytes (${reduction}% reduction)`);
  } catch (error) {
    console.error(`✗ Error minifying ${file}:`, error.message);
  }
});

const totalReduction = Math.round((1 - totalMinified / totalOriginal) * 100);
console.log(`\nTotal: ${totalOriginal} → ${totalMinified} bytes (${totalReduction}% reduction)`);
console.log(`Saved ${totalOriginal - totalMinified} bytes across ${files.length} files`);
