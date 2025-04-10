let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com",
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD",
  redirect_uri: window.location.origin
};

async function initAuth() {
  try {
    auth0 = await createAuth0Client(config);

    // Handle redirect callback if returning from Auth0
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0.isAuthenticated();
    const loginBtn = document.getElementById("login-btn");

    if (isAuthenticated) {
      const user = await auth0.getUser();
      document.getElementById("login-area").innerHTML = `
        <p>👋 Welcome, ${user.name}</p>
        <button onclick="logout()">Log Out</button>
      `;
    } else {
      loginBtn.disabled = false;
      loginBtn.textContent = "Log In / Sign Up";
      loginBtn.addEventListener("click", login);
    }
  } catch (e) {
    console.error("Auth0 failed to initialize:", e);
  }
}

function login() {
  auth0.loginWithRedirect();
}

function logout() {
  auth0.logout({ returnTo: window.location.origin });
}

initAuth();
