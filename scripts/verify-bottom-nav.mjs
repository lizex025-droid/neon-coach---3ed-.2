import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const port = 4173;
const server = await createServer({
  mode: 'neon',
  server: { host: '127.0.0.1', port, strictPort: true, watch: null },
});
await server.listen();

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});

try {
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { store } = await import('/src/state/store.js');
    store.setState({
      userProfile: { ...store.getState().userProfile, onboardingCompleted: true },
    });
    location.hash = 'today';
  });
  await page.locator('.app-bottom-nav').waitFor();

  const routes = ['nutrition', 'neon-ai', 'progress', 'profile', 'today'];
  const checks = [];
  for (let cycle = 0; cycle < 8; cycle += 1) {
    for (const route of routes) {
      const tab = page.locator(`[data-nav="${route}"]`);
      await tab.waitFor();
      const box = await tab.boundingBox();
      assert.ok(box, `Missing bounds for ${route}`);
      const hit = await page.evaluate(({ x, y }) => {
        const element = document.elementFromPoint(x, y);
        return {
          tag: element?.tagName || null,
          nav: element?.closest?.('[data-nav]')?.getAttribute('data-nav') || null,
          className: typeof element?.className === 'string' ? element.className : null,
        };
      }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      checks.push({ cycle, route, hit });
      assert.equal(hit.nav, route, `Tap for ${route} is intercepted by ${JSON.stringify(hit)}`);
      await tab.tap();
      await page.waitForFunction(expected => location.hash === `#${expected}`, route);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
  }

  // A failed/aborted page transition must never leave an invisible click blocker.
  await page.evaluate(async () => {
    const { showNeonSplash } = await import('/src/utils/splash.js');
    showNeonSplash('اختبار صمام الأمان', { safetyTimeoutMs: 50 });
  });
  await page.locator('#neon-app-splash').waitFor({ state: 'detached' });

  const nutritionTab = page.locator('[data-nav="nutrition"]');
  await nutritionTab.tap();
  await page.waitForFunction(() => location.hash === '#nutrition');

  // The workout reader owns a separate copy of the bottom bar.
  await page.goto(`http://127.0.0.1:${port}/40-days-workout.html?book=fortyDay`, {
    waitUntil: 'domcontentloaded',
  });
  await page.locator('.app-bottom-nav').waitFor();
  await page.locator('#neon-app-splash').waitFor({ state: 'detached', timeout: 10000 });

  const workoutProgressTab = page.locator('[data-nav="progress"]');
  const workoutTabBox = await workoutProgressTab.boundingBox();
  assert.ok(workoutTabBox, 'Missing workout progress tab bounds');
  const workoutHit = await page.evaluate(({ x, y }) => (
    document.elementFromPoint(x, y)?.closest?.('[data-nav]')?.getAttribute('data-nav') || null
  ), {
    x: workoutTabBox.x + workoutTabBox.width / 2,
    y: workoutTabBox.y + workoutTabBox.height / 2,
  });
  assert.equal(workoutHit, 'progress', 'Workout bottom tab is intercepted');
  await workoutProgressTab.tap();
  await page.waitForFunction(() => location.pathname.endsWith('/index.html') && location.hash === '#progress');

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    pass: true,
    taps: checks.length + 1,
    routes,
    splashSafetyVerified: true,
    workoutNavigationVerified: true,
    errors,
  }));
} catch (error) {
  await page.screenshot({ path: 'scratch/bottom-nav-failure.png', fullPage: true });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
