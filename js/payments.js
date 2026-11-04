let allPayments = [];

function addPayText(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

function money(value) {
  return value !== null && value !== undefined ? Number(value).toLocaleString() : "";
}

function payDate(value) {
  return value ? new Date(value).toLocaleDateString() : "";
}

function addPayBadge(row, status) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = "badge badge-grey";
  span.textContent = status || "unknown";
  td.appendChild(span);
  row.appendChild(td);
}

function renderPayments(list) {
  const body = document.getElementById("paymentRows");
  const note = document.getElementById("paymentNote");
  if (!body || !note) return;

  body.innerHTML = "";
  list.forEach(function (p) {
    const tr = document.createElement("tr");
    addPayText(tr, p.payment_reference);
    addPayText(tr, p.customerName);
    addPayText(tr, p.professionalName);
    addPayText(tr, money(p.total_amount));
    addPayText(tr, money(p.professional_amount));
    addPayText(tr, money(p.customer_fee));
    addPayText(tr, money(p.professional_fee));
    addPayText(tr, money(p.fixlink_amount));
    addPayBadge(tr, p.status);
    addPayText(tr, payDate(p.paid_at));
    addPayText(tr, payDate(p.released_at));
    addPayText(tr, payDate(p.refunded_at));
    body.appendChild(tr);
  });

  if (allPayments.length === 0) {
    note.textContent = "No payments have been recorded yet.";
  } else {
    note.textContent = list.length + " of " + allPayments.length + " payments shown.";
  }
}

function applyPaymentSearch() {
  const term = document.getElementById("paymentSearch").value.trim().toLowerCase();
  const filtered = allPayments.filter(function (p) {
    return [p.payment_reference, p.customerName, p.professionalName]
      .join(" ").toLowerCase().includes(term);
  });
  renderPayments(filtered);
}

async function loadPayments() {
  const note = document.getElementById("paymentNote");
  const card = document.getElementById("stat-revenue");

  const results = await Promise.all([
    db.from("payments")
      .select("id, customer_id, professional_id, payment_reference, status, total_amount, professional_amount, customer_fee, professional_fee, fixlink_amount, paid_at, released_at, refunded_at, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    db.from("customers").select("id, full_name").limit(1000),
    db.from("professionals").select("id, full_name").limit(1000)
  ]);

  const paymentsResult = results[0];
  if (paymentsResult.error) {
    console.error("Could not load payments", paymentsResult.error);
    if (note) note.textContent = "Could not load payments: " + paymentsResult.error.message;
    if (card) card.textContent = "Error";
    return;
  }

  const customerNames = {};
  const professionalNames = {};
  (results[1].data || []).forEach(function (c) { customerNames[c.id] = c.full_name; });
  (results[2].data || []).forEach(function (p) { professionalNames[p.id] = p.full_name; });

  allPayments = paymentsResult.data.map(function (p) {
    p.customerName = customerNames[p.customer_id] || "";
    p.professionalName = professionalNames[p.professional_id] || "";
    return p;
  });

  // Revenue counts only payments with a paid time and no refund time.
  let revenue = 0;
  allPayments.forEach(function (p) {
    if (p.paid_at && !p.refunded_at) revenue += Number(p.fixlink_amount || 0);
  });
  if (card) card.textContent = "₦" + revenue.toLocaleString();

  renderPayments(allPayments);
}

const paymentSearch = document.getElementById("paymentSearch");
if (paymentSearch) paymentSearch.addEventListener("input", applyPaymentSearch);

loadPayments();