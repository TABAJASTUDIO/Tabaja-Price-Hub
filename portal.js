function renderPreviewCustomers() {
  previewCustomer.innerHTML = db.customers.map(c =>
    `<option value="${c.code}">${esc(c.name)} - ${esc(c.code)}</option>`
  ).join("");

  renderPortal();
}

function renderPortal() {
  const code = previewCustomer.value;
  if (!code) {
    portalPreview.innerHTML = "<p>No customer.</p>";
    return;
  }

  portalPreview.innerHTML = publicHTML(code);
}

function publicHTML(code) {
  const customer = db.customers.find(c => c.code === code);
  if (!customer) return "<h1>Card not found</h1>";

  if (customer.status !== "Active") {
    return "<div class='hero'><h1>Access Disabled</h1><p>Please contact your agent.</p></div>";
  }

  const companies = db.companies.filter(company =>
    (customer.companyAccess || []).includes(company.id) &&
    company.active === "yes"
  );

  return `
    <div class="hero">
      <h1>TABAJA Price Hub</h1>
      <p class="muted">Choose company to view prices</p>
      ${companies.map(company => `
        <button class="btn bigbtn" onclick="showCompanyPrices('${company.id}', '${customer.code}')">
          ${esc(company.name)}
        </button>
      `).join("")}

      <button class="btn green bigbtn" onclick="location.href='https://wa.me/${esc(companies[0]?.whatsapp || "")}'">
        🟢 WhatsApp Agent
      </button>

      ${customer.canOffers === "yes"
        ? `<button class="btn bigbtn" onclick="showOffers('${customer.code}')">🔥 Today's Offers</button>`
        : ""}

      <p class="muted">Powered by TABAJA</p>
    </div>

    <div id="publicContent"></div>
  `;
}

function showCompanyPrices(companyId, code) {
  const rows = db.products
    .filter(p => p.companyId === companyId && p.status === "Active")
    .sort((a, b) => a.name.localeCompare(b.name));

  const box = document.getElementById("publicContent");

  box.innerHTML = `
    <input class="search" placeholder="Search product..." oninput="filterPublic(this.value, '${companyId}')">
    <div id="pricesBox">${priceRows(rows)}</div>
  `;
}

function priceRows(rows) {
  return rows.map(p => `
    <div class="price-row">
      <b>${esc(p.name)}</b>
      <span>${money(p.price)}</span>
    </div>
  `).join("");
}

function filterPublic(q, companyId) {
  q = q.toLowerCase();

  const rows = db.products
    .filter(p =>
      p.companyId === companyId &&
      p.status === "Active" &&
      p.name.toLowerCase().includes(q)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  pricesBox.innerHTML = priceRows(rows);
}

function showOffers(code) {
  const customer = db.customers.find(c => c.code === code);
  if (!customer || customer.canOffers !== "yes") return;

  const rows = db.products.filter(p =>
    (customer.companyAccess || []).includes(p.companyId) &&
    p.isOffer === "yes"
  );

  publicContent.innerHTML = rows.length
    ? priceRows(rows.map(p => ({ ...p, price: p.offerPrice || p.price })))
    : "<p class='muted'>No offers today.</p>";
}
