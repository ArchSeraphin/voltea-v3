#!/usr/bin/env node
// Download official provider logos from Wikimedia Commons and normalize them
// to ~200px-tall PNGs under img/providers/. Run once locally:
//   node scripts/fetch-provider-logos.mjs
//
// Hot-linking Wikimedia thumbnails fails with HTTP 400 in production (we hit
// their "Use thumbnail steps" wall), so logos must be self-hosted.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'img', 'providers');

const UA =
  'VolteaSiteBuild/1.0 (https://voltea-energie.fr; contact@voltea-energie.fr)';

// slug → exact File: title on Wikimedia Commons (verified via API search)
const LOGOS = [
  { slug: 'edf',             file: 'Électricité de France logo.svg' },
  { slug: 'engie',           file: 'Logo-engie.svg' },
  { slug: 'totalenergies',   file: 'Logo TotalEnergies (2021).png' },
  { slug: 'vattenfall',      file: 'Logo-vattenfall.svg' },
  { slug: 'eni',             file: 'Eni wordmark.svg' },
  { slug: 'alpiq',           file: 'Logo Alpiq.svg' },
  { slug: 'ekwateur',        file: 'LOGO EKWATEUR.jpg' },
  { slug: 'primeo-energie',  file: 'Logo Primeo Energie.svg' },
];

// Target height in the UI rarely exceeds 64px; 200px gives 2-3x DPR headroom.
const TARGET_HEIGHT = 200;

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error(`empty body for ${url}`);
  return buf;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const { slug, file } of LOGOS) {
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
    try {
      const buf = await fetchBuffer(url);
      // sharp handles SVG, PNG, JPG transparently. We render onto a
      // transparent canvas at TARGET_HEIGHT and let width auto-scale.
      const out = path.join(OUT_DIR, `${slug}.png`);
      // Source images (especially Ekwateur, Primeo) ship with large white
      // margins that make the logo render visually tiny inside the UI's
      // fixed 48px box. trim() strips uniform borders so every logo fills
      // the available space consistently. threshold=10 ignores near-white
      // anti-aliasing fringes.
      await sharp(buf, { density: 300 })
        .trim({ threshold: 10 })
        .resize({ height: TARGET_HEIGHT, fit: 'inside', withoutEnlargement: false })
        .png({ compressionLevel: 9 })
        .toFile(out);
      const meta = await sharp(out).metadata();
      const kb = ((await fs.stat(out)).size / 1024).toFixed(1);
      console.log(`✓ ${slug.padEnd(16)} ${meta.width}×${meta.height}  ${kb} kB`);
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
