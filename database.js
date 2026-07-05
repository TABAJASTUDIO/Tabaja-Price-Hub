const STORAGE_KEY = "tabaja_price_hub_d1_final_fallback";

const defaultDb = {
  companies: [
    { id: "co1", name: "Sierra Fishing Company", whatsapp: "23276000000", active: "yes" },
    { id: "co2", name: "Sierra Sea Food Processing", whatsapp: "23276000000", active: "yes" }
  ],
  customers: [],
  products: [],
  analytics: []
};

let db = structuredClone(defaultDb);
let serverMode = false;

async function loadDB() {
  try {
    const res = await fetch("/api/data?ts=" + Date.now(), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      db = data && data.companies ? data : structuredClone(defaultDb);
      serverMode = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return;
    }
  } catch (e) {}

  db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || structuredClone(defaultDb);
  serverMode = false;
}

async function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  if (serverMode) {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(db)
      });
      if (!res.ok) throw new Error("Server save failed");
    } catch (e) {
      alert("Saved locally only. Server save failed.");
    }
  }
  renderAll();
}

function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function money(n) { return Number(n || 0).toLocaleString() + " NLe"; }
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function customerUrl(code) {
  return location.origin + location.pathname + "?c=" + encodeURIComponent(code);
}
function qrUrl(code) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(customerUrl(code));
}