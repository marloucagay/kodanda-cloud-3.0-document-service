function safeText(v, fallback = "") {
  const s = String(v ?? "").trim();
  return s.length ? s : fallback;
}

function money(n, decimals = 2) {
  const num = Number(n ?? 0);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

module.exports = {
  safeText,
  money,
};
