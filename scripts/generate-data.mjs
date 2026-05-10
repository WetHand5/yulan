#!/usr/bin/env node

import { resolve, join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const MANIFEST_PATH = resolve(ROOT, 'public', 'images', 'manifest.json');
const DATA_DIR = resolve(ROOT, 'src', 'data');

const PRODUCTS = [
  {
    id: 'scarf',
    name: '玉兰丝巾',
    category: '精致饰品',
    price: 129,
    tagline: '春日轻绕，玉兰留香',
    description: '以玉兰花瓣为灵感，轻盈丝质触感如春风拂面。无论是通勤搭配还是周末出游，一抹玉兰白让日常也发光。',
    tags: ['丝巾', '春日', '通勤', '送礼'],
  },
  {
    id: 'embroidery-patch',
    name: 'magie刺绣贴',
    category: '日常通勤',
    price: 39,
    tagline: '贴上magie，贴上好心情',
    description: '可爱的magie形象刺绣贴，缝在帆布包、帽子或外套上，让每一天都多一个微笑的理由。',
    tags: ['刺绣贴', 'DIY', '通勤', '小物'],
  },
  {
    id: 'bag-charm',
    name: 'magie包挂',
    category: '日常通勤',
    price: 69,
    tagline: '包包上的小确幸',
    description: '萌萌的magie化身包挂，挂在包上陪你通勤、逛街、旅行。小小一只，大大快乐。',
    tags: ['包挂', '通勤', '装饰', '小物'],
  },
  {
    id: 'journal',
    name: '春日手账',
    category: '日常通勤',
    price: 59,
    tagline: '记录每一个春天的瞬间',
    description: '春日主题手账，内页设计充满玉兰与magie元素。记录灵感、规划日常，让生活有仪式感。',
    tags: ['手账', '文具', '春日', '记录'],
  },
  {
    id: 'slippers',
    name: '玉兰拖鞋',
    category: '家居装饰',
    price: 99,
    tagline: '踩着春天回家',
    description: '柔软舒适的家拖，踩上去就像踩在春天的草地上。玉兰元素设计，让居家也充满仪式感。',
    tags: ['拖鞋', '家居', '舒适', '春日'],
  },
  {
    id: 'plush',
    name: 'magie毛绒玩具',
    category: '限定礼盒',
    price: 189,
    tagline: '抱住magie，抱住快乐',
    description: '超软糯的magie毛绒玩偶，胖嘟嘟的身材抱起来特别治愈。不开心的时候抱一抱，开心的时候更要抱。',
    tags: ['毛绒', '玩偶', '限定', '送礼'],
  },
  {
    id: 'cushion',
    name: '玉兰沙发抱枕',
    category: '家居装饰',
    price: 89,
    tagline: '沙发上的春天',
    description: '玉兰印花抱枕，柔软亲肤面料。放在沙发上，整个客厅都多了几分春意。',
    tags: ['抱枕', '家居', '装饰', '春日'],
  },
  {
    id: 'metal-pin',
    name: 'magie金属pin',
    category: '精致饰品',
    price: 49,
    tagline: '别上magie，别上好运气',
    description: '精致金属质感magie胸针，别在衣领、包包或帽子上，是低调又可爱的小心机。精美包装，也适合送礼。',
    tags: ['金属pin', '胸针', '饰品', '送礼'],
  },
  {
    id: 'fragrance',
    name: '玉兰香氛',
    category: '家居装饰',
    price: 129,
    tagline: '闻到春天，住进春天',
    description: '清新玉兰花香，让整个房间都弥漫春天气息。柔和而不甜腻，适合日常使用。',
    tags: ['香氛', '家居', '春日', '送礼'],
  },
];

function getImagesForCategory(manifest, category) {
  return manifest
    .filter(m => m.category === category)
    .map(m => '/' + m.output);
}

function getCover(images) {
  return images[0] || '/images/placeholders/placeholder-01.webp';
}

async function main() {
  console.log('=== 遇兰玉兰 数据生成脚本 ===\n');

  if (!existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: manifest.json 不存在: ${MANIFEST_PATH}`);
    console.error('请先运行 npm run prepare:images');
    process.exit(1);
  }

  const manifestRaw = await readFile(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(manifestRaw);
  console.log(`读取 manifest: ${manifest.length} 条记录\n`);

  await mkdir(DATA_DIR, { recursive: true });

  // Generate products.json
  const products = PRODUCTS.map(p => {
    const images = getImagesForCategory(manifest, p.id);
    return {
      ...p,
      cover: getCover(images),
      gallery: images,
    };
  });

  const productsPath = resolve(DATA_DIR, 'products.json');
  await writeFile(productsPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`✓ products.json (${products.length} 个商品)`);

  // Generate ip-gallery.json
  const ipImages = getImagesForCategory(manifest, 'ip');
  const ipGallery = {
    title: 'magie 图库',
    description: '玉兰精灵magie的百变日常',
    images: ipImages.map((src, i) => ({
      src,
      alt: `magie 第${i + 1}张`,
      caption: '',
    })),
  };

  const ipPath = resolve(DATA_DIR, 'ip-gallery.json');
  await writeFile(ipPath, JSON.stringify(ipGallery, null, 2), 'utf-8');
  console.log(`✓ ip-gallery.json (${ipGallery.images.length} 张)`);

  // Generate event-gallery.json
  const sceneImages = getImagesForCategory(manifest, 'event-scene');
  const materialImages = getImagesForCategory(manifest, 'event-material');
  const eventGallery = {
    title: '玉兰打卡季',
    scenes: sceneImages.map((src, i) => ({
      src,
      alt: `场景效果图 ${i + 1}`,
    })),
    materials: materialImages.map((src, i) => ({
      src,
      alt: `活动物料 ${i + 1}`,
    })),
    checkinMap: (() => {
      // Find the checkin map by source filename
      const mapEntry = manifest.find(m => m.category === 'event-material' && m.source.includes('打卡地图'));
      return mapEntry ? '/' + mapEntry.output : null;
    })(),
  };

  const eventPath = resolve(DATA_DIR, 'event-gallery.json');
  await writeFile(eventPath, JSON.stringify(eventGallery, null, 2), 'utf-8');
  console.log(`✓ event-gallery.json (${sceneImages.length} 场景, ${materialImages.length} 物料)`);

  console.log('\n=== 数据生成完成 ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
