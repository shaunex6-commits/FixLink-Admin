const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const message = document.getElementById("loginMessage");

async function signIn() {
  message.textContent = "";
  signInBtn.disabled = true;
  signInBtn.textContent = "Signing in...";

  const { error } = await db.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value
  });

  if (error) {
    message.textContent = "Sign in failed. Check your email and password.";
    reset();
    return;
  }

  // The database decides who is an admin, not the browser.
  const { data: isAdmin, error: adminError } = await db.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    await db.auth.signOut();
    message.textContent = "This account is not authorized for FixLink Admin Control.";
    reset();
    return;
  }

  window.location.href = "dashboard.html";
}

function reset() {
  signInBtn.disabled = false;
  signInBtn.textContent = "Sign In";
}

signInBtn.addEventListener("click", signIn);
passwordInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") signIn();
});