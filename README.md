# 遇兰玉兰 — 品牌网站

「遇兰玉兰」文创品牌官方网站，玉见兰不住的美好，忙里偷闲也发光。
 https://wethand5.github.io/yulan/

## 技术栈

- [Astro](https://astro.build) — 静态站点生成
- [Tailwind CSS](https://tailwindcss.com) — 样式
- [React](https://react.dev) — 交互组件（购物车、筛选、花瓣动画）
- [TypeScript](https://www.typescriptlang.org) — 类型安全
- [Sharp](https://sharp.pixelplumbing.com) — 图片处理

## 目录结构

```
yulan_site/
├── public/
│   ├── images/          # 处理后的图片（由脚本生成，不纳入版本控制）
│   └── favicon.svg
├── scripts/
│   ├── prepare-images.mjs  # 图片处理脚本
│   └── generate-data.mjs   # 数据生成脚本
├── src/
│   ├── pages/           # 页面
│   ├── components/      # 组件（Astro + React）
│   ├── data/            # 商品数据（由脚本生成）
│   ├── layouts/         # 布局
│   └── styles/          # 全局样式
├── .github/workflows/   # GitHub Pages 部署
└── package.json
```

## 素材来源

- 品牌素材由「遇兰玉兰」品牌方提供
- 字体：思源宋体 (Source Han Serif) — SIL Open Font License 1.1
- 其他字体请查阅原始授权

## 版权声明

Copyright © 2026 遇兰玉兰. All rights reserved.

本仓库仅用于课程展示、作品集展示、非商业预览用途。

未经授权，严禁：
- 商用品牌名「遇兰玉兰」
- 商用 IP 形象「magie / 玉兰鸡」
- 商用 Logo、图片、文案、页面设计、视觉资产
- 将本仓库内容用于任何商业目的

本仓库不采用 MIT、Apache、GPL 等允许商用的开源许可证。详见 [LICENSE](./LICENSE)。

