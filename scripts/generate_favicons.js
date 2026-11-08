const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// 1. MASTER VECTOR SVG FOR VYAPARFLOW
// ─────────────────────────────────────────────────────────────
const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Terracotta & Amber Gradient -->
    <linearGradient id="vf-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="35%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>

    <!-- Warm Golden Flow Gradient -->
    <linearGradient id="vf-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#FBBF24" />
    </linearGradient>

    <!-- Subtle Bevel Glare -->
    <linearGradient id="vf-glare" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.0" />
    </linearGradient>

    <!-- Ambient Shadow -->
    <filter id="vf-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#7C2D12" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Ambient Glow Behind Squircle -->
  <rect x="36" y="36" width="440" height="440" rx="112" fill="#EA580C" opacity="0.35" filter="blur(20px)" />

  <!-- Base Squircle with Primary Gradient -->
  <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#vf-bg-grad)" />

  <!-- Glare Highlight -->
  <rect x="34" y="34" width="444" height="220" rx="110" fill="url(#vf-glare)" />

  <!-- Inner Stroke Border -->
  <rect x="32" y="32" width="448" height="448" rx="112" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="6" />

  <!-- Central Symbol: Interlocking Dynamic 'V' Cargo Vessel Bow & Flow Chevron -->
  <g filter="url(#vf-shadow)">
    <!-- Primary Outer Hull 'V' — Pure Crisp White -->
    <path
      d="M 120 156 L 256 388 L 392 156 L 322 156 L 256 288 L 190 156 Z"
      fill="#FFFFFF"
    />

    <!-- Secondary Upper Momentum Chevron / Air & Trade Flow Wing — Radiant Gold -->
    <path
      d="M 194 132 L 256 236 L 318 132 L 356 132 L 256 280 L 156 132 Z"
      fill="url(#vf-gold-grad)"
      opacity="0.95"
    />

    <!-- Forward Surge Speed Accent — Streamline Node -->
    <path
      d="M 238 316 L 256 348 L 274 316 Z"
      fill="url(#vf-gold-grad)"
    />

    <!-- Forward Horizon Trade Dot -->
    <circle cx="256" cy="104" r="16" fill="#FFFFFF" />
  </g>
</svg>`;

// ─────────────────────────────────────────────────────────────
// 2. OPEN GRAPH SOCIAL CARD (1200x630)
// ─────────────────────────────────────────────────────────────
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="og-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="og-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <linearGradient id="og-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#FBBF24" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#og-bg)" />

  <!-- Subtle Ambient Orange Glow -->
  <circle cx="950" cy="180" r="300" fill="#EA580C" opacity="0.18" filter="blur(80px)" />
  <circle cx="200" cy="500" r="250" fill="#F97316" opacity="0.12" filter="blur(80px)" />

  <!-- Subtle Grid Lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="200" x2="1200" y2="200" />
    <line x1="0" y1="300" x2="1200" y2="300" />
    <line x1="0" y1="400" x2="1200" y2="400" />
    <line x1="0" y1="500" x2="1200" y2="500" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
  </g>

  <!-- Left: Brand Emblem (160x160) -->
  <g transform="translate(100, 150)">
    <rect width="160" height="160" rx="40" fill="url(#og-brand-grad)" />
    <rect width="160" height="160" rx="40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <!-- White V glyph -->
    <path
      d="M 40 50 L 80 126 L 120 50 L 98 50 L 80 92 L 62 50 Z"
      fill="#FFFFFF"
    />
    <!-- Gold flow chevron -->
    <path
      d="M 62 42 L 80 75 L 98 42 L 110 42 L 80 90 L 50 42 Z"
      fill="url(#og-gold)"
    />
    <circle cx="80" cy="33" r="5" fill="#FFFFFF" />
  </g>

  <!-- Brand Name & Description -->
  <g transform="translate(100, 360)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#FB923C" letter-spacing="3" text-transform="uppercase">
      PAN-INDIA EXPORT OS
    </text>
    <text y="60" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      VyaparFlow
    </text>
    <text y="115" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">
      Export Logistics Readiness Operating System for Indian MSMEs
    </text>
    <text y="155" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#64748B">
      JNPT • Mundra • Hazira • Chennai • Cochin → Global Corridors
    </text>
  </g>

  <!-- Right: Decorative Visual Tiles -->
  <g transform="translate(740, 160)">
    <!-- Tile 1: Readiness Score -->
    <rect width="360" height="130" rx="20" fill="rgba(30, 41, 59, 0.7)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
    <text x="24" y="40" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#94A3B8">EXPORT READINESS SCORE</text>
    <text x="24" y="90" font-family="monospace, monospace" font-size="44" font-weight="900" fill="#F97316">100<tspan font-size="20" font-weight="600" fill="#64748B"> / 100</tspan></text>
    <rect x="230" y="55" width="105" height="32" rx="16" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
    <text x="282" y="76" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#34D399" text-anchor="middle">LEO Cleared ✓</text>

    <!-- Tile 2: Tariff Intelligence -->
    <g transform="translate(0, 150)">
      <rect width="360" height="130" rx="20" fill="rgba(30, 41, 59, 0.7)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      <text x="24" y="40" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#94A3B8">DIRECT FTA DUTY BENEFIT</text>
      <text x="24" y="90" font-family="monospace, monospace" font-size="38" font-weight="900" fill="#FFFFFF">0.0%<tspan font-size="16" font-weight="500" fill="#34D399"> (India-UAE CEPA)</tspan></text>
      <text x="24" y="112" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#34D399">₹1,48,000 saved / 40ft container</text>
    </g>
  </g>
</svg>`;

