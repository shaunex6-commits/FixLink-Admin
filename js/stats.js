async function countRows(table, filter) {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) {
    console.error("Count failed for " + table, error);
    return "Error";
  }
  return count;
}

function setCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadStats() {
  const results = await Promise.all([
    countRows("customers"),
    countRows("professionals"),
    countRows("professionals", { column: "verified", value: false }),
    countRows("bookings"),
    countRows("bookings", { column: "status", value: "requested" })
  ]);

  setCard("stat-customers", results[0]);
  setCard("stat-professionals", results[1]);
  setCard("stat-unverified", results[2]);
  setCard("stat-bookings", results[3]);
  setCard("stat-requested", results[4]);
}

loadStats();