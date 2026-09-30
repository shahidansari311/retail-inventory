const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/shahid-ansari/Downloads/project/inventory/chrome/linux-154.0.8037.92/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const findings = [];
  page.on('console', msg => {
    findings.push(`Console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    findings.push(`Page Error: ${err.message}`);
  });

  try {
    findings.push("--- Testing Dashboard ---");
    await page.goto('http://localhost:4200', {waitUntil: 'networkidle2'});
    const dashboardHtml = await page.content();
    if(dashboardHtml.toLowerCase().includes('stock')) {
      findings.push("Dashboard loaded. Stock keyword found.");
    } else {
      findings.push("Dashboard loaded but 'stock' keyword not found.");
    }
    
    findings.push("--- Testing Navigation ---");
    // Find links
    const links = await page.$$eval('a', as => as.map(a => a.href));
    findings.push(`Found links: ${links.join(', ')}`);
    
    // Visit stock movements
    const movementsLink = links.find(l => l.includes('stock-movement') || l.includes('movements'));
    if (movementsLink) {
       findings.push(`Navigating to ${movementsLink}`);
       await page.goto(movementsLink, {waitUntil: 'networkidle2'});
       const movHtml = await page.content();
       findings.push(`Stock movements page length: ${movHtml.length}`);
    } else {
       findings.push("No explicit stock movements link found in standard <a> tags.");
       // Try generic navigation just in case
       await page.goto('http://localhost:4200/stock-movements', {waitUntil: 'networkidle2'});
       findings.push("Tried navigating to /stock-movements manually.");
    }
  } catch (e) {
    findings.push(`Test script error: ${e.message}`);
  }
  
  console.log(findings.join('\n'));
  await browser.close();
})();
