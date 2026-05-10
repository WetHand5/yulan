#!/usr/bin/env node

import { resolve, join, basename, extname } from 'node:path';
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE_BASE = resolve(ROOT, '..', '遇兰玉兰网站图片');
const OUTPUT_BASE = resolve(ROOT, 'public', 'images');

const SIZES = {
  hero: { width: 1600, quality: 80 },
  display: { width: 1200, quality: 78 },
  product: { width: 900, quality: 78 },
  thumb: { width: 480, quality: 75 },
};

const SELECTION = {
  logo: { dir: '', pattern: '品牌logo.png', outDir: 'logo', prefix: 'logo', maxSize: 1, size: 'display', keepPng: true },
  ip: { dir: '品牌IP', outDir: 'ip', prefix: 'magie', maxSize: 16, size: 'display' },
  scarf: { dir: '产品图/丝巾', outDir: 'products/scarf', prefix: 'scarf', maxSize: 6, size: 'product' },
  'embroidery-patch': { dir: '产品图/刺绣贴', outDir: 'products/embroidery-patch', prefix: 'embroidery-patch', maxSize: 3, size: 'product' },
  'bag-charm': { dir: '产品图/包挂', outDir: 'products/bag-charm', prefix: 'bag-charm', maxSize: 4, size: 'product' },
  journal: { dir: '产品图/手账', outDir: 'products/journal', prefix: 'journal', maxSize: 12, size: 'product', hasParts: true },
  slippers: { dir: '产品图/拖鞋', outDir: 'products/slippers', prefix: 'slippers', maxSize: 2, size: 'product' },
  plush: { dir: '产品图/毛绒玩具', outDir: 'products/plush', prefix: 'plush', maxSize: 5, size: 'product' },
  cushion: { dir: '产品图/沙发抱枕', outDir: 'products/cushion', prefix: 'cushion', maxSize: 1, size: 'product' },
  'metal-pin': { dir: '产品图/金属pin', outDir: 'products/metal-pin', prefix: 'metal-pin', maxSize: 10, size: 'product' },
  fragrance: { dir: '产品图/香氛', outDir: 'products/fragrance', prefix: 'fragrance', maxSize: 1, size: 'product' },
  'event-scene': { dir: '活动图片/场景效果图', outDir: 'events', prefix: 'event-scene', maxSize: 7, size: 'display' },
  'event-material': { dir: '活动图片/活动物料', outDir: 'events', prefix: 'event-material', maxSize: 8, size: 'display' },
  placeholder: { dir: '素材图（占位用）', outDir: 'placeholders', prefix: 'placeholder', maxSize: 6, size: 'display' },
};

const manifest = [];

// Map Chinese source filenames to descriptive English output names
const SOURCE_NAME_MAP = {
  // Event materials - specific names first
  '活动图片-打卡地图': 'checkin-map',
  '活动图片-海报': 'poster',
  '活动图片-门票': 'ticket',
  '活动图片-喷绘': 'spray-paint',
  '活动图片-手环1': 'wristband-1',
  '活动图片-手环2': 'wristband-2',
  '手环效果图': 'wristband-render',
  '打卡地图': 'checkin-map',
  '海报': 'poster',
  '门票': 'ticket',
  '喷绘': 'spray-paint',
  // Product keywords
  '效果图-丝巾': 'scarf-render',
  '效果图': 'render',
  '丝巾': 'scarf',
  '刺绣贴': 'embroidery-patch',
  '包挂': 'bag-charm',
  '手账内页': 'journal-page',
  '拖鞋': 'slippers',
  '毛绒玩具': 'plush',
  '沙发抱枕': 'cushion',
  '金属pin': 'metal-pin',
  '香氛': 'fragrance',
  '场景效果图': 'scene',
};

function deriveOutputName(srcBasename, category, config, index) {
  const name = srcBasename;

  // Try matching known Chinese keywords from longest to shortest
  const sortedKeys = Object.keys(SOURCE_NAME_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (name.includes(key)) {
      const base = SOURCE_NAME_MAP[key];
      // If the source has a number like (1), (2), append it
      const numMatch = name.match(/\((\d+)\)/);
      const num = numMatch ? `-${numMatch[1]}` : '';
      // For part-based names like 手账内页-part1
      const partMatch = name.match(/part(\d+)/i);
      const part = partMatch ? `-p${partMatch[1]}` : '';
      return `${base}${part}${num}`;
    }
  }

  // Fallback: prefix + sequential number
  // For single-item categories (like logo, fragrance, cushion), omit the number
  if (config.maxSize === 1) {
    return config.prefix;
  }
  return `${config.prefix}-${String(index + 1).padStart(2, '0')}`;
}

// Track used output names per directory to avoid collisions
const usedNames = {};

