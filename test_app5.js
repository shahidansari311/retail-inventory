const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/shahid-ansari/Downloads/project/inventory/chrome/linux-154.0.8037.92/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const findings = [];
  
  try {
    findings.push("Starting Register...");
    await page.goto('http://localhost:4200/register', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="name"]', 'Test Admin');
    await page.type('input[formcontrolname="email"]', 'admin@example.com');
    await page.select('select[formcontrolname="role"]', 'ADMIN');
    await page.type('input[formcontrolname="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    findings.push("Starting Login...");
    await page.goto('http://localhost:4200/login', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="email"]', 'admin@example.com');
    await page.type('input[formcontrolname="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
    const dashboardHtml = await page.evaluate(() => document.body.innerHTML);
    if(dashboardHtml.includes('Dashboard')) {
       findings.push("Dashboard loaded successfully.");
       
       // check stats
       if(dashboardHtml.includes('Total Products') || dashboardHtml.includes('Out of Stock')) {
          findings.push("Dashboard stats rendered correctly.");
       } else {
          findings.push("Dashboard stats missing or not loaded.");
       }
       
       // get sidebar links
       const links = await page.$$eval('nav a, .sidebar a', as => as.map(a => ({href: a.href, text: a.innerText})));
       findings.push(`Found sidebar links: ${links.map(l => l.text).join(', ')}`);
       
       // Click stock movements
       const movementsLink = await page.$('a[href*="stock-movement"]');
       if(movementsLink) {
         findings.push("Clicking Stock Movements link...");
         await movementsLink.click();
         await new Promise(r => setTimeout(r, 2000));
         const smHtml = await page.evaluate(() => document.body.innerHTML);
         if(smHtml.includes('Stock Movement') || smHtml.includes('Movement')) {
           findings.push("Stock movements page rendered correctly.");
           const buttons = await page.$$eval('button', bs => bs.map(b => b.innerText));
           findings.push(`Buttons found on stock movements page: ${buttons.join(', ')}`);
         } else {
           findings.push("Stock movements content missing.");
         }
       } else {
         findings.push("Could not find Stock Movements link in sidebar.");
       }
       
    } else {
       findings.push("Dashboard did not load. Still on login?");
    }
  } catch (e) {
    findings.push(`Error: ${e.message}`);
  }
  
  console.log(findings.join('\n'));
  await browser.close();
})();
