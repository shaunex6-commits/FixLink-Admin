let allCustomers = [];

function addCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function renderCustomers(list) {
  const body = document.getElementById("customerRows");
  body.innerHTML = "";

  list.forEach(function (c) {
    const tr = document.createElement("tr");
    addCell(tr, c.full_name);
    addCell(tr, c.email);
    addCell(tr, c.phone);
    addCell(tr, c.location);
    addCell(tr, c.created_at ? new Date(c.created_at).toLocaleDateString() : "");
    body.appendChild(tr);
  });

  document.getElementById("customerNote").textContent =
    list.length + " of " + allCustomers.length + " customers shown.";
}

async function loadCustomers() {
  const { data, error } = await db
    .from("customers")
    .select("id, full_name, email, phone, location, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Could not load customers", error);
    document.getElementById("customerNote").textContent = "Could not load customers.";
    return;
  }

  allCustomers = data;
  renderCustomers(allCustomers);
}

document.getElementById("customerSearch").addEventListener("input", function (e) {
  const term = e.target.value.trim().toLowerCase();
  const filtered = allCustomers.filter(function (c) {
    return [c.full_name, c.email, c.phone, c.location]
      .join(" ").toLowerCase().includes(term);
  });
  renderCustomers(filtered);
});

loadCustomers();