const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('nutrisnap_profile', JSON.stringify({
      name: 'Test',
      email: 'test@example.com',
      calorieTarget: 2000,
      isEmailVerified: true
    }));
  });
  
  await page.goto('http://localhost:3000/#/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  const html = await page.content();
  console.log('HTML CONTENT:');
  console.log(html);
  await browser.close();
  process.exit(0);
})();
