const moment = require("moment");


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

function dateFormat(date) {
  if (!date) return '';

  const cleanDate = date.replace(/\s+/g, ' ').trim();
  const hasTime = cleanDate.includes(':');

  const m = moment(
    cleanDate,
    hasTime ? 'MM/DD/YYYY HH:mm' : 'MM/DD/YYYY',
    true
  );

  if (!m.isValid()) return '';

  return hasTime
    ? m.format('DD MMM YYYY HH:mm')
    : m.format('DD MMM YYYY');
}

module.exports = {
  safeText,
  money,
  dateFormat
};
