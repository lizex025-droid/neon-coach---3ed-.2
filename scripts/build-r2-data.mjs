import fs from 'node:fs';

const lines = fs.readFileSync('docs/r2-images-links.md', 'utf8').split('\n');
let currentGroup = '';
let currentName = '';
const items = [];

for (const line of lines) {
  const trim = line.trim();
  if (trim.startsWith('## ')) {
    currentGroup = trim.replace(/^##\s+/, '').trim();
  } else if (/^\d+\.\s+\*\*(.+?)\*\*/.test(trim)) {
    const match = trim.match(/^\d+\.\s+\*\*(.+?)\*\*/);
    currentName = match[1].trim();
  } else if (/^https?:\/\//.test(trim)) {
    items.push({
      group: currentGroup,
      name: currentName,
      url: trim
    });
  }
}

const js = `/**
 * NEON COACH - Cloudflare R2 Exercise Assets Library
 * 87 Production High-Res Exercise Images
 */

export const R2_EXERCISE_IMAGES = ${JSON.stringify(items, null, 2)};

export function getExerciseImageUrl(exerciseName) {
  if (!exerciseName) return null;
  const clean = String(exerciseName).toLowerCase().trim();
  const match = R2_EXERCISE_IMAGES.find(e => 
    e.name.toLowerCase() === clean || 
    clean.includes(e.name.toLowerCase()) || 
    e.name.toLowerCase().includes(clean)
  );
  return match ? match.url : null;
}

export function getExerciseImagesByGroup(groupName) {
  if (!groupName) return [];
  const clean = String(groupName).trim();
  return R2_EXERCISE_IMAGES.filter(e => e.group === clean);
}
`;

fs.writeFileSync('src/data/r2ExerciseImages.js', js, 'utf8');
console.log('Successfully generated src/data/r2ExerciseImages.js with ' + items.length + ' exercises!');
