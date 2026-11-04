let allBookings = [];

function addBookingText(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function addBookingBadge(row, status) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  const word = status || "unknown";
  let cls = "badge-grey";
  if (word === "requested") cls = "badge-gold";
  if (word === "accepted") cls = "badge-blue";
  span.className = "badge " + cls;
  span.textContent = word;
  td.appendChild(span);
  row.appendChild(td);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "";
}

function renderBookings(list) {
  const body = document.getElementById("bookingRows");
  const note = document.getElementById("bookingNote");
  if (!body || !note) return;

  body.innerHTML = "";
  list.forEach(function (b) {
    const tr = document.createElement("tr");
    addBookingText(tr, b.service);
    addBookingText(tr, b.customerName);
    addBookingText(tr, b.professionalName);
    addBookingText(tr, b.location);
    addBookingText(tr, b.urgency);
    addBookingText(tr, b.budget !== null ? Number(b.budget).toLocaleString() : "");
    addBookingText(tr, formatDate(b.scheduled_at));
    addBookingText(tr, formatDate(b.created_at));
    addBookingBadge(tr, b.status);
    body.appendChild(tr);
  });

  note.textContent = list.length + " of " + allBookings.length + " bookings shown.";
}

function applyBookingFilters() {
  const term = document.getElementById("bookingSearch").value.trim().toLowerCase();
  const mode = document.getElementById("bookingFilter").value;

  const filtered = allBookings.filter(function (b) {
    const text = [b.service, b.customerName, b.professionalName, b.location]
      .join(" ").toLowerCase();
    if (!text.includes(term)) return false;
    if (mode !== "all" && (b.status || "unknown") !== mode) return false;
    return true;
  });

  renderBookings(filtered);
}

function fillStatusFilter(list) {
  const select = document.getElementById("bookingFilter");
  const seen = {};
  list.forEach(function (b) { seen[b.status || "unknown"] = true; });

  Object.keys(seen).sort().forEach(function (word) {
    const option = document.createElement("option");
    option.value = word;
    option.textContent = word;
    select.appendChild(option);
  });
}

async function loadBookings() {
  const note = document.getElementById("bookingNote");

  const results = await Promise.all([
    db.from("bookings")
      .select("id, customer_id, professional_id, service, location, status, urgency, budget, scheduled_at, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    db.from("customers").select("id, full_name").limit(1000),
    db.from("professionals").select("id, full_name").limit(1000)
  ]);

  const bookingsResult = results[0];
  if (bookingsResult.error) {
    console.error("Could not load bookings", bookingsResult.error);
    if (note) note.textContent = "Could not load bookings: " + bookingsResult.error.message;
    return;
  }

  const customerNames = {};
  const professionalNames = {};
  (results[1].data || []).forEach(function (c) { customerNames[c.id] = c.full_name; });
  (results[2].data || []).forEach(function (p) { professionalNames[p.id] = p.full_name; });

  allBookings = bookingsResult.data.map(function (b) {
    b.customerName = customerNames[b.customer_id] || "";
    b.professionalName = professionalNames[b.professional_id] || "";
    return b;
  });

  fillStatusFilter(allBookings);
  renderBookings(allBookings);
}

const bookingSearch = document.getElementById("bookingSearch");
const bookingFilter = document.getElementById("bookingFilter");
if (bookingSearch) bookingSearch.addEventListener("input", applyBookingFilters);
if (bookingFilter) bookingFilter.addEventListener("change", applyBookingFilters);

loadBookings();