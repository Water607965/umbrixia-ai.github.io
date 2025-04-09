let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com",
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD",
  redirect_uri: window.location.origin
};

async function initAuth() {
  try {
    auth0 = await createAuth0Client(config);

    // Handle redirect callback if returning from Auth0 login
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0.isAuthenticated();

    const loginArea = document.getElementById("login-area");

    if (isAuthenticated) {
      const user = await auth0.getUser();
      loginArea.innerHTML = `
        <p>👋 Welcome, ${user.name}</p>
        <button id="logout-btn">Log Out</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", logout);
    } else {
      loginArea.innerHTML = `
        <button id="login-btn">Log In / Sign Up</button>
      `;
      document.getElementById("login-btn").addEventListener("click", login);
    }

  } catch (err) {
    console.error("❌ Auth0 failed to initialize:", err);
    const btn = document.getElementById("login-btn");
    if (btn) {
      btn.innerText = "Auth Failed";
      btn.disabled = true;
    }
  }
}

function login() {
  if (!auth0) return console.error("❌ Auth0 not initialized yet");
  auth0.loginWithRedirect();
}

function logout() {
  auth0.logout({ returnTo: window.location.origin });
}

window.addEventListener("load", initAuth);
