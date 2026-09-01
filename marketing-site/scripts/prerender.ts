/**
 * Prerenders every real route in CONTENT_REGISTRY to static HTML using headless
 * Chrome, so crawlers that don't execute JS (many AI/LLM bots) see real content
 * instead of an empty <div id="root">. Runs against a local `vite preview`
 * server, AFTER `vite build` has produced dist/. Writes dist/<route>/index.html
 * for each page; Vercel serves those static files directly (falling back to the
 * existing SPA rewrite for anything not in this list).
 */
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY } from '../src/data/registry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BASE_URL = process.env.PRERENDER_BASE_URL || 'http://localhost:4173';

async function prerender(): Promise<void> {
  const routes = Object.values(CONTENT_REGISTRY).map((page) => page.slug);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let ok = 0;
  let failed = 0;

  for (const route of routes) {
    const page = await browser.newPage();
    try {
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      // Let the App.tsx effect (title/canonical sync) and any client render settle.
      await page.waitForSelector('main', { timeout: 5000 });

      const html = await page.content();
      const outDir = path.join(DIST_DIR, route === '/' ? '' : route);
      const outFile = path.join(outDir, 'index.html');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, html, 'utf-8');

      console.log(`✔ ${route} -> ${path.relative(DIST_DIR, outFile)}`);
      ok++;
    } catch (err) {
      console.error(`✘ ${route} failed:`, (err as Error).message);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\nPrerendered ${ok}/${routes.length} routes${failed ? ` (${failed} failed)` : ''}.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

prerender();
