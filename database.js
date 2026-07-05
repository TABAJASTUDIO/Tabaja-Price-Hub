const STORAGE_KEY = "tabaja_price_hub_v1";

let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  companies: [
    { id: "co1", name: "Sierra Fishing Company", whatsapp: "23276000000", active: "yes" },
    { id: "co2", name: "Sierra Sea Food Processing", whatsapp: "23276000000", active: "yes" }
  ],
  customers: [],
  products: [],
  analytics: []
};

function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  renderAll();
}

function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function money(n) {
  return Number(n || 0).toLocaleString() + " NLe";
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}
