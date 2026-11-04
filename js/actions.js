async function changeSuspension(profileId, name, suspend) {
  const who = name || "this account";
  const verb = suspend ? "suspend" : "restore";

  if (!profileId) {
    alert("This account has no profile link, so it cannot be changed.");
    return;
  }

  const reason = window.prompt("Reason to " + verb + " " + who + " (required):");
  if (reason === null) return;
  if (reason.trim().length < 3) {
    alert("A reason of at least 3 characters is required.");
    return;
  }

  const ok = window.confirm(
    "Please confirm: " + verb + " " + who + "?\n\nReason: " + reason.trim()
  );
  if (!ok) return;

  const { error } = await db.rpc("admin_set_suspension", {
    p_profile_id: profileId,
    p_suspend: suspend,
    p_reason: reason.trim()
  });

  if (error) {
    console.error("Suspension change failed", error);
    alert("Could not " + verb + ": " + error.message);
    return;
  }

  alert("Done. The change is recorded in the audit log.");
  refreshAdminData();
}

function makeActionButton(profileId, name, isSuspended) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-small " + (isSuspended ? "btn-ok" : "btn-danger");
  btn.textContent = isSuspended ? "Restore" : "Suspend";
  btn.addEventListener("click", function () {
    changeSuspension(profileId, name, !isSuspended);
  });
  return btn;
}

function refreshAdminData() {
  if (typeof loadCustomers === "function") loadCustomers();
  if (typeof loadPros === "function") loadPros();
  if (typeof loadAudit === "function") loadAudit();
}