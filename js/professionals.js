let allPros = [];

function addTextCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function addBadgeCell(row, text, className, tip) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = "badge " + className;
  span.textContent = text;
  if (tip) span.title = tip;
  td.appendChild(span);
  row.appendChild(td);
}

function renderPros(list) {
  const body = document.getElementById("proRows");
  const note = document.getElementById("proNote");
  if (!body || !note) return;

  body.innerHTML = "";
  list.forEach(function (p) {
    const tr = document.createElement("tr");
    addTextCell(tr, p.full_name);
    addTextCell(tr, p.profession);
    addTextCell(tr, p.location);
    addTextCell(tr, p.years_experience !== null ? p.years_experience + " yrs" : "");
    addTextCell(tr, p.rating !== null ? Number(p.rating).toFixed(1) : "");
    addTextCell(tr, p.starting_price !== null ? Number(p.starting_price).toLocaleString() : "");
    addBadgeCell(tr, p.verified ? "Verified" : "Unverified", p.verified ? "badge-green" : "badge-grey");
    addBadgeCell(tr, p.is_premium ? "Premium" : "Standard", p.is_premium ? "badge-gold" : "badge-grey");
    addBadgeCell(tr, p.is_suspended ? "Suspended" : "Active", p.is_suspended ? "badge-red" : "badge-green", p.suspend_reason);

    const actionCell = document.createElement("td");
    actionCell.appendChild(makeActionButton(p.profile_id, p.full_name, p.is_suspended));
    tr.appendChild(actionCell);

    body.appendChild(tr);
  });

  note.textContent = list.length + " of " + allPros.length + " professionals shown. Suspensions are recorded here; they do not yet block the main FixLink app.";
}

function applyProFilters() {
  const term = document.getElementById("proSearch").value.trim().toLowerCase();
  const mode = document.getElementById("proFilter").value;

  const filtered = allPros.filter(function (p) {
    const text = [p.full_name, p.profession, p.location].join(" ").toLowerCase();
    if (!text.includes(term)) return false;
    if (mode === "verified") return p.verified === true;
    if (mode === "unverified") return p.verified !== true;
    if (mode === "premium") return p.is_premium === true;
    if (mode === "standard") return p.is_premium !== true;
    if (mode === "suspended") return p.is_suspended === true;
    return true;
  });

  renderPros(filtered);
}

async function loadPros() {
  const note = document.getElementById("proNote");

  const { data, error } = await db.rpc("admin_list_professionals");

  if (error) {
    console.error("Could not load professionals", error);
    if (note) note.textContent = "Could not load professionals: " + error.message;
    return;
  }

  allPros = data;
  applyProFilters();
}

const proSearch = document.getElementById("proSearch");
const proFilter = document.getElementById("proFilter");
if (proSearch) proSearch.addEventListener("input", applyProFilters);
if (proFilter) proFilter.addEventListener("change", applyProFilters);

loadPros();