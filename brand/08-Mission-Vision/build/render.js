const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const scale = 2.5; // 1600x1131 CSS -> 4000x2828 px
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1131 },
    deviceScaleFactor: scale,
  });
  const fileUrl = 'file://' + path.resolve(__dirname, 'mission-vision.html');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const el = await page.$('.page');
  const out = path.resolve(__dirname, '..', 'Lumen-Labs-Mission-Vision.png');
  await el.screenshot({ path: out });
  console.log('Wrote', out);
  await browser.close();
})();
