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
        <button class="btn bigbtn" type="button" onclick="showCompanyPrices('${company.id}', '${customer.code}')">
          ${esc(company.name)}
        </button>
      `).join("")}

      <button class="btn green bigbtn" type="button" onclick="location.href='https://wa.me/${esc(companies[0]?.whatsapp || "")}'">
        🟢 WhatsApp Agent
      </button>

      ${customer.canOffers === "yes"
        ? `<button class="btn bigbtn" type="button" onclick="showOffers('${customer.code}')">🔥 Today's Offers</button>`
        : ""}

      <p class="muted">Powered by TABAJA</p>
    </div>

    <div id="publicContent" class="panel"></div>
  `;
}

function showCompanyPrices(companyId, code) {
  const company = db.companies.find(c => c.id === companyId);
  const rows = db.products
    .filter(p => p.companyId === companyId && p.status === "Active")
    .sort((a, b) => a.name.localeCompare(b.name));

  const box = document.getElementById("publicContent");

  if (!box) {
    alert("Display area not found. Please refresh the page.");
    return;
  }

  if (!rows.length) {
    box.innerHTML = `<h2>${esc(company?.name || "Company")}</h2><p class="muted">No prices found for this company.</p>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  box.innerHTML = `
    <h2>${esc(company?.name || "Price List")}</h2>
    <input class="search" placeholder="Search product..." oninput="filterPublic(this.value, '${companyId}')">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Particular's</th>
            <th>CTN</th>
            <th>BAG</th>
          </tr>
        </thead>
        <tbody id="pricesBox">${priceRows(rows)}</tbody>
      </table>
    </div>
  `;

  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function priceRows(rows) {
  return rows.map(p => `
    <tr>
      <td><b>${esc(p.name)}</b></td>
      <td>${p.ctn !== "" && p.ctn !== undefined ? money(p.ctn) : "-"}</td>
      <td>${p.bag !== "" && p.bag !== undefined ? money(p.bag) : "-"}</td>
    </tr>
  `).join("");
}

function filterPublic(q, companyId) {
  q = String(q || "").toLowerCase();

  const rows = db.products
    .filter(p =>
      p.companyId === companyId &&
      p.status === "Active" &&
      p.name.toLowerCase().includes(q)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const pricesBox = document.getElementById("pricesBox");
  if (pricesBox) pricesBox.innerHTML = priceRows(rows);
}

function showOffers(code) {
  const customer = db.customers.find(c => c.code === code);
  if (!customer || customer.canOffers !== "yes") return;

  const rows = db.products
    .filter(p =>
      (customer.companyAccess || []).includes(p.companyId) &&
      p.isOffer === "yes"
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const box = document.getElementById("publicContent");
  if (!box) return;

  box.innerHTML = rows.length
    ? `
      <h2>Today's Offers</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Particular's</th>
              <th>Offer</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(p => `
              <tr>
                <td><b>${esc(p.name)}</b></td>
                <td>${money(p.offerPrice || p.price)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `
    : "<h2>Today's Offers</h2><p class='muted'>No offers today.</p>";

  box.scrollIntoView({ behavior: "smooth", block: "start" });
}