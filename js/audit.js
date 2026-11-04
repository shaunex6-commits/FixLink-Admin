function addAuditCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text || "—";
  row.appendChild(td);
}

async function loadAudit() {
  const body = document.getElementById("auditRows");
  const note = document.getElementById("auditNote");
  if (!body || !note) return;

  const results = await Promise.all([
    db.from("admin_audit_log")
      .select("id, admin_user_id, action, target_profile_id, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    db.rpc("admin_list_customers"),
    db.rpc("admin_list_professionals"),
    db.auth.getUser()
  ]);

  const logResult = results[0];
  if (logResult.error) {
    console.error("Could not load audit log", logResult.error);
    note.textContent = "Could not load audit log: " + logResult.error.message;
    return;
  }

  const names = {};
  (results[1].data || []).forEach(function (c) { names[c.profile_id] = c.full_name; });
  (results[2].data || []).forEach(function (p) { names[p.profile_id] = p.full_name; });

  const me = results[3].data && results[3].data.user ? results[3].data.user.id : null;

  body.innerHTML = "";
  logResult.data.forEach(function (entry) {
    const tr = document.createElement("tr");
    addAuditCell(tr, new Date(entry.created_at).toLocaleString());
    addAuditCell(tr, entry.action);
    addAuditCell(tr, names[entry.target_profile_id] || "Unknown account");
    addAuditCell(tr, entry.reason);
    addAuditCell(tr, entry.admin_user_id === me ? "You" : "Other admin");
    body.appendChild(tr);
  });

  note.textContent = logResult.data.length === 0
    ? "No admin actions have been recorded yet."
    : logResult.data.length + " recorded actions (newest first).";
}

loadAudit();