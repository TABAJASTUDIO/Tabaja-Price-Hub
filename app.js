document.querySelectorAll(".nav button").forEach(button => { button.onclick = () => showTab(button.dataset.tab); });

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
  document.querySelector('.nav button[data-tab="' + id + '"]').classList.add("active");
  renderAll();
}

function renderAll() {
  renderStats();
  renderCompanies();
  renderCustomerAccess();
  renderCustomers();
  renderUploadCompanies();
  renderProducts();
  renderOfferPicker();
  renderPreviewCustomers();
}

function renderStats() {
  kCompanies.textContent = db.companies.length;
  kCustomers.textContent = db.customers.length;
  kProducts.textContent = db.products.length;
}

async function initPublic() {
  const params = new URLSearchParams(location.search);
  const code = params.get("c");
  if (code) {
    adminApp.classList.add("hidden");
    publicApp.classList.remove("hidden");
    publicApp.innerHTML = publicHTML(code);
  }
}

async function boot() {
  await loadDB();
  clearCustomerForm();
  renderAll();
  await initPublic();
}

boot();