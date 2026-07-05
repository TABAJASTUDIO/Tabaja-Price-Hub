function importExcel() {
  const file = excelFile.files[0];
  const companyId = uploadCompany.value;

  if (!file) return alert("Choose Excel file");

  const reader = new FileReader();

  reader.onload = event => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const products = [];

    rows.forEach(row => {
      const name =
        row.Product ||
        row["Product Name"] ||
        row.product ||
        row.PRODUCT ||
        row.Name ||
        row.Item ||
        "";

      const price =
        row.Price ||
        row["CTN Price (NLe)"] ||
        row["Price (NLe)"] ||
        row.CTN ||
        row.price ||
        "";

      const code = row.Code || row["Product Code"] || "";
      const status = row.Status || "Active";

      if (name && price !== "") {
        products.push({
          id: uid("pr"),
          companyId,
          code: String(code),
          name: String(name).trim(),
          price: Number(String(price).replace(/,/g, "")) || 0,
          status: String(status),
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
