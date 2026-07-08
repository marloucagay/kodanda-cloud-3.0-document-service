const fs = require("fs");
const puppeteer = require("puppeteer");

// #region agent log
function agentDebugLog(location, message, data, hypothesisId) {
  const payload = {
    sessionId: "73b8e7",
    location,
    message,
    data,
    timestamp: Date.now(),
    hypothesisId,
    runId: process.env.DEBUG_RUN_ID || "pre-fix",
  };
  console.error("[DEBUG-73b8e7]", JSON.stringify(payload));
  fetch("http://127.0.0.1:7618/ingest/71039342-14db-438f-8e6a-22bc8642d8d7", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "73b8e7",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

function getSanitizedLaunchEnv() {
  const env = { ...process.env };
  delete env.DBUS_SESSION_BUS_ADDRESS;
  delete env.DBUS_SYSTEM_BUS_ADDRESS;
  return env;
}

/**
 * Cloud Run–safe Puppeteer launch options.
 * --single-process is required alongside --no-zygote in restricted containers.
 */
function getPuppeteerLaunchOptions() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();

  return {
    headless: "new",
    env: getSanitizedLaunchEnv(),
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

function getLaunchDiagnostics() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || "";
  let resolvedExecutablePath = "";
  try {
    resolvedExecutablePath = puppeteer.executablePath();
  } catch (err) {
    resolvedExecutablePath = `error: ${err?.message || String(err)}`;
  }

  return {
    configuredExecutablePath: executablePath || "(not set)",
    configuredExecutableExists: executablePath
      ? fs.existsSync(executablePath)
      : "n/a",
    resolvedPuppeteerExecutablePath: resolvedExecutablePath || "(empty)",
    dbusSessionBusAddress:
      process.env.DBUS_SESSION_BUS_ADDRESS || "(not set)",
    dbusSystemBusAddress: process.env.DBUS_SYSTEM_BUS_ADDRESS || "(not set)",
    dbusVarsStrippedFromChildEnv: true,
    nodeMemoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    platform: process.platform,
    arch: process.arch,
    launchArgs: getPuppeteerLaunchOptions().args,
  };
}

async function launchPuppeteerBrowser(source = "unknown") {
  const options = getPuppeteerLaunchOptions();
  const diagnostics = getLaunchDiagnostics();

  // #region agent log
  agentDebugLog(
    "puppeteerLaunch.js:launchPuppeteerBrowser:preflight",
    "puppeteer launch preflight",
    { source, ...diagnostics },
    "B,E",
  );
  // #endregion

  try {
    const browser = await puppeteer.launch(options);

    // #region agent log
    agentDebugLog(
      "puppeteerLaunch.js:launchPuppeteerBrowser:success",
      "puppeteer launch succeeded",
      { source, wsEndpoint: browser.wsEndpoint() },
      "A",
    );
    // #endregion

    return browser;
  } catch (err) {
    // #region agent log
    agentDebugLog(
      "puppeteerLaunch.js:launchPuppeteerBrowser:failure",
      "puppeteer launch failed",
      {
        source,
        errorMessage: err?.message || String(err),
        errorName: err?.name,
        diagnostics,
      },
      "B,C,D,E",
    );
    // #endregion

    throw err;
  }
}

module.exports = {
  getPuppeteerLaunchOptions,
  launchPuppeteerBrowser,
};
