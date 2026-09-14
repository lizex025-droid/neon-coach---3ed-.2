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
  const welcome = page.locator('.welcome-screen-container');
  await welcome.waitFor();
  const welcomeAudit = await welcome.evaluate(element => {
    const title = [...element.querySelectorAll('h1')].find(node => node.textContent.trim() === 'NEON COACH');
    const logo = element.querySelector('img[alt="NEON COACH"]');
    const titleBox = title?.getBoundingClientRect();
    const logoBox = logo?.getBoundingClientRect();
    const stockEmoji = /[\u{1F000}-\u{1FAFF}]|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Presentation}/u;
    return {
      hasRemovedCopy: /كوتشك الرياضي|أهلاً بك في رحلتك|حسابات سعرات|جدول تمارين مهندس|مساعد صوتي ذكي/.test(element.innerText),
      hasStockEmoji: stockEmoji.test(element.innerText),
      titleOffset: titleBox ? Math.abs((titleBox.left + titleBox.width / 2) - innerWidth / 2) : null,
      logoOffset: logoBox ? Math.abs((logoBox.left + logoBox.width / 2) - innerWidth / 2) : null,
    };
  });
  assert.equal(welcomeAudit.hasRemovedCopy, false, 'Removed welcome copy is still visible');
  assert.equal(welcomeAudit.hasStockEmoji, false, 'Stock emoji is still visible on the welcome screen');
  assert.ok(welcomeAudit.titleOffset !== null && welcomeAudit.titleOffset <= 1, 'NEON COACH title is not centered');
  assert.ok(welcomeAudit.logoOffset !== null && welcomeAudit.logoOffset <= 1, 'NEON COACH logo is not centered');

  await page.locator('#q-welcome-start-btn').click();
  await page.getByRole('heading', { name: 'قياسات الجسم' }).waitFor();
  assert.equal(
    await page.locator('img[src*="neon-cat-scale"]').count(),
    0,
    'Measurement mascot is still visible',
  );

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
      const visibleEmoji = await page.evaluate(() => {
        const stockEmoji = /[\u{1F000}-\u{1FAFF}]|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Presentation}/u;
        return stockEmoji.test(document.body.innerText);
      });
      assert.equal(visibleEmoji, false, `Stock emoji is visible on ${route}`);
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
    welcomeScreenVerified: true,
    stockEmojiVerified: true,
    measurementMascotRemoved: true,
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
