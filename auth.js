import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDDcAp59mkTutfXgnRIBWpVww3jFyzOtIc",
  authDomain: "umbrixia-d804f.firebaseapp.com",
  projectId: "umbrixia-d804f",
  storageBucket: "umbrixia-d804f.firebasestorage.app",
  messagingSenderId: "532093768601",
  appId: "1:532093768601:web:4e94149269d88213edb908"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Signup
function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Login
function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Logout
function logout() {
  return signOut(auth);
}

window.signup = signup;
window.login = login;
window.logout = logout;

import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe('pk_live_YOUR_KEY');
async function subscribe() {
  const { sessionId } = await fetch('/api/create-checkout', {
    method:'POST', headers:{ 'Content-Type':'application/json' }
  }).then(r=>r.json());
  await stripe.redirectToCheckout({ sessionId });
}