function listImageFiles(dirPath) {
  if (!existsSync(dirPath)) return [];
  const entries = readdir(dirPath, { withFileTypes: true });
  return entries.then(files =>
    files
      .filter(f => f.isFile() && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .map(f => join(dirPath, f.name))
  );
}

async function listImageFilesRecursive(dirPath) {
  if (!existsSync(dirPath)) return [];
  const results = [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...await listImageFilesRecursive(fullPath));
    } else if (/\.(jpe?g|png|webp|gif)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function processImage(srcPath, outPath, sizeKey, keepPng = false) {
  const cfg = SIZES[sizeKey];
  const ext = keepPng ? extname(srcPath) : '.webp';
  const finalOutPath = extname(outPath) !== ext ? outPath.replace(/\.\w+$/, ext) : outPath;

  await mkdir(resolve(finalOutPath, '..'), { recursive: true });

  try {
    const pipeline = sharp(srcPath);
    const metadata = await pipeline.metadata();

    if (keepPng && metadata.format !== 'png') {
      // convert to png if needed
      await pipeline.resize(cfg.width, null, { withoutEnlargement: true }).png().toFile(finalOutPath);
    } else if (keepPng) {
      await pipeline.resize(cfg.width, null, { withoutEnlargement: true }).png().toFile(finalOutPath);
    } else {
      await pipeline.resize(cfg.width, null, { withoutEnlargement: true }).webp({ quality: cfg.quality }).toFile(finalOutPath);
    }

    const outMeta = await sharp(finalOutPath).metadata();
    return { output: finalOutPath, width: outMeta.width, height: outMeta.height, format: outMeta.format };
  } catch (err) {
    console.warn(`  WARNING: Failed to process ${srcPath}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== 遇兰玉兰 图片处理脚本 ===\n');

  if (!existsSync(SOURCE_BASE)) {
    console.error(`ERROR: 素材目录不存在: ${SOURCE_BASE}`);
    console.error('请确保 遇兰玉兰网站图片 目录位于项目根目录的上一级');
    process.exit(1);
  }

  for (const [category, config] of Object.entries(SELECTION)) {
    console.log(`\n处理分类: ${category}`);

    let files = [];

    if (config.pattern) {
      // Direct file reference (logo)
      const srcPath = resolve(SOURCE_BASE, config.pattern);
      if (existsSync(srcPath)) files = [srcPath];
    } else if (config.hasParts) {
      // Recurse into subdirectories (手账)
      const srcDir = resolve(SOURCE_BASE, config.dir);
      files = await listImageFilesRecursive(srcDir);
    } else {
      const srcDir = resolve(SOURCE_BASE, config.dir);
      files = await listImageFiles(srcDir);
    }

    // Sort for deterministic selection, but prioritize key files
    const priorityNames = {
      'event-material': ['打卡地图', '海报', '门票', '喷绘'],
    };
    const priorities = priorityNames[category] || [];
    files.sort((a, b) => {
      const aName = basename(a);
      const bName = basename(b);
      const aPri = priorities.findIndex(k => aName.includes(k));
      const bPri = priorities.findIndex(k => bName.includes(k));
      // Priority items come first (lower index = higher priority)
      // Non-priority items: aPri and bPri both -1, fall through to name sort
      if (aPri !== bPri) return aPri === -1 ? 1 : bPri === -1 ? -1 : aPri - bPri;
      return aName.localeCompare(bName, 'zh-CN');
    });

    // Limit count
    const selected = files.slice(0, config.maxSize);
    console.log(`  找到 ${files.length} 张, 选取 ${selected.length} 张`);

    for (let i = 0; i < selected.length; i++) {
      const srcPath = selected[i];
      const outDir = resolve(OUTPUT_BASE, config.outDir);
      let derivedName = deriveOutputName(basename(srcPath), category, config, i);

      // Deduplicate: if this name was already used in this output dir, append a suffix
      const dirKey = config.outDir;
      if (!usedNames[dirKey]) usedNames[dirKey] = new Set();
      if (usedNames[dirKey].has(derivedName)) {
        let suffix = 2;
        while (usedNames[dirKey].has(`${derivedName}-${suffix}`)) suffix++;
        derivedName = `${derivedName}-${suffix}`;
      }
      usedNames[dirKey].add(derivedName);

      const outName = `${derivedName}${config.keepPng ? extname(srcPath) : '.webp'}`;
      const outPath = join(outDir, outName);

      const result = await processImage(srcPath, outPath, config.size, config.keepPng);
      if (result) {
        const relOutput = result.output.replace(resolve(ROOT) + '/', '');
        const relSource = srcPath.replace(SOURCE_BASE + '/', '');
        manifest.push({
          source: relSource,
          output: relOutput,
          width: result.width,
          height: result.height,
          format: result.format,
          category,
        });
        console.log(`  ✓ ${relOutput} (${result.width}x${result.height})`);
      }
    }
  }

  // Write manifest
  const manifestPath = resolve(OUTPUT_BASE, 'manifest.json');
  await mkdir(resolve(manifestPath, '..'), { recursive: true });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n=== 完成! 共处理 ${manifest.length} 张图片 ===`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
