/**
 * Prerenders every real route in CONTENT_REGISTRY to static HTML using headless
 * Chrome, so crawlers that don't execute JS (many AI/LLM bots) see real content
 * instead of an empty <div id="root">. Runs against a local `vite preview`
 * server, AFTER `vite build` has produced dist/. Writes dist/<route>/index.html
 * for each page; Vercel serves those static files directly (falling back to the
 * existing SPA rewrite for anything not in this list).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY } from '../src/data/registry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BASE_URL = process.env.PRERENDER_BASE_URL || 'http://localhost:4173';

// Hard time budget for the whole run. A production build once took 20+ minutes
// per page here before we found the real cause (MatrixRain's rAF loop starving
// the CPU in headless Chrome); this is a second safety net in case some other
// slowdown shows up later. Routes not reached in time just fall back to the
// existing SPA rewrite in vercel.json -- a safe degraded state, not a failure.
//
// Bumped from 6 to 10 minutes after a real production build (2026-09-02)
// showed @sparticuz/chromium running 60-130s/route on Vercel's build machine
// even with the rAF fix applied (--single-process + forced software
// rendering in its launch args are inherently slower than local dev's
// regular puppeteer, confirmed via that build's real logs) -- 6 minutes only
// fit 4/15 routes. Still comfortably inside Vercel's build time limits.
const DEADLINE_MS = 10 * 60 * 1000;

/**
 * Vercel's build container is missing the shared libs (libnspr4.so etc.) that
 * regular puppeteer's bundled Chromium needs -- confirmed by an actual failed
 * production build. @sparticuz/chromium ships a self-contained Linux build made
 * for exactly this (Lambda/Vercel-style) environment, so we use it there and
 * fall back to regular puppeteer's own Chromium for local dev (macOS/Windows).
 */
async function launchBrowser() {
  if (process.env.VERCEL) {
    const puppeteerCore = (await import('puppeteer-core')).default;
    const chromium = (await import('@sparticuz/chromium')).default;
    // Real production build data (dpl_3M3jVuEFKFp9S81TGWz6J2RLL2mR) showed
    // page rendering itself is fast (~900ms, matching local) once each route
    // gets its own fresh browser, but the browser *launch* itself then took
    // 110-150s each time. --single-process forces Chromium's browser and
    // renderer into one OS process -- a known, still-open problem in
    // @sparticuz/chromium itself (see Sparticuz/chromium PR #509, "remove
    // --single-process from the default args", opened by a maintainer).
    // Stripping just this one flag to isolate its effect; keeping every
    // other sparticuz-tuned flag (software rendering etc.) that's actually
    // needed for this sandboxed environment.
    const args = chromium.args.filter((a) => a !== '--single-process');
    return puppeteerCore.launch({
      headless: true,
      args,
      executablePath: await chromium.executablePath()
    });
  }
  const puppeteer = (await import('puppeteer')).default;
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

async function prerender(): Promise<void> {
  const routes = Object.values(CONTENT_REGISTRY).map((page) => page.slug);
  const startedAt = Date.now();

  // A single reused page across all routes was tried and made things worse
  // in an actual Vercel build (most routes hit a hard 20s networkidle0
  // timeout instead of just being slow) -- reverted to a fresh page per
  // route.
  //
  // A fresh page per route (one shared browser) was itself then found to
  // have a real, measured problem, from an actual Vercel build's per-route
  // timings: the *first* page in a freshly-launched browser rendered in
  // 982ms, and every subsequent page.newPage() in that same browser
  // instance then took 145-175s -- flat, regardless of which route or how
  // much content it had. That's not content-driven slowness; it's
  // @sparticuz/chromium's forced --single-process mode degrading badly
  // for the second and later pages opened in one browser instance. A
  // fresh *browser* per route (not just a fresh page) is the untested fix
  // for that -- more per-route launch overhead, but if the hypothesis is
  // right every route should behave like that first 982ms one did.
  let browser = await launchBrowser();

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const route of routes) {
    if (Date.now() - startedAt > DEADLINE_MS) {
      console.warn(`⏭ ${route} skipped -- time budget exceeded`);
      skipped++;
      continue;
    }

    const routeStartedAt = Date.now();
    const page = await browser.newPage();
    try {
      // Set before navigation so it's present the instant the page's own
      // scripts run -- see MatrixRain.tsx for why this, not navigator.webdriver
      // alone, is what actually disables the expensive animation loop here.
      await page.evaluateOnNewDocument(() => {
        (window as unknown as { __DHOST_PRERENDER__?: boolean }).__DHOST_PRERENDER__ = true;
      });
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
      // Let the App.tsx effect (title/canonical sync) and any client render settle.
      await page.waitForSelector('main', { timeout: 10000 });

      const html = await page.content();
      const outDir = path.join(DIST_DIR, route === '/' ? '' : route);
      const outFile = path.join(outDir, 'index.html');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, html, 'utf-8');

      console.log(`✔ ${route} -> ${path.relative(DIST_DIR, outFile)} (${Date.now() - routeStartedAt}ms)`);
      ok++;
    } catch (err) {
      console.error(`✘ ${route} failed after ${Date.now() - routeStartedAt}ms:`, (err as Error).message);
      failed++;
    } finally {
      await page.close();
      // Relaunch rather than reuse -- see the note above launchBrowser() call
      // above the loop. Yes, this pays a fresh browser-launch cost every
      // route; that's the trade being tested against the 145-175s/route
      // degradation a shared browser instance showed in production.
      await browser.close();
      browser = await launchBrowser();
    }
  }

  await browser.close();
  console.log(`\nPrerendered ${ok}/${routes.length} routes (${failed} failed, ${skipped} skipped) in ${Math.round((Date.now() - startedAt) / 1000)}s.`);

  // Only a hard failure (0 routes ever succeeded) fails the step -- a partial
  // result still leaves every route servable via the CSR fallback.
  if (ok === 0 && routes.length > 0) {
    process.exitCode = 1;
  }
}

prerender();
