/**
 * Cloud Run–safe Puppeteer launch options.
 * --single-process is required alongside --no-zygote in restricted containers.
 */
function getPuppeteerLaunchOptions() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();

  return {
    headless: "new",
    ...(executablePath ? { executablePath } : {}),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  };
}

module.exports = {
  getPuppeteerLaunchOptions,
};
