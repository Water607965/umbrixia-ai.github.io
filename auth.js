let auth0 = null;

const config = {
  domain: "dev-u1qim7tdcejrp6qi.us.auth0.com",
  client_id: "xBkyc88waMGEiBtKC4L1qvn7QqFCGmzD",
  redirect_uri: window.location.origin
};

async function initAuth() {
  auth0 = await createAuth0Client(config);

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
      <button onclick="logout()">Log Out</button>
    `;
  } else {
    loginArea.innerHTML = `
      <button onclick="login()">Log In / Sign Up</button>
    `;
  }
}

function login() {
  if (auth0) auth0.loginWithRedirect();
}

function logout() {
  if (auth0) auth0.logout({ returnTo: window.location.origin });
}
