const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/shahid-ansari/Downloads/project/inventory/chrome/linux-154.0.8037.92/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4200/register', {waitUntil: 'networkidle2'});
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  await browser.close();
})();
