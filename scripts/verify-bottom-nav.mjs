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

  // Projection calculations remain active, but their summary cards must stay out of the UI.
  await page.locator('#q-next-step-btn').click();
  await page.locator('.goal-card[data-goal="fat_loss"]').waitFor();
  await page.locator('#q-next-step-btn').click();
  await page.locator('.weekly-loss-rates-grid').waitFor();
  assert.equal(await page.locator('#fat-loss-summary-box').count(), 0, 'Fat-loss projection card is still visible');

  await page.locator('#q-back-step-btn').click();
  await page.locator('.goal-card[data-goal="muscle_gain"]').click();
  await page.locator('#q-next-step-btn').click();
  await page.locator('.weekly-gain-rates-grid').waitFor();
  assert.equal(await page.locator('#weight-gain-summary-box').count(), 0, 'Weight-gain projection card is still visible');

  await page.locator('#q-next-step-btn').click();
  await page.locator('#q-liked-foods-input').waitFor();
  assert.equal(await page.locator('input[name="q-allergens"]').count(), 0, 'Food-allergy controls are still visible');

  await page.locator('#q-next-step-btn').click();
  await page.locator('#q-sleep').waitFor();
  await page.locator('#q-next-step-btn').click();
  await page.locator('#q-workout-days').waitFor();
  await page.locator('#q-next-step-btn').click();
  await page.locator('#q-supplements-input').waitFor();
  assert.equal(await page.locator('input[type="checkbox"]').count(), 0, 'Old supplement checkboxes are still visible');
  assert.equal(await page.locator('#pills-selected-supplements .food-tag-pill').count(), 3, 'Default supplement pills are missing');
  await page.locator('.supplement-rec-chip[data-supplement="Whey protein"]').click();
  await page.locator('#q-supplements-input').fill('مغنيسيوم');
  await page.locator('#dropdown-supplements .food-autocomplete-item').first().waitFor();
  await page.locator('#dropdown-supplements .food-autocomplete-item').first().click();
  assert.equal(await page.locator('#pills-selected-supplements .food-tag-pill').count(), 5, 'Supplement search did not add a pill');

  await page.locator('#q-next-step-btn').click();
  await page.locator('#create-my-plan-btn').waitFor();
  await page.locator('#create-my-plan-btn').click();
  await page.locator('#plan-gen-overlay').waitFor({ state: 'visible' });
  await page.waitForFunction(() => location.hash === '#today', null, { timeout: 20000 });
  const selectedStack = await page.evaluate(async () => {
    const { store } = await import('/src/state/store.js');
    return store.getDailyStackItems().map(item => item.name);
  });
  assert.ok(selectedStack.some(name => name.includes('Whey protein')), 'Selected whey supplement was not saved');
  assert.ok(selectedStack.some(name => name.includes('Magnesium')), 'Searched magnesium supplement was not saved');
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

  // Meal speech result must stay editable until explicit confirmation, then reach Nutrition state.
  await page.evaluate(() => { location.hash = 'neon-ai'; });
  await page.locator('#neon-ai-result-body').waitFor({ state: 'attached' });
  await page.evaluate(async () => {
    const { renderNeonResult } = await import('/src/components/neonResultCards.js');
    const body = document.getElementById('neon-ai-result-body');
    document.getElementById('neon-ai-result-card')?.classList.remove('is-empty');
    renderNeonResult(body, {
      status: 'clarification',
      reply: 'راجع الوجبة قبل الحفظ.',
      cards: [{
        id: 'local-browser-test', type: 'meal_draft', local: true,
        question: 'هل تود إضافة الوجبة التي ذكرتها؟',
        meals: [{ mealType: 'lunch', items: [
          { nameAr: 'صدر دجاج مشوي', nameEn: 'Grilled Chicken Breast', grams: 250, state: 'cooked', calories: 412.5, protein: 77.5, carbs: 0, fats: 9 },
          { nameAr: 'بطاطا مسلوقة', nameEn: 'Boiled Potatoes', grams: 150, state: 'cooked', calories: 130.5, protein: 2.9, carbs: 30, fats: 0.2 }
        ] }]
      }]
    });
  });
  await page.getByText('هل تود إضافة الوجبة التي ذكرتها؟').waitFor();
  assert.equal(await page.locator('.meal-draft-item').count(), 2, 'Meal items are not fully displayed');
  await page.locator('.meal-draft-item').first().locator('input[type="number"]').fill('200');
  await page.locator('.meal-draft-item').first().getByRole('button', { name: 'تعديل' }).click();
  await page.locator('.meal-draft-item').nth(1).getByRole('button', { name: 'حذف' }).click();
  await page.getByLabel('بحث عن صنف لإضافته').fill('بطاطا');
  await page.locator('.meal-food-suggestion').first().getByRole('button', { name: 'إضافة' }).click();
  await page.getByRole('button', { name: 'إضافة إلى التغذية' }).click();
  await page.getByText(/تمت إضافة غداء إلى سجل التغذية/).waitFor();
  const savedMeal = await page.evaluate(async () => {
    const { store } = await import('/src/state/store.js');
    return store.getState().loggedMeals.at(-1);
  });
  assert.equal(savedMeal.titleAr, 'غداء');
  assert.equal(savedMeal.items.length, 2);
  assert.equal(savedMeal.items[0].grams, 200);

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
    projectionCardsRemoved: true,
    foodAllergyControlsRemoved: true,
    supplementSearchVerified: true,
    planLoadingVerified: true,
    editableMealDraftVerified: true,
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
