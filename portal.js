function renderPreviewCustomers(){
  previewCustomer.innerHTML=db.customers.map(c=>`<option value="${c.code}">${esc(c.name)} - ${esc(c.code)}</option>`).join("");
  renderPortal();
}

function renderPortal(){
  const code=previewCustomer.value;
  if(!code){portalPreview.innerHTML="<p>No customer.</p>";return;}
  portalPreview.innerHTML=publicHTML(code);
}

function publicHTML(code){
  const customer=db.customers.find(c=>String(c.code)===String(code));
  if(!customer)return "<div class='hero'><h1>Card not found</h1></div>";
  if(customer.status!=="Active")return "<div class='hero'><h1>Access Disabled</h1><p>Please contact your agent.</p></div>";

  const companies=db.companies.filter(company =>
    (customer.companyAccess||[]).map(String).includes(String(company.id)) &&
    company.active==="yes"
  );

  return `<div class="hero">
    <h1>TABAJA Price Hub</h1>
    <p class="muted">Choose company to view prices</p>
    ${companies.map(company=>`<button class="btn bigbtn" onclick="showCompanyPrices('${company.id}','${customer.code}')">${esc(company.name)}</button>`).join("")}
    <button class="btn green bigbtn" onclick="location.href='https://wa.me/${String(companies[0]?.whatsapp||'').replace(/[^0-9]/g,'')}'">🟢 WhatsApp Agent</button>
    ${customer.canOffers==="yes"?`<button class="btn bigbtn" onclick="showOffers('${customer.code}')">🔥 Today's Offers</button>`:""}
    <p class="muted">Powered by TABAJA</p>
  </div>`;
}

function showCompanyPrices(companyId,code){
  companyId=String(companyId);
  code=String(code);

  const customer=db.customers.find(c=>String(c.code)===code);
  const company=db.companies.find(c=>String(c.id)===companyId);

  const rows=db.products
    .filter(p=>String(p.companyId)===companyId && String(p.status||"Active")==="Active")
    .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));

  const target=document.getElementById("publicApp") || document.getElementById("portalPreview");

  if(!target){
    alert("Display area not found");
    return;
  }

  target.innerHTML=`<div class="hero">
    <h1>${esc(company?.name||"Price List")}</h1>
    <p class="muted">${esc(customer?.name||"")} - ${esc(code)}</p>
    <button class="btn secondary bigbtn" onclick="goBackToCustomerHome('${code}')">← Back</button>
    <input class="search" placeholder="Search product..." oninput="filterPublic(this.value,'${companyId}')">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Particular's</th><th>CTN</th><th>BAG</th></tr></thead>
        <tbody id="pricesBox">${priceRows(rows)}</tbody>
      </table>
    </div>
    <p class="muted">Powered by TABAJA</p>
  </div>`;

  window.scrollTo(0,0);
}

function goBackToCustomerHome(code){
  const target=document.getElementById("publicApp") || document.getElementById("portalPreview");
  target.innerHTML=publicHTML(code);
  window.scrollTo(0,0);
}

function priceRows(rows){
  if(!rows.length)return `<tr><td colspan="3">No prices found</td></tr>`;
  return rows.map(p=>`<tr>
    <td><b>${esc(p.name)}</b></td>
    <td>${p.ctn!==""&&p.ctn!==undefined&&p.ctn!==null?money(p.ctn):"-"}</td>
    <td>${p.bag!==""&&p.bag!==undefined&&p.bag!==null?money(p.bag):"-"}</td>
  </tr>`).join("");
}

function filterPublic(q,companyId){
  q=String(q||"").toLowerCase();
  companyId=String(companyId);

  const rows=db.products
    .filter(p=>String(p.companyId)===companyId && String(p.status||"Active")==="Active" && String(p.name||"").toLowerCase().includes(q))
    .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));

  const pricesBox=document.getElementById("pricesBox");
  if(pricesBox)pricesBox.innerHTML=priceRows(rows);
}

function showOffers(code){
  const customer=db.customers.find(c=>String(c.code)===String(code));
  if(!customer||customer.canOffers!=="yes")return;

  const access=(customer.companyAccess||[]).map(String);
  const rows=db.products.filter(p=>access.includes(String(p.companyId)) && String(p.isOffer||"no")==="yes");

  const target=document.getElementById("publicApp") || document.getElementById("portalPreview");
  target.innerHTML=`<div class="hero">
    <h1>Today's Offers</h1>
    <button class="btn secondary bigbtn" onclick="goBackToCustomerHome('${code}')">← Back</button>
    <div class="table-wrap"><table>
      <thead><tr><th>Particular's</th><th>Offer</th></tr></thead>
      <tbody>${rows.length?rows.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${money(p.offerPrice||p.price||p.ctn||p.bag)}</td></tr>`).join(""):`<tr><td colspan="2">No offers today</td></tr>`}</tbody>
    </table></div>
  </div>`;

  window.scrollTo(0,0);
}