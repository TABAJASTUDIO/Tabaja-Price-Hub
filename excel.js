function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function findHeaderIndex(rawRows) {
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i].map(x => normalizeKey(x));

    const hasProduct =
      row.includes("product") ||
      row.includes("productname") ||
      row.includes("description") ||
      row.includes("particular") ||
      row.includes("particulars");

    const hasPrice =
      row.includes("price") ||
      row.includes("ctn") ||
      row.includes("carton") ||
      row.includes("bag");

    if (hasProduct && hasPrice) return i;
  }
  return -1;
}

function pickValue(row, names) {
  const wanted = names.map(normalizeKey);
  for (const key of Object.keys(row)) {
    if (wanted.includes(normalizeKey(key))) return row[key];
  }
  return "";
}

function cleanNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  if (!cleaned) return "";
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : "";
}

function importExcel() {
  const file = excelFile.files[0];
  const companyId = uploadCompany.value;

  if (!file) return alert("Choose Excel file");

  const reader = new FileReader();

  reader.onload = event => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: ""
    });

    const headerIndex = findHeaderIndex(rawRows);

    if (headerIndex === -1) {
      alert("Could not find headers. Use: Particular's, CTN, BAG");
      return;
    }

    const headers = rawRows[headerIndex].map(x => String(x || "").trim());

    const rows = rawRows.slice(headerIndex + 1).map(values => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header || "col" + index] = values[index];
      });
      return obj;
    });

    const products = [];

    rows.forEach(row => {
      const name = pickValue(row, [
        "Product",
        "Product Name",
        "Description",
        "Particular",
        "Particulars",
        "Particular's"
      ]);

      const ctn = cleanNumber(
        pickValue(row, ["CTN", "Carton", "Carton Price", "CTN Price"])
      );

      const bag = cleanNumber(
        pickValue(row, ["BAG", "Bag Price", "BAG Price (NLe)"])
      );

      const price = ctn !== "" ? ctn : cleanNumber(pickValue(row, ["Price"]));

      if (name && price !== "") {
        products.push({
          id: uid("pr"),
          companyId,
          code: "",
          name: String(name).trim(),
          price: Number(price),
          ctn: ctn === "" ? "" : Number(ctn),
          bag: bag === "" ? "" : Number(bag),
          status: "Active",
          isOffer: "no",
          offerPrice: ""
        });
      }
    });

    db.products = db.products
      .filter(product => product.companyId !== companyId)
      .concat(products.sort((a, b) => a.name.localeCompare(b.name)));

    saveDB();
    alert("Imported " + products.length + " products");
  };

  reader.readAsArrayBuffer(file);
}