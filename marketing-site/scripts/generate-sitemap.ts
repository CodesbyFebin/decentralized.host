/**
 * Generates public/sitemap.xml from the real page data in src/data/registry.ts,
 * instead of a hand-maintained static file. Run via `tsx` (already a devDependency).
 *
 * This intentionally only lists the site's actual routable pages (CONTENT_REGISTRY).
 * docs.ts/guides.ts entries are sections *within* /docs/ and /guides/, addressed by
 * #anchor, not separate crawlable URLs -- so they don't get their own sitemap rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY } from '../src/data/registry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// changefreq/priority aren't part of PageFrontmatter (they're a sitemap-only
// concern, not something the rest of the site needs) -- keyed by slug here.
const SITEMAP_META: Record<string, { changefreq: string; priority: string }> = {
  '/': { changefreq: 'daily', priority: '1.0' },
  '/features/': { changefreq: 'weekly', priority: '0.9' },
  '/architecture/': { changefreq: 'weekly', priority: '0.9' },
  '/security/': { changefreq: 'weekly', priority: '0.8' },
  '/docs/': { changefreq: 'weekly', priority: '0.9' },
  '/guides/': { changefreq: 'weekly', priority: '0.8' },
  '/alternatives/': { changefreq: 'weekly', priority: '0.8' },
  '/deploy/': { changefreq: 'weekly', priority: '0.8' },
  '/decentralized-hosting/': { changefreq: 'weekly', priority: '0.9' },
  '/self-hosted-paas/': { changefreq: 'weekly', priority: '0.9' },
  '/depin/': { changefreq: 'weekly', priority: '0.8' },
  '/roadmap/': { changefreq: 'weekly', priority: '0.7' },
  '/about/': { changefreq: 'monthly', priority: '0.7' },
  '/open-source/': { changefreq: 'monthly', priority: '0.7' },
  '/faq/': { changefreq: 'monthly', priority: '0.7' }
};

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function generate(): void {
  const urls = Object.values(CONTENT_REGISTRY).map((page) => {
    const meta = SITEMAP_META[page.slug] ?? { changefreq: 'weekly', priority: '0.6' };
    return `  <url>
    <loc>${page.canonical}</loc>
    <lastmod>${toDateOnly(page.updatedAt)}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  fs.writeFileSync(OUT_PATH, xml, 'utf-8');
  console.log(`Generated ${path.relative(process.cwd(), OUT_PATH)} (${urls.length} URLs) from registry.ts`);
}

generate();
