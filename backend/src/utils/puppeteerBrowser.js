const fs = require('fs');

let puppeteer = undefined;

const LINUX_CHROME_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);

const getPuppeteer = () => {
  if (puppeteer !== undefined) return puppeteer;
  try {
    // Loaded only when a PDF/image is generated — never at server boot.
    // eslint-disable-next-line global-require
    puppeteer = require('puppeteer');
  } catch {
    puppeteer = null;
  }
  return puppeteer;
};

const launchOptions = () => {
  const options = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  const executablePath = LINUX_CHROME_PATHS.find((file) => fs.existsSync(file));
  if (executablePath) {
    options.executablePath = executablePath;
  }

  return options;
};

module.exports = { getPuppeteer, launchOptions };
