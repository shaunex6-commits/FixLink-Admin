let allCustomers = [];

function addCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function addStatusBadge(row, suspended, reason) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = "badge " + (suspended ? "badge-red" : "badge-green");
  span.textContent = suspended ? "Suspended" : "Active";
  if (suspended && reason) span.title = reason;
  td.appendChild(span);
  row.appendChild(td);
}

function renderCustomers(list) {
  const body = document.getElementById("customerRows");
  const note = document.getElementById("customerNote");
  if (!body || !note) return;

  body.innerHTML = "";
  list.forEach(function (c) {
    const tr = document.createElement("tr");
    addCell(tr, c.full_name);
    addCell(tr, c.email);
    addCell(tr, c.phone);
    addCell(tr, c.location);
    addCell(tr, c.created_at ? new Date(c.created_at).toLocaleDateString() : "");
    addStatusBadge(tr, c.is_suspended, c.suspend_reason);

    const actionCell = document.createElement("td");
    actionCell.appendChild(makeActionButton(c.profile_id, c.full_name, c.is_suspended));
    tr.appendChild(actionCell);

    body.appendChild(tr);
  });

  note.textContent = list.length + " of " + allCustomers.length + " customers shown. Suspensions are recorded here; they do not yet block the main FixLink app.";
}

function applyCustomerSearch() {
  const box = document.getElementById("customerSearch");
  const term = box ? box.value.trim().toLowerCase() : "";
  const filtered = allCustomers.filter(function (c) {
    return [c.full_name, c.email, c.phone, c.location]
      .join(" ").toLowerCase().includes(term);
  });
  renderCustomers(filtered);
}

async function loadCustomers() {
  const note = document.getElementById("customerNote");

  const { data, error } = await db.rpc("admin_list_customers");

  if (error) {
    console.error("Could not load customers", error);
    if (note) note.textContent = "Could not load customers: " + error.message;
    return;
  }

  allCustomers = data;
  applyCustomerSearch();
}

const searchBox = document.getElementById("customerSearch");
if (searchBox) searchBox.addEventListener("input", applyCustomerSearch);

loadCustomers();