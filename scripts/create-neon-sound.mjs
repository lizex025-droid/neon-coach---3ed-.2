import { writeFile } from 'node:fs/promises';
// Locally synthesized acknowledgement; no remote signed asset or network request.
const rate = 22050, count = Math.floor(rate * 0.12), wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF'); wav.writeUInt32LE(36 + count * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
for (let i = 0; i < count; i++) wav.writeInt16LE(Math.round(Math.sin(i / rate * 2 * Math.PI * 880) * 7000 * Math.sin(Math.PI * i / count)), 44 + i * 2);
await writeFile('public/neon-ack.wav', wav);
