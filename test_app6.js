const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/shahid-ansari/Downloads/project/inventory/chrome/linux-154.0.8037.92/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const findings = [];
  
  page.on('response', resp => {
    if (resp.url().includes('api/')) {
       findings.push(`API ${resp.request().method()} ${resp.url()} -> ${resp.status()}`);
    }
  });
  
  try {
    await page.goto('http://localhost:4200/register', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="name"]', 'Test Admin2');
    await page.type('input[formcontrolname="email"]', 'admin2@example.com');
    await page.select('select[formcontrolname="role"]', 'ADMIN');
    await page.type('input[formcontrolname="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    await page.goto('http://localhost:4200/login', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="email"]', 'admin2@example.com');
    await page.type('input[formcontrolname="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (e) {
    findings.push(`Error: ${e.message}`);
  }
  
  console.log(findings.join('\n'));
  await browser.close();
})();
