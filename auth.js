let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com", // Replace with your actual Auth0 domain
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD", // Replace with your actual client ID
  redirect_uri: window.location.origin
};

async function initAuth() {
  if (typeof createAuth0Client !== "function") {
    console.error("❌ Auth0 SDK not loaded yet.");
    return;
  }

  auth0 = await createAuth0Client(config);

  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    const user = await auth0.getUser();
    document.getElementById("login-area").innerHTML = `
      <p>👋 Welcome, ${user.name}</p>
      <button onclick="logout()">Log Out</button>
    `;
  } else {
    document.getElementById("login-area").innerHTML = `
      <button onclick="login()">Log In / Sign Up</button>
    `;
  }
}

function login() {
  if (auth0) auth0.loginWithRedirect();
  else console.error("Auth0 not initialized");
}

function logout() {
  if (auth0) auth0.logout({ returnTo: window.location.origin });
  else console.error("Auth0 not initialized");
}

// Wait for the DOM AND the Auth0 SDK to be ready before calling init
window.addEventListener("load", async () => {
  if (typeof createAuth0Client === "function") {
    await initAuth();
  } else {
    const interval = setInterval(() => {
      if (typeof createAuth0Client === "function") {
        clearInterval(interval);
        initAuth();
      }
    }, 100);
  }
});
