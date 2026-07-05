function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function cleanNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  if (!cleaned) return "";
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : "";
}

function importExcel() {
    alert("IMPORT STARTED");
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

    let headerIndex = -1;
    let snCol = -1;
    let nameCol = -1;
    let ctnCol = -1;
    let bagCol = -1;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i].map(normalizeKey);

      snCol = row.findIndex(x => x === "sn" || x === "sno" || x === "no");
      nameCol = row.findIndex(x =>
        x === "particular" ||
        x === "particulars" ||
        x === "description" ||
        x === "product" ||
        x === "productname"
      );
      ctnCol = row.findIndex(x => x === "ctn" || x === "carton");
      bagCol = row.findIndex(x => x === "bag");

      if (nameCol !== -1 && (ctnCol !== -1 || bagCol !== -1)) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      alert("Import failed: headers not found. Required: Particular's + CTN or BAG");
      return;
    }

    const products = [];

    for (let i = headerIndex + 1; i < rawRows.length; i++) {
      const row = rawRows[i];

      const name = String(row[nameCol] || "").trim();
      const ctn = ctnCol >= 0 ? cleanNumber(row[ctnCol]) : "";
      const bag = bagCol >= 0 ? cleanNumber(row[bagCol]) : "";

      if (!name) continue;
      if (name.toLowerCase().includes("total")) continue;

      const price = ctn !== "" ? ctn : bag;

      if (price === "") continue;

      products.push({
        id: uid("pr"),
        companyId,
        code: "",
        name,
        price: Number(price),
        ctn: ctn === "" ? "" : Number(ctn),
        bag: bag === "" ? "" : Number(bag),
        status: "Active",
        isOffer: "no",
        offerPrice: ""
      });
    }

    if (!products.length) {
      alert(
        "Imported 0 products. Header row found at row " +
        (headerIndex + 1) +
        ", but no product rows were readable."
      );
      return;
    }

    db.products = db.products
      .filter(product => product.companyId !== companyId)
      .concat(products.sort((a, b) => a.name.localeCompare(b.name)));

    saveDB();

    alert("Imported " + products.length + " products");
  };

  reader.onerror = () => {
    alert("Import failed: could not read Excel file");
  };

  reader.readAsArrayBuffer(file);
}