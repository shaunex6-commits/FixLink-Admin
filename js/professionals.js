let allPros = [];

function addTextCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function addBadgeCell(row, text, className) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = "badge " + className;
  span.textContent = text;
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
    body.appendChild(tr);
  });

  note.textContent = list.length + " of " + allPros.length + " professionals shown.";
}

function applyProFilters() {
  const term = document.getElementById("proSearch").value.trim().toLowerCase();
  const mode = document.getElementById("proFilter").value;

  const filtered = allPros.filter(function (p) {
    const text = [p.full_name, p.profession, p.email, p.phone, p.location]
      .join(" ").toLowerCase();
    if (!text.includes(term)) return false;
    if (mode === "verified") return p.verified === true;
    if (mode === "unverified") return p.verified !== true;
    if (mode === "premium") return p.is_premium === true;
    if (mode === "standard") return p.is_premium !== true;
    return true;
  });

  renderPros(filtered);
}

async function loadPros() {
  const note = document.getElementById("proNote");

  const { data, error } = await db
    .from("professionals")
    .select("id, full_name, email, phone, profession, location, years_experience, rating, starting_price, verified, is_premium")
    .order("full_name", { ascending: true })
    .limit(500);

  if (error) {
    console.error("Could not load professionals", error);
    if (note) note.textContent = "Could not load professionals.";
    return;
  }

  allPros = data;
  renderPros(allPros);
}

const proSearch = document.getElementById("proSearch");
const proFilter = document.getElementById("proFilter");
if (proSearch) proSearch.addEventListener("input", applyProFilters);
if (proFilter) proFilter.addEventListener("change", applyProFilters);

loadPros();