async function countRows(table, filter) {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (filter && filter.notNull) query = query.not(filter.column, "is", null);
  else if (filter) query = query.eq(filter.column, filter.value);
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
  const r = await Promise.all([
    countRows("customers"),
    countRows("professionals"),
    countRows("professionals", { column: "verified", value: false }),
    countRows("bookings"),
    countRows("bookings", { column: "status", value: "requested" }),
    countRows("bookings", { column: "status", value: "accepted" }),
    countRows("bookings", { column: "completed_at", notNull: true })
  ]);

  setCard("stat-customers", r[0]);
  setCard("stat-professionals", r[1]);
  setCard("stat-unverified", r[2]);
  setCard("stat-bookings", r[3]);
  setCard("stat-requested", r[4]);
  setCard("stat-accepted", r[5]);
  setCard("stat-completed", r[6]);
}

loadStats();