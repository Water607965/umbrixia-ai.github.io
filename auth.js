let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com",
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD",
  redirect_uri: window.location.origin
};

async function initAuth() {
  try {
    // Initialize Auth0 client
    auth0 = await createAuth0Client(config);

    // Handle redirect callback
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }

    // Check login state
    const isAuthenticated = await auth0.isAuthenticated();
    const loginBtn = document.getElementById("login-btn");

    if (isAuthenticated) {
      const user = await auth0.getUser();
      document.getElementById("login-area").innerHTML = `
        <p>👋 Welcome, ${user.name}</p>
        <button id="logout-btn">Log Out</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", logout);
    } else {
      loginBtn.innerText = "Log In / Sign Up";
      loginBtn.disabled = false;
      loginBtn.addEventListener("click", login);
    }
  } catch (err) {
    console.error("Auth0 failed to initialize:", err);
    const loginBtn = document.getElementById("login-btn");
    loginBtn.innerText = "Auth Failed";
    loginBtn.disabled = true;
  }
}

function login() {
  auth0.loginWithRedirect();
}

function logout() {
  auth0.logout({ returnTo: window.location.origin });
}

initAuth();
