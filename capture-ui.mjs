import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'ui-preview.html');
const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await page.goto(fileUrl, { waitUntil: 'networkidle0' });

// Dark screenshot
await page.screenshot({ path: join(__dirname, 'ui-dark.png'), fullPage: false });
console.log('✓ ui-dark.png saved');

// PDF
await page.pdf({
  path: join(__dirname, 'ui-dark.pdf'),
  width: '1280px',
  height: '800px',
  printBackground: true,
});
console.log('✓ ui-dark.pdf saved');

// Light mode screenshot — toggle via JS
await page.evaluate(() => {
  document.body.style.background = '#ffffff';
  document.body.style.color = '#09090b';
  // swap every dark bg
  document.querySelectorAll('*').forEach(el => {
    const s = el.style;
    // handled via class swap below
  });
});

// Actually render light mode: inject a light-mode stylesheet override
await page.addStyleTag({ content: `
  body { background:#f8f8f8!important; color:#111!important; }
  aside { background:#f1f1f1!important; border-color:#e4e4e7!important; }
  header { background:#fff!important; border-color:#e4e4e7!important; }
  .sessions { background:#f1f1f1!important; }
  .session.active { background:#e0e0f0!important; color:#111!important; }
  .session { color:#555!important; }
  .bubble.user-bubble,.msg-row.user .bubble { background:#4f46e5!important; color:#fff!important; }
  .msg-row.model .bubble { background:#e8e8ec!important; color:#111!important; }
  .input-area { background:#fff!important; border-color:#e4e4e7!important; }
  .input-box { background:#f0f0f4!important; border-color:#4f46e5!important; }
  textarea { color:#111!important; }
  .sb-bottom { border-color:#e4e4e7!important; }
  .code-block { background:#1e1e2e!important; }
  .session-title { color:inherit!important; }
` });

await page.screenshot({ path: join(__dirname, 'ui-light.png'), fullPage: false });
console.log('✓ ui-light.png saved');

await browser.close();
console.log('\nAll done. Files saved to gemini-chatbot/');
