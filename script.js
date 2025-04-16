if (typeof checkTrial === "function") {
  checkTrial();
}



let usageCount = localStorage.getItem("umbrixiaTrialCount") || 0;
const MAX_FREE_TRIAL = 10;

const trialWarning = document.getElementById("trial-warning");
const userInput = document.getElementById("userInput");
const chat = document.getElementById("chat");
const button = document.querySelector("button");

function presetQuestion(text) {
    userInput.value = text;
    sendMessage();
}

async function sendMessage() {
    if (usageCount >= MAX_FREE_TRIAL) {
        trialWarning.innerHTML = "<div class='warning'>You have used your 10 free questions. Subscribe to unlock full access for $20/month or $100 lifetime.</div>";
        return;
    }

    let userMessage = userInput.value.trim();
    if (!userMessage) return;

    button.disabled = true;
    button.innerText = "Thinking...";

    chat.innerHTML += `<p class="message user"><strong>You:</strong> ${userMessage}</p>`;
    userInput.value = "";

    try {
        let response = await fetch("https://umbrixia-ai-github-io.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let result = await response.json();
        chat.innerHTML += `<p class="message bot"><strong>Bot:</strong> ${result.response}</p>`;

        usageCount++;
        localStorage.setItem("umbrixiaTrialCount", usageCount);

    } catch (error) {
        console.error("Error:", error);
        chat.innerHTML += `<p class="message bot"><strong>Bot:</strong> Failed to connect. Check if backend is running.</p>`;
    }

    button.disabled = false;
    button.innerText = "Send";
}

// Handle signup form
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const status = document.getElementById("signup-status");
    status.innerText = "Processing subscription...";

    // Simulated Stripe checkout session
    try {
        // Replace with actual Stripe Checkout integration
        setTimeout(() => {
            status.innerText = "Subscription successful! Welcome to Umbrixia.";
        }, 1500);
    } catch (error) {
        status.innerText = "Subscription failed. Please try again.";
    }
});

function loginHandler() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password)
    .then((userCredential) => {
      showWelcome(userCredential.user);
      document.getElementById("auth-status").innerText = `✅ Logged in as ${userCredential.user.email}`;
    })
    .catch((error) => {
      document.getElementById("auth-status").innerText = `❌ Login error: ${error.message}`;
    });
}

function signupHandler() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signup(email, password)
    .then((userCredential) => {
      document.getElementById("auth-status").innerText = `✅ Signed up as ${userCredential.user.email}`;
    })
    .catch((error) => {
      document.getElementById("auth-status").innerText = `❌ Signup error: ${error.message}`;
    });
}

function logoutHandler() {
  logout()
    .then(() => {
      document.getElementById("auth-status").innerText = `🚪 Logged out.`;
    })
    .catch((error) => {
      document.getElementById("auth-status").innerText = `❌ Logout error: ${error.message}`;
    });
}

function submitAnswers() {
  const q1 = document.getElementById('q1').value.toLowerCase();
  const q2 = document.getElementById('q2').value.toLowerCase();
  const q3 = document.getElementById('q3').value.toLowerCase();

  let incorrect = [];

  if (!q1.includes("danger")) incorrect.push("1");
  if (!q2.includes("central idea") && !q2.includes("main idea")) incorrect.push("2");
  if (!q3.includes("supports bravery")) incorrect.push("3");

  if (incorrect.length > 0) {
    document.getElementById("ai-message").innerText =
      `You got question(s) ${incorrect.join(", ")} wrong.\nClick below to see AI step-by-step guidance.`;
    document.getElementById("ai-response").classList.remove("hidden");
  } else {
    alert("✅ All correct! Great job.");
  }
}

function closeAI() {
  document.getElementById("ai-response").classList.add("hidden");
}

function signupHandler() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signup(email, password).then((userCredential) => {
    const user = userCredential.user;

    // Set the user's display name in Firebase
    return user.updateProfile({
      displayName: name
    }).then(() => {
      showWelcome(user);  // Show welcome message with name
    });

  }).catch((error) => {
    document.getElementById("auth-status").innerText = `❌ Signup error: ${error.message}`;
  });
}

// 🌙 Toggle Dark/Light Theme (Press T)
let isDark = true;
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  isDark = !isDark;
  localStorage.setItem("theme", isDark ? "dark" : "light");
}
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "t") toggleTheme();
});
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "light") toggleTheme();
});

// 🧠 Rotating Quotes in Header
const rotatingText = document.getElementById("rotating-text");
const quotes = [
  "Learning made intelligent.",
  "Build momentum, not just answers.",
  "Where AI meets clarity.",
  "You grow. We adapt.",
  "Daily habits. Lifelong success.",
  "Confidence through mastery.",
];
if (rotatingText) {
  let i = 0;
  setInterval(() => {
    rotatingText.textContent = quotes[i];
    i = (i + 1) % quotes.length;
  }, 3500);
}

// ✨ Fade-in on Scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
});
document.querySelectorAll(".fade-in, .feature-card, .stat-box").forEach(el => observer.observe(el));

// ⬆️ Scroll To Top Button
const topBtn = document.createElement("button");
topBtn.textContent = "⬆️ Top";
topBtn.className = "scroll-top glow";
topBtn.style.position = "fixed";
topBtn.style.bottom = "20px";
topBtn.style.right = "20px";
topBtn.style.display = "none";
topBtn.style.zIndex = "9999";
topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
document.body.appendChild(topBtn);
window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

// 📅 Real-Time Clock in Footer
const footer = document.querySelector("footer");
if (footer) {
  const clock = document.createElement("div");
  clock.id = "footer-clock";
  clock.style.textAlign = "center";
  clock.style.marginTop = "10px";
  clock.style.fontSize = "14px";
  clock.style.color = "#888";
  footer.appendChild(clock);
  setInterval(() => {
    clock.textContent = new Date().toLocaleString();
  }, 1000);
}

// 💬 Typing Animation for Bot Responses
function typeBotMessage(element, message, speed = 30) {
  element.innerHTML = "";
  let i = 0;
  function type() {
    if (i < message.length) {
      element.innerHTML += message.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// 🪄 Auto-fill from Local Storage
["email", "name", "password"].forEach(id => {
  const el = document.getElementById(id);
  if (el && localStorage.getItem(id)) el.value = localStorage.getItem(id);
  if (el) el.addEventListener("input", () => localStorage.setItem(id, el.value));
});

// 🎯 Focus Mode (Press F)
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "f") {
    document.body.classList.toggle("focus-mode");
    alert("🎯 Focus Mode " + (document.body.classList.contains("focus-mode") ? "enabled" : "disabled"));
  }
});


