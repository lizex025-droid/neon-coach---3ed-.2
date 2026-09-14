import fs from 'node:fs';
import path from 'node:path';

// بادئة المجلد في حاوية R2
const prefix = "GYM.2/";

// الرابط العام لحاوية Cloudflare R2
const rawBaseUrl = process.env.R2_PUBLIC_URL || "https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev";
const baseUrl = rawBaseUrl.replace(/\/+$/, '');

// قائمة احتياطية كاملة لملفات GYM.2 في حال عدم وجود المجلد محلياً
const FALLBACK_FILES = [
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_36 PM (1).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_36 PM (2).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_37 PM (3).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_37 PM (4).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_38 PM (5).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_39 PM (6).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_40 PM (7).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_40 PM (8).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_40 PM (9).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_41 PM (10).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_47 PM (1).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_47 PM (2).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_48 PM (3).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_48 PM (4).png",
  "ارجل/ChatGPT Image Sep 14, 2026, 11_55_49 PM (5).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (1).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (2).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (3).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (4).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (5).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (6).png",
  "بايسيبس/ChatGPT Image Sep 15, 2026, 01_53_54 AM (7).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_37 AM (1).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_38 AM (2).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_38 AM (3).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_39 AM (4).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_39 AM (5).png",
  "بطن/ChatGPT Image Sep 15, 2026, 12_12_41 AM (6).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_34 AM (1).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_35 AM (2).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_35 AM (3).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_36 AM (4).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_36 AM (5).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_37 AM (6).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_37 AM (7).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_37 AM (8).png",
  "ترايسيبس/ChatGPT Image Sep 15, 2026, 12_03_47 AM.png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_09 AM (1).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_10 AM (2).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_10 AM (3).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_11 AM (4).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_11 AM (5).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_11 AM (6).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_13 AM (7).png",
  "سواعد/ChatGPT Image Sep 15, 2026, 12_10_13 AM (8).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_30 PM (1).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_31 PM (2).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_31 PM (3).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_31 PM (4).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_32 PM (5).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_32 PM (6).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_33 PM (7).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_33 PM (8).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_33 PM (9).png",
  "صدر/ChatGPT Image Sep 14, 2026, 11_07_34 PM (10).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_10 PM (1).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (10).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (2).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (3).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (4).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (5).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (6).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (7).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (8).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_11 PM (9).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (1).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (2).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (3).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (4).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (5).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (6).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (7).png",
  "ظهر/ChatGPT Image Sep 14, 2026, 11_53_35 PM (8).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_32 PM (1).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_32 PM (2).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_32 PM (3).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_32 PM (4).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_32 PM (5).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_33 PM (10).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_33 PM (6).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_33 PM (7).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_33 PM (8).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_33 PM (9).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_43 PM (1).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_43 PM (2).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_44 PM (3).png",
  "كتف/ChatGPT Image Sep 14, 2026, 11_54_44 PM (4).png"
];

function scanDirectory(dir, rel = '') {
  let results = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = rel ? `${rel}/${item}` : item;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(scanDirectory(fullPath, relPath));
      } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(item)) {
        results.push(relPath.replace(/\\/g, '/'));
      }
    }
  } catch {
    // ignore
  }
  return results;
}

function resolveFiles() {
  const possiblePaths = [
    path.resolve(process.env.USERPROFILE || '', 'Downloads', 'GYM.2'),
    path.resolve('./GYM.2'),
    path.resolve('../GYM.2')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const found = scanDirectory(p);
      if (found.length > 0) {
        return found.sort();
      }
    }
  }

  return FALLBACK_FILES;
}

function buildUrl(file) {
  const cleanPrefix = prefix.replace(/^\/+/, '');
  const encodedParts = file.split('/').map(part => encodeURIComponent(part)).join('/');
  return `${baseUrl}/${cleanPrefix}${encodedParts}`;
}

const files = resolveFiles();
const links = files.map(buildUrl);

const args = process.argv.slice(2);
if (args.includes('--json')) {
  console.log(JSON.stringify(links, null, 2));
} else if (args.includes('--map')) {
  const map = {};
  for (const file of files) {
    const [group, name] = file.split('/');
    if (!map[group]) map[group] = [];
    map[group].push({ name, url: buildUrl(file) });
  }
  console.log(JSON.stringify(map, null, 2));
} else {
  // الافتراضي: طباعة كل رابط في سطر منفصل للنسخ المباشر عبر الحافظة
  console.log(links.join('\n'));
}
