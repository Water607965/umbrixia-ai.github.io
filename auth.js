console.log("✅ auth.js loaded successfully");

let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com",
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD",
  redirect_uri: window.location.origin
};

async function initAuth() {
  console.log("🔐 Initializing Auth0...");

  try {
    auth0 = await createAuth0Client(config);

    // Handle redirect back from Auth0 login
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      console.log("🔄 Handling redirect callback...");
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0.isAuthenticated();
    console.log("✅ Authenticated:", isAuthenticated);

    const loginArea = document.getElementById("login-area");

    if (isAuthenticated) {
      const user = await auth0.getUser();
      console.log("👤 User info:", user);

      loginArea.innerHTML = `
        <p>👋 Welcome, ${user.name}</p>
        <button onclick="logout()">Log Out</button>
      `;
    } else {
      loginArea.innerHTML = `
        <button onclick="login()">Log In / Sign Up</button>
      `;
    }
  } catch (err) {
    console.error("❌ Auth0 Initialization Error:", err);
  }
}

function login() {
  if (auth0) {
    console.log("➡️ Redirecting to Auth0 login...");
    auth0.loginWithRedirect();
  } else {
    console.error("❌ Auth0 not initialized");
  }
}

function logout() {
  if (auth0) {
    console.log("🚪 Logging out...");
    auth0.logout({ returnTo: window.location.origin });
  } else {
    console.error("❌ Auth0 not initialized");
  }
}

initAuth();
