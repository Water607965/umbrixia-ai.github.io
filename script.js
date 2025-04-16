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

// 🌟 Dashboard Reveal Animation
function revealDashboard() {
  const dash = document.querySelector(".dashboard");
  if (!dash) return;
  dash.classList.add("revealed");
  dash.style.opacity = 0;
  let opacity = 0;
  const interval = setInterval(() => {
    opacity += 0.02;
    dash.style.opacity = opacity;
    if (opacity >= 1) clearInterval(interval);
  }, 10);
}

// 🧪 Subscription Plan Reminder if trial is ending
function displayTrialCountdown() {
  const trialStart = parseInt(localStorage.getItem("trialStart"), 10);
  const now = Date.now();
  const diff = 7 * 24 * 60 * 60 * 1000 - (now - trialStart);
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const warn = document.createElement("div");

  if (diff < 0) return;

  warn.className = "trial-countdown glow-card";
  warn.innerHTML = `<p>🕒 You have <strong>${daysLeft} day(s)</strong> left in your trial. 
    <a href="#auth-section" style="color:#ff4d4d;">Subscribe now</a> to keep access!</p>`;
  document.body.insertBefore(warn, document.body.firstChild);
}

// 📌 Sticky Navbar Shadow on Scroll
const navbar = document.querySelector(".navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// 🪄 Add Hint Hover Effects on Buttons
document.querySelectorAll("button, .cta-btn").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.03)";
    btn.style.boxShadow = "0 0 20px rgba(255,0,60,0.5)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "none";
  });
});

// 🎨 Color Cycle on CTA Buttons (Apple-style)
function animateCTAColorShift() {
  const ctas = document.querySelectorAll(".cta-btn");
  const colors = ["#ff4d4d", "#ff6b81", "#e74c3c", "#ff3e55"];
  let i = 0;
  setInterval(() => {
    ctas.forEach(btn => {
      btn.style.backgroundColor = colors[i];
    });
    i = (i + 1) % colors.length;
  }, 1500);
}
animateCTAColorShift();

// ✍️ Delayed Paragraph Reveal for Each Section
document.querySelectorAll("section").forEach(section => {
  const text = section.querySelector("p");
  if (text) {
    text.style.opacity = 0;
    setTimeout(() => {
      text.style.transition = "opacity 1s ease-in";
      text.style.opacity = 1;
    }, 1000 + Math.random() * 2000);
  }
});

// 📖 Random Welcome Tips (AI Tutoring Helper)
const welcomeTips = [
  "👋 Tip: Start with a 3-question quiz to get personalized results.",
  "🧠 Tip: Ask me any SHSAT, ISEE, or SAT question.",
  "📈 Tip: Track your accuracy on your dashboard after 3 attempts.",
  "🔥 Tip: Enable Focus Mode with 'F' for a distraction-free experience.",
];
function showRandomWelcomeTip() {
  const el = document.createElement("div");
  el.className = "welcome-tip glow-card";
  el.textContent = welcomeTips[Math.floor(Math.random() * welcomeTips.length)];
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 10000);
}
window.addEventListener("load", () => setTimeout(showRandomWelcomeTip, 2500));

// 💡 Auto-focus input on login form when clicked
const emailInput = document.getElementById("email");
if (emailInput) {
  emailInput.addEventListener("focus", () => {
    emailInput.style.outline = "2px solid #ff4d4d";
    emailInput.style.boxShadow = "0 0 15px rgba(255, 77, 77, 0.5)";
  });
  emailInput.addEventListener("blur", () => {
    emailInput.style.outline = "none";
    emailInput.style.boxShadow = "none";
  });
}

// ⏳ Save Scroll Position (like Notion)
window.addEventListener("beforeunload", () => {
  localStorage.setItem("scrollPos", window.scrollY);
});
window.addEventListener("DOMContentLoaded", () => {
  const pos = localStorage.getItem("scrollPos");
  if (pos) window.scrollTo(0, parseInt(pos));
});

// ✅ Activate enhancements on load
document.addEventListener("DOMContentLoaded", () => {
  displayTrialCountdown();
  revealDashboard();
});

// 🧭 Smart Section Navigation Memory
const sectionIDs = Array.from(document.querySelectorAll("section")).map(s => s.id);
let lastSection = "";

function highlightActiveSection() {
  let current = "";
  sectionIDs.forEach(id => {
    const section = document.getElementById(id);
    if (section && window.scrollY >= section.offsetTop - 100) {
      current = id;
    }
  });

  if (current !== lastSection) {
    document.querySelectorAll(".navbar-menu li a").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
    lastSection = current;
  }
}
window.addEventListener("scroll", highlightActiveSection);

// 🎯 Click Ripple Animation
document.querySelectorAll("button, .cta-btn").forEach(el => {
  el.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    this.appendChild(ripple);

    const maxDim = Math.max(this.clientWidth, this.clientHeight);
    ripple.style.width = ripple.style.height = maxDim + "px";
    ripple.style.left = e.offsetX - maxDim / 2 + "px";
    ripple.style.top = e.offsetY - maxDim / 2 + "px";

    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

// 💬 Bot Typing Simulation
async function simulateTyping(message, containerId = "chat") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const msg = document.createElement("p");
  msg.className = "message bot typing";
  msg.innerHTML = "<strong>Bot:</strong> ";
  container.appendChild(msg);

  for (let i = 0; i < message.length; i++) {
    msg.innerHTML += message.charAt(i);
    await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
  }

  msg.classList.remove("typing");
}

// 🧠 AI Hint Injector (based on input)
const hints = {
  "theme": "Think about what the author is trying to communicate.",
  "inference": "Use context clues from the surrounding sentences.",
  "vocabulary": "Try replacing the word with similar ones.",
  "author": "Why did the author include this detail?",
  "tone": "What's the speaker's attitude?"
};

document.getElementById("userInput")?.addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  const match = Object.keys(hints).find(k => val.includes(k));
  const hintBox = document.querySelector(".input-hint");

  if (match && hintBox) {
    hintBox.textContent = `🧠 Hint: ${hints[match]}`;
    hintBox.style.opacity = 1;
  } else if (hintBox) {
    hintBox.style.opacity = 0;
  }
});

// 🎬 Smooth Page Transitions (Apple-style)
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 50,
        behavior: 'smooth'
      });
    }
  });
});

// 💾 Persistent Name Memory Across Sessions
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("displayName");
  if (savedName) {
    document.getElementById("auth-status").innerText = `👋 Welcome, ${savedName}`;
  }
});

function showWelcome(user) {
  const name = user.displayName || user.email || "user";
  document.getElementById("auth-status").innerText = `👋 Welcome, ${name}`;
  localStorage.setItem("displayName", name);
}

// 🔍 Search Filter Demo for Future Questions
function filterQuestions(keyword) {
  const examples = document.getElementById("example-buttons");
  if (!examples) return;

  Array.from(examples.children).forEach(btn => {
    if (!btn.textContent.toLowerCase().includes(keyword.toLowerCase())) {
      btn.style.display = "none";
    } else {
      btn.style.display = "inline-block";
    }
  });
}

// 🧪 Easter Egg AI Command
const secretCodes = {
  "notion": "You discovered Notion Mode!",
  "apple": "🍎 Apple polish enabled.",
  "ai": "🤖 You summoned Umbrixia's inner genius."
};
document.getElementById("userInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const val = e.target.value.trim().toLowerCase();
    if (secretCodes[val]) {
      simulateTyping(secretCodes[val]);
    }
  }
});

// 📱 Mobile UX Fix: Auto-scroll input into view on focus
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("focus", () => {
    setTimeout(() => input.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  });
});