// ─────────────────────────────────────────────────────────────
// 3. UTILITY: GENERATE VALID MULTI-RESOLUTION WINDOWS .ICO
// ─────────────────────────────────────────────────────────────
function createIcoFromPngs(pngBuffers, sizes) {
  const numImages = pngBuffers.length;
  const headerLength = 6;
  const dirEntryLength = 16;
  const totalDirLength = headerLength + numImages * dirEntryLength;

  let currentOffset = totalDirLength;
  const dirEntries = [];

  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const width = size >= 256 ? 0 : size;
    const height = size >= 256 ? 0 : size;

    const entry = Buffer.alloc(16);
    entry.writeUInt8(width, 0);          // Width
    entry.writeUInt8(height, 1);         // Height
    entry.writeUInt8(0, 2);              // Color count (0 = no palette)
    entry.writeUInt8(0, 3);              // Reserved
    entry.writeUInt16LE(1, 4);           // Color planes
    entry.writeUInt16LE(32, 6);          // Bits per pixel
    entry.writeUInt32LE(buf.length, 8);   // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset to image data

    dirEntries.push(entry);
    currentOffset += buf.length;
  }

  // 6-byte ICO Header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);          // Reserved
  header.writeUInt16LE(1, 2);          // Type 1 = ICO
  header.writeUInt16LE(numImages, 4);  // Number of images

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

// ─────────────────────────────────────────────────────────────
// 4. MAIN BUILD PROCESS
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('--- Generating Brand Assets for VyaparFlow ---');
  const baseDir = path.resolve(__dirname, '..');
  const publicDir = path.join(baseDir, 'public');
  const appDir = path.join(baseDir, 'app');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // 1. Write Vector SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterSvg, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), masterSvg, 'utf8');
  console.log('✓ Created master vector SVGs in public/icon.svg and app/icon.svg');

  // 2. Generate PNGs at required resolutions
  const svgBuffer = Buffer.from(masterSvg);

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  console.log('✓ Generated high-res PNG icons (180x180, 192x192, 512x512)');

  // 3. Generate Multi-Size .ICO Files (16, 32, 48)
  const icoBuffer = createIcoFromPngs([png16, png32, png48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Successfully packed multi-resolution favicon.ico for Chrome tabs!');

  // 4. Generate OpenGraph Image (1200x630)
  const ogBuffer = await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuffer);
  console.log('✓ Generated social OpenGraph image in public/og-image.png');

  // 5. Generate Web App Manifest
  const manifest = {
    name: 'VyaparFlow — Export Logistics Readiness Platform',
    short_name: 'VyaparFlow',
    description: 'Export logistics readiness, compliance, and multi-carrier execution for Indian MSMEs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#EA580C',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Created Web App manifest in public/manifest.json');

  console.log('\n🎉 ALL BRAND & FAVICON ASSETS GENERATED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
