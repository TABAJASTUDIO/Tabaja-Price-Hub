function clearCustomerForm() {
  customerId.value = "";
  customerName.value = "";
  customerPhone.value = "";
  customerAgent.value = "";
  customerCode.value = "C" + String(db.customers.length + 1).padStart(6, "0");
  customerOffers.value = "no";
  customerStatus.value = "Active";
  renderCustomerAccess([]);
}

function saveCustomer() {
  const id = customerId.value || uid("cu");
  const access = [...document.querySelectorAll(".accessBox:checked")].map(x => x.value);

  const customer = {
    id,
    name: customerName.value.trim(),
    phone: customerPhone.value.trim(),
    agent: customerAgent.value.trim(),
    code: customerCode.value.trim() || ("C" + String(db.customers.length + 1).padStart(6, "0")),
    canOffers: customerOffers.value,
    status: customerStatus.value,
    companyAccess: access
  };

  if (!customer.name) return alert("Customer name required");

  const index = db.customers.findIndex(c => c.id === id);
  if (index >= 0) db.customers[index] = customer;
  else db.customers.push(customer);

  clearCustomerForm();
  saveDB();
}

function editCustomer(id) {
  const customer = db.customers.find(c => c.id === id);
  if (!customer) return;

  customerId.value = customer.id;
  customerName.value = customer.name;
  customerPhone.value = customer.phone;
  customerAgent.value = customer.agent;
  customerCode.value = customer.code;
  customerOffers.value = customer.canOffers;
  customerStatus.value = customer.status;
  renderCustomerAccess(customer.companyAccess || []);
}

function deleteCustomer(id) {
  if (!confirm("Delete customer?")) return;
  db.customers = db.customers.filter(c => c.id !== id);
  saveDB();
}

function renderCustomerAccess(selected = []) {
  customerCompanyAccess.innerHTML = db.companies.map(company => `
    <label>
      <input class="accessBox" type="checkbox" value="${company.id}" ${selected.includes(company.id) ? "checked" : ""}>
      ${esc(company.name)}
    </label>
  `).join("");
}

function renderCustomers() {
  customerList.innerHTML =
    "<table><tr><th>Name</th><th>Code</th><th>Agent</th><th>Offers</th><th>Status</th><th>Card Link</th><th>Action</th></tr>" +
    db.customers.map(c => `
      <tr>
        <td>${esc(c.name)}</td>
        <td>${esc(c.code)}</td>
        <td>${esc(c.agent)}</td>
        <td>${c.canOffers === "yes" ? "✅" : "❌"}</td>
        <td>${esc(c.status)}</td>
        <td><a style="color:#f7db82" target="_blank" href="?c=${encodeURIComponent(c.code)}">Open</a></td>
        <td>
          <button class="btn secondary" onclick="editCustomer('${c.id}')">✏️ Edit</button>
          <button class="btn danger" onclick="deleteCustomer('${c.id}')">Delete</button>
        </td>
      </tr>
    `).join("") +
    "</table>";
}
