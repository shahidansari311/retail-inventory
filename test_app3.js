const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/shahid-ansari/Downloads/project/inventory/chrome/linux-154.0.8037.92/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  
  const findings = [];
  
  try {
    // Navigate to register
    await page.goto('http://localhost:4200/register', {waitUntil: 'networkidle2'});
    findings.push("Loaded register page.");
    
    // Fill register form
    await page.type('input[formcontrolname="username"]', 'testuser');
    await page.type('input[formcontrolname="email"]', 'testuser@example.com');
    await page.type('input[formcontrolname="password"]', 'Password123!');
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil: 'networkidle2'}).catch(()=> {
       return new Promise(r => setTimeout(r, 2000));
    });
    
    findings.push("Submitted registration. Trying to login if needed or check if auto-logged in.");
    
    // Login
    await page.goto('http://localhost:4200/login', {waitUntil: 'networkidle2'});
    await page.type('input[formcontrolname="email"]', 'testuser@example.com');
    await page.type('input[formcontrolname="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await new Promise(r => setTimeout(r, 2000));
    
    const dashboardHtml = await page.content();
    if(dashboardHtml.includes('Dashboard') || dashboardHtml.includes('sidebar')) {
       findings.push("Dashboard loaded successfully after login.");
    } else {
       findings.push("Dashboard might not have loaded after login.");
    }
    
    // Navigate to stock movements
    await page.goto('http://localhost:4200/dashboard/stock-movements', {waitUntil: 'networkidle2'}).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    const smHtml = await page.content();
    if(smHtml.includes('Stock Movement') || smHtml.includes('movement')) {
       findings.push("Stock Movements page loaded.");
    } else {
       findings.push("Failed to load Stock Movements page.");
    }

  } catch (e) {
    findings.push(`Error: ${e.message}`);
  }
  
  console.log(findings.join('\n'));
  await browser.close();
})();
