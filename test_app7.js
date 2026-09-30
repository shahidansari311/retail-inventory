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
    findings.push("Starting Register...");
    await page.goto('http://localhost:4200/register', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="name"]', 'Test Admin3');
    await page.type('input[formcontrolname="email"]', 'admin3@example.com');
    await page.select('select[formcontrolname="role"]', 'ADMIN');
    await page.type('input[formcontrolname="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // wait for dashboard API calls
    await new Promise(r => setTimeout(r, 4000));
    
    const dashboardHtml = await page.evaluate(() => document.body.innerHTML);
    if(dashboardHtml.includes('Dashboard')) {
       findings.push("Dashboard loaded successfully.");
       
       // check stats
       if(dashboardHtml.includes('Total Products') || dashboardHtml.includes('Out of Stock')) {
          findings.push("Dashboard stats rendered correctly.");
       } else {
          findings.push("Dashboard stats missing or not loaded.");
       }
       
       // Click stock movements
       const movementsLink = await page.$('a[href*="stock-movement"]');
       if(movementsLink) {
         findings.push("Clicking Stock Movements link...");
         await Promise.all([
           page.waitForNavigation({waitUntil: 'networkidle2'}).catch(()=>{}),
           movementsLink.click()
         ]);
         await new Promise(r => setTimeout(r, 2000));
         const smHtml = await page.evaluate(() => document.body.innerHTML);
         if(smHtml.includes('Stock Movement') || smHtml.includes('movement')) {
           findings.push("Stock movements page rendered correctly.");
           const buttons = await page.$$eval('button', bs => bs.map(b => b.innerText).filter(b => b.trim() !== ''));
           findings.push(`Buttons found on stock movements page: ${buttons.join(', ')}`);
         } else {
           findings.push("Stock movements content missing.");
         }
       } else {
         findings.push("Could not find Stock Movements link in sidebar.");
       }
       
    } else {
       findings.push("Dashboard did not load after registration.");
    }
  } catch (e) {
    findings.push(`Error: ${e.message}`);
  }
  
  console.log(findings.join('\n'));
  await browser.close();
})();
