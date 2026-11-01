const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

(async function () {
  const { data: sessionData } = await db.auth.getSession();

  if (!sessionData.session) {
    window.location.replace("index.html");
    return;
  }

  const { data: isAdmin, error } = await db.rpc("is_admin");

  if (error || isAdmin !== true) {
    await db.auth.signOut();
    window.location.replace("index.html");
    return;
  }

  document.body.style.visibility = "visible";

  document.getElementById("signOutBtn").addEventListener("click", async function () {
    await db.auth.signOut();
    window.location.replace("index.html");
  });
})();