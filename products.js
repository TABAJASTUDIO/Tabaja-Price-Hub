function renderUploadCompanies() {
  const options = db.companies.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  uploadCompany.innerHTML = options;
  offerCompany.innerHTML = options;
}

function renderProducts() {
  const q = (adminProductSearch.value || "").toLowerCase();

  const rows = db.products.filter(product =>
    product.name.toLowerCase().includes(q)
  );

  productList.innerHTML =
    "<table><tr><th>Company</th><th>Product</th><th>Price</th><th>Status</th></tr>" +
    rows.map(p => {
      const company = db.companies.find(c => c.id === p.companyId) || {};
      return `
        <tr>
          <td>${esc(company.name)}</td>
          <td>${esc(p.name)}</td>
          <td>${money(p.price)}</td>
          <td>${esc(p.status)}</td>
        </tr>
      `;
    }).join("") +
    "</table>";
}
