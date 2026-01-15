const axios = require("axios");
// Very small cache: url -> { dataUri, expiresAt }
const LOGO_CACHE = new Map();

/**
 * Convert an image URL (or already-data-uri) into a data URI.
 * This avoids CORS/hotlink/auth issues when rendering puppeteer header images.
 */
async function ensureDataUriLogo(logoSrc, { ttlMs = 10 * 60 * 1000 } = {}) {
  if (!logoSrc) return "";

  // Already a data URI
  if (logoSrc.startsWith("data:image/")) return logoSrc;

  // Not a URL? (e.g. empty, relative path) - return as-is
  if (!/^https?:\/\//i.test(logoSrc)) return logoSrc;

  // Cache hit
  const cached = LOGO_CACHE.get(logoSrc);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.dataUri;
  }

  // Fetch binary image server-side
  const resp = await axios.get(logoSrc, {
    responseType: "arraybuffer",
    // Optional: if your logo host blocks unknown agents, this helps
    headers: { "User-Agent": "InvoicePDF/1.0" },
    timeout: 15000,
  });

  const contentType = resp.headers["content-type"] || "image/png";
  const base64 = Buffer.from(resp.data).toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  LOGO_CACHE.set(logoSrc, { dataUri, expiresAt: Date.now() + ttlMs });
  return dataUri;
}

module.exports = {
  ensureDataUriLogo,
};
