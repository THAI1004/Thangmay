const puppeteer = require('puppeteer');

async function checkConsole() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[Browser Error] ${error.message}`);
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    
    await page.type('input[name="email"]', 'admin');
    await page.type('input[name="password"]', 'admin');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]') || page.click('.btn-primary')
    ]);
    
    console.log("Navigating to maintenance...");
    await page.goto('http://localhost:3000/maintenance');
    await page.waitForTimeout(2000); // give it time to load JS

    console.log("Clicking save button...");
    const saveBtns = await page.$$('.save-actual-date');
    if (saveBtns.length > 0) {
       await saveBtns[0].click();
       await page.waitForTimeout(2000);
       console.log("Save button clicked successfully.");
    } else {
       console.log("No .save-actual-date buttons found!");
    }

  } catch (err) {
    console.log("Exploration error:", err);
  } finally {
    await browser.close();
  }
}

checkConsole();
