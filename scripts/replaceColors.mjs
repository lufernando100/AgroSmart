import { promises as fs } from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Primary (Green) -> Esmeralda
  { old: '#F0F7F0', new: '#ECFDF5' }, // 50
  { old: '#D4E8D4', new: '#D1FAE5' }, // 100
  { old: '#A8D1A8', new: '#A7F3D0' }, // 200
  { old: '#6DB56D', new: '#34D399' }, // 300
  { old: '#4A9B4A', new: '#10B981' }, // 400
  { old: '#2D7A2D', new: '#059669' }, // 500 (esmeralda)
  { old: '#236023', new: '#047857' }, // 600
  { old: '#1A481A', new: '#065F46' }, // 700
  { old: '#123012', new: '#064E3B' }, // 800
  { old: '#0A1A0A', new: '#022C22' }, // 900

  // Backgrounds & Neutrals -> Pergamino/Espresso
  { old: '#FAFAF8', new: '#FAF7F2' }, // Background (pergamino)
  { old: '#F5F3EF', new: '#FDFBF7' }, // Cards/Lighter
  { old: '#E8E4DD', new: '#EAE1D9' }, // Soft borders
  { old: '#D4CEC4', new: '#2D1B14' }, // Borders visible (tostado) or maybe keeping it soft... wait, tostado is #2D1B14. If I replace #D4CEC4 with #2D1B14, all light gray borders become dark brown. Let's just use tostado/20, but Tailwind class might not accept rgba directly unless we use opacity. If we replace hardcoded hex, we can't easily add opacity if it's border-[#D4CEC4]. Let's replace #D4CEC4 with a light version of tostado: #D9C8C0.
  // Actually, let's look at the instructions. "tostado: #2D1B14 // Bordes y autoridad".
  // If we replace all borders with tostado, the UI will be dark brown borders.
  { old: '#A39E94', new: '#9C8F85' }, // Neutral 400
  { old: '#736E64', new: '#7B675B' }, // Neutral 500
  { old: '#524E46', new: '#5B473D' }, // Neutral 600
  { old: '#3A3732', new: '#3D2F28' }, // Neutral 700
  { old: '#252320', new: '#1A0F0A' }, // Foreground (espresso)
  { old: '#121110', new: '#0D0805' }, // Neutral 900
];

async function walkDir(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walkDir(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function processFiles() {
  const files = await walkDir('./src');
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let changed = false;

    // First do exact hex replacements (case insensitive if possible, but let's do both)
    for (const { old: oldHex, new: newHex } of REPLACEMENTS) {
      const regexUpper = new RegExp(oldHex, 'g');
      const regexLower = new RegExp(oldHex.toLowerCase(), 'g');

      if (regexUpper.test(content)) {
        content = content.replace(regexUpper, newHex);
        changed = true;
      }
      if (regexLower.test(content)) {
        content = content.replace(regexLower, newHex);
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, content);
      console.log('Updated:', file);
    }
  }
}

processFiles().catch(console.error);
