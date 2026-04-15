import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// Utility to recursively find files
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else {
      if (filePath.endsWith('.astro')) {
        files.push(filePath);
      }
    }
  }
  return files;
}

const files = getFiles(SRC_DIR);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Refactor Backgrounds
  // bg-emerald-900 or bg-gray-900 -> bg-verde-oscuro text-white
  content = content.replace(/\b(bg-emerald-(?:700|800|900|950)|bg-gray-(?:800|900|950))\b/g, 'bg-verde-oscuro text-gris-claro');
  
  // bg-emerald-500 or 600 -> bg-verde
  content = content.replace(/\b(bg-emerald-(?:400|500|600))\b/g, 'bg-verde');
  
  // bg-emerald-50, bg-gray-50 -> bg-gris-claro
  content = content.replace(/\b(bg-emerald-(?:50|100)|bg-gray-(?:50|100)|bg-white)\b/g, 'bg-gris-claro');

  // 2. Refactor Text Colors
  // Emerald darks and grays -> text-verde-oscuro (assuming light background if it's applying text color)
  content = content.replace(/\b(text-emerald-(?:700|800|900)|text-gray-(?:600|700|800|900))\b/g, 'text-verde-oscuro');
  
  // Emerald primary -> text-verde
  content = content.replace(/\b(text-emerald-(?:400|500|600))\b/g, 'text-verde');
  
  // Emerald generic lights -> text-verde or white depending. We just kill text-emerald-50 and use text-gris-claro
  content = content.replace(/\b(text-emerald-(?:50|100|200))\b/g, 'text-gris-claro');
  content = content.replace(/\b(text-white)\b/g, 'text-gris-claro');

  // 3. Other decorations (borders, shadows, rings)
  content = content.replace(/\b(?:border|ring)-(?:emerald|gray)-(?:[0-9]{2,3})\b/g, 'border-verde-oscuro/20');
  content = content.replace(/\b(?:shadow)-(?:emerald|gray)-(?:[0-9]{2,3})\b/g, 'shadow-verde-oscuro/10');
  
  // gradients from-to (Tailwind doesn't interpolate custom static unless defined, but we can map them)
  content = content.replace(/\bfrom-(?:emerald|gray)-(?:[0-9]{2,3})\b/g, 'from-verde-oscuro');
  content = content.replace(/\bto-(?:emerald|gray)-(?:[0-9]{2,3})\b/g, 'to-verde');

  // 4. Buttons (Replacing large class strings for specific buttons)
  // Finding standard links that look like buttons
  const btnRegex = /class="([^"]*hover:-translate-y-1[^"]*|[^"]*px-10 py-4[^"]*|[^"]*shadow-xl hover:shadow-2xl[^"]*)"/g;
  content = content.replace(btnRegex, (match, classes) => {
    // Make sure we only replace if it seems like a real CTA button
    if (classes.includes('px-') || classes.includes('py-') || classes.includes('rounded-full')) {
       return 'class="btn-primary"';
    }
    return match;
  });

  // 5. Cleanup redundancy if any
  content = content.replace(/text-gris-claro text-verde-oscuro/g, 'text-verde-oscuro'); // priority
  content = content.replace(/text-verde-oscuro text-gris-claro/g, 'text-gris-claro');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Refactored UX on: ${file}`);
}
console.log('Done!');
