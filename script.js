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
  shineButtons();
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
  shineButtons();
  logout()
    .then(() => {
      document.getElementById("auth-status").innerText = ""; // ✅ Clear the welcome text
      localStorage.removeItem("displayName"); // ✅ Clear saved name
      localStorage.removeItem("userEmail");   // Optional: clear userEmail too
      alert("🚪 Logged out.");
      document.getElementById("dashboard-prompt").style.display = "none";
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
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
});
document.querySelectorAll(".fade-in, .feature-card, .stat-box").forEach(el => revealObserver.observe(el));


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

// ⚡ Umbrixia Advanced JS Upgrade Part 1 of 2
// Apple-like transitions, dynamic UI behavior, typing effects, etc.

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const rotatingText = document.getElementById("rotating-text");
  const sectionTitles = document.querySelectorAll(".section-title");
  const ctaButtons = document.querySelectorAll(".cta-btn");

  // 🔽 001 - Shrink navbar on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("shrink");
    } else {
      navbar.classList.remove("shrink");
    }
  });

  // 🔽 002 - Typing effect on rotating text
  const headlines = [
    "Trusted by students.",
    "Powered by AI.",
    "Boost your scores.",
    "Made for SHSAT mastery."
  ];
  let i = 0;
  let j = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!rotatingText) return;
    rotatingText.innerText = headlines[i].substring(0, j);
    if (!isDeleting && j < headlines[i].length) {
      j++;
      setTimeout(typeEffect, 100);
    } else if (isDeleting && j > 0) {
      j--;
      setTimeout(typeEffect, 50);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) i = (i + 1) % headlines.length;
      setTimeout(typeEffect, 1000);
    }
  }
  typeEffect();

  // 🔽 003 - Fade-in on scroll
  const fadeInElements = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );
  fadeInElements.forEach(el => observer.observe(el));

  // 🔽 004 - Glow on CTA hover
  ctaButtons.forEach(button => {
    button.addEventListener("mouseenter", () => {
      button.classList.add("hover-glow");
    });
    button.addEventListener("mouseleave", () => {
      button.classList.remove("hover-glow");
    });
  });

  // 🔽 005 - Auto scroll reveal delay
  sectionTitles.forEach((title, index) => {
    title.style.transitionDelay = `${index * 0.3}s`;
  });

  // 🔽 006 - Local storage onboarding welcome
  if (!localStorage.getItem("seenWelcome")) {
    setTimeout(() => {
      alert("👋 Welcome to Umbrixia. Let’s get you started.");
      localStorage.setItem("seenWelcome", "true");
    }, 2000);
  }

  // 🔽 007 - Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "d" && e.altKey) {
      window.location.href = "/dashboard.html";
    }
  });

  // 🔽 008 - Time spent on page tracking
  let secondsSpent = 0;
  setInterval(() => {
    secondsSpent++;
    if (secondsSpent === 300) {
      console.log("⏱️ You’ve been using Umbrixia for 5 minutes.");
    }
  }, 1000);

  // 🔽 009 - Confetti after success
  window.showConfetti = function () {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  };

  // 🔽 010 - Easter egg: Tap logo 5x
  let logoClicks = 0;
  const logo = document.querySelector(".navbar-logo");
  if (logo) {
    logo.addEventListener("click", () => {
      logoClicks++;
      if (logoClicks >= 5) {
        alert("🎉 You discovered the Umbrixia easter egg!");
        showConfetti();
        logoClicks = 0;
      }
    });
  }

  // 🔽 011 - Scroll to top button logic
  const scrollBtn = document.createElement("button");
  scrollBtn.className = "scroll-to-top";
  scrollBtn.innerText = "⬆ Top";
  scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    scrollBtn.style.display = window.scrollY > 400 ? "block" : "none";
  });

  // 🔽 012 - Live Date Footer
  const footer = document.querySelector("footer");
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = `<p>&copy; ${year} Umbrixia.ai • Built for Students. Powered by OpenAI.</p>`;
  }

  // 🔽 013 - Dynamic Page Title
  const originalTitle = document.title;
  window.addEventListener("blur", () => {
    document.title = "👋 Come back to Umbrixia!";
  });
  window.addEventListener("focus", () => {
    document.title = originalTitle;
  });

  // 🔽 014 - Save last input session
  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.value = localStorage.getItem("lastQuery") || "";
    userInput.addEventListener("input", () => {
      localStorage.setItem("lastQuery", userInput.value);
    });
  }

  // 🔽 015 - Dynamic page tracking for analytics
  window.addEventListener("beforeunload", () => {
    const timeOnSite = Math.round(performance.now() / 1000);
    console.log(`🕐 Time on site: ${timeOnSite}s`);
  });

  // 🔽 016 - Auto-suggest for test names
  const testDropdown = document.getElementById("exam-select");
  if (testDropdown) {
    testDropdown.addEventListener("change", () => {
      localStorage.setItem("preferredTest", testDropdown.value);
    });

    const savedTest = localStorage.getItem("preferredTest");
    if (savedTest) testDropdown.value = savedTest;
  }

  // 🔽 017 - Highlight selected feature cards on hover
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("card-glow"));
    card.addEventListener("mouseleave", () => card.classList.remove("card-glow"));
  });
});

// 🧠 Animated rotating testimonials
const testimonials = [
  "“Umbrixia made test prep fun. Who knew AI could be this helpful?” – Maya, Grade 8",
  "“I scored 132 points higher thanks to Umbrixia’s smart explanations.” – Leo, Grade 7",
  "“It’s like having a personal tutor 24/7.” – Jamal, Grade 9"
];
let currentTestimonial = 0;

function rotateTestimonial() {
  const text = testimonials[currentTestimonial];
  const testimonialEl = document.getElementById("testimonial-text");
  if (testimonialEl) {
    testimonialEl.classList.remove("fade-in");
    void testimonialEl.offsetWidth; // trigger reflow
    testimonialEl.textContent = text;
    testimonialEl.classList.add("fade-in");
  }

  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  setTimeout(rotateTestimonial, 5000);
}

setTimeout(rotateTestimonial, 1000);

// 💡 Dynamic focus effect for input fields
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("focus", () => input.classList.add("focused"));
  input.addEventListener("blur", () => input.classList.remove("focused"));
});

// 🚀 Add bounce animation on important CTA buttons
document.querySelectorAll(".cta-btn").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.classList.add("bounce");
    setTimeout(() => btn.classList.remove("bounce"), 600);
  });
});

// 🧩 Easter Egg Konami Code unlock for hidden AI Game
const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIndex = 0;

document.addEventListener("keydown", function(e) {
  if (e.key === konamiSequence[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiSequence.length) {
      activateSecretAI();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function activateSecretAI() {
  alert("🤖 You’ve unlocked Umbrixia’s Secret AI Mode!");
  // You could redirect to a hidden page or show hidden UI
  const hiddenGame = document.createElement("div");
  hiddenGame.innerHTML = `<h2 class="glow">🧠 AI Challenge Mode Activated</h2><p>Coming soon.</p>`;
  hiddenGame.classList.add("secret-mode");
  document.body.appendChild(hiddenGame);
}

// 🕐 Time tracker for productivity stats
function startTimeTracking() {
  let startTime = Date.now();

  setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    document.getElementById("time-tracker")?.textContent = `Time Spent: ${minutes} min`;
  }, 60000);
}

document.addEventListener("DOMContentLoaded", startTimeTracking);

// 📊 Animate stat numbers on scroll
const statBoxes = document.querySelectorAll(".stat-box strong");
const statValues = [120, 10000, 95]; // Adjust to match actual data

function animateStats() {
  statBoxes.forEach((box, i) => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < statValues[i]) {
        count += Math.ceil(statValues[i] / 60);
        box.textContent = (i === 2 ? `${count}%` : `+${count}${i === 1 ? "+" : ""}`);
      } else {
        clearInterval(interval);
      }
    }, 20);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateStats();
    statsObserver.disconnect(); // Only animate once
  }
}, { threshold: 0.5 });

statsObserver.observe(document.querySelector(".stats-row"));

// 🌠 Add subtle glow on mouse move to feature cards
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// 🛸 Add floating dots to background (Apple-like parallax animation)
const dotCount = 30;
const background = document.createElement("div");
background.classList.add("floating-dots");

for (let i = 0; i < dotCount; i++) {
  const dot = document.createElement("span");
  dot.classList.add("dot");
  dot.style.left = `${Math.random() * 100}%`;
  dot.style.animationDuration = `${5 + Math.random() * 10}s`;
  background.appendChild(dot);
}

document.body.appendChild(background);

// 🧬 Smooth page load animation
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const firstName = (user.displayName || user.email).split(" ")[0];
    document.getElementById("dropdownName").innerText = firstName;
  }
});

function shineButtons() {
  const glowButtons = document.querySelectorAll(".glow, .google-btn");
  glowButtons.forEach(btn => {
    btn.classList.add("shine-effect");
    setTimeout(() => {
      btn.classList.remove("shine-effect");
    }, 1000); // duration should match the CSS animation
  });
}

// Enhance loginHandler to include shine
function loginHandler() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  shineButtons(); // <- added
  login(email, password);
}

function signupHandler() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  shineButtons(); // <- added
  signup(email, password);
}

function shineButtons() {
  const targets = [document.querySelector("button.glow"), document.querySelector(".google-btn")];

  targets.forEach(btn => {
    if (!btn) return;

    btn.classList.remove("shine-on-click"); // Reset in case it was applied before
    void btn.offsetWidth; // Force reflow (ensures animation replays)
    btn.classList.add("shine-on-click");
  });
}

function shineButtons() {
  const buttonsToShine = [
    document.querySelector('button.glow:nth-of-type(1)'), // Log In
    document.querySelector('button.glow:nth-of-type(2)'), // Sign Up
    document.querySelector('.google-btn')                 // Google
  ];

  buttonsToShine.forEach(btn => {
    if (!btn) return;
    btn.classList.remove('shine-on-click');
    void btn.offsetWidth; // Force reflow to retrigger animation
    btn.classList.add('shine-on-click');

    setTimeout(() => {
      btn.classList.remove('shine-on-click');
    }, 800); // clean up class after animation
  });
}

function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  menu.classList.toggle("hidden");
}

async function unifiedAuthHandler() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();
  ...
}


  try {
    // 1️⃣ Try to sign in (existing user)
    const loginResult = await auth.signInWithEmailAndPassword(email, password);
    const user = loginResult.user;

    if (!user.emailVerified) {
      await user.sendEmailVerification();
      alert("📩 We've sent you a verification link. Please check your inbox.");
    }

    showWelcome(user);
    document.getElementById("auth-status").innerText = `✅ Logged in as ${user.email}`;
    localStorage.setItem("trialStart", Date.now());
    localStorage.setItem("displayName", user.displayName || name);
    localStorage.setItem("userEmail", user.email);

  } catch (loginError) {
    if (loginError.code === "auth/user-not-found") {
      try {
        // 2️⃣ Create account if not found
        const signupResult = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = signupResult.user;

        await newUser.updateProfile({ displayName: name });
        await newUser.sendEmailVerification();

        showWelcome(newUser);
        document.getElementById("auth-status").innerText = `✅ Signed up as ${name}. Verification link sent.`;

        localStorage.setItem("trialStart", Date.now());
        localStorage.setItem("displayName", name);
        localStorage.setItem("userEmail", newUser.email);

        // Trigger native browser password save
        setTimeout(() => {
          const fakeForm = document.createElement("form");
          fakeForm.method = "post";
          fakeForm.style.display = "none";

          const emailInput = document.createElement("input");
          emailInput.name = "email";
          emailInput.value = email;

          const passInput = document.createElement("input");
          passInput.name = "password";
          passInput.value = password;
          passInput.type = "password";

          fakeForm.appendChild(emailInput);
          fakeForm.appendChild(passInput);
          document.body.appendChild(fakeForm);
          fakeForm.submit(); // triggers browser password manager

        }, 500);

      } catch (signupError) {
        alert(`❌ Signup error: ${signupError.message}`);
      }
    } else {
      alert(`❌ Login error: ${loginError.message}`);
    }
  }
}

// script.js

document.addEventListener("DOMContentLoaded", () => {
  // 1) SMOOTH SCROLL FOR IN‑PAGE LINKS
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 2) HERO CONTENT ENTRANCE
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.classList.add("preload");
    // Allow CSS to pick up initial state, then trigger
    requestAnimationFrame(() => {
      heroContent.classList.add("in-view");
    });
  }

  // 3) ROTATING HEADLINE TEXT
  const phrases = [
    "Trusted by students.",
    "Powered by AI.",
    "Personalized paths.",
    "Zero distractions."
  ];
  let idx = 0;
  const rotatingEl = document.getElementById("rotating-text");
  if (rotatingEl) {
    setInterval(() => {
      rotatingEl.classList.remove("fade-in");
      void rotatingEl.offsetWidth;
      rotatingEl.textContent = phrases[idx = (idx + 1) % phrases.length];
      rotatingEl.classList.add("fade-in");
    }, 4000);
  }

  // 4) FADE‑IN + SLIDE‑UP ON SCROLL
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".fade-in, .slide-up, .zoom-in").forEach(el => {
    el.classList.add("preload");
    io.observe(el);
  });

  // 5) BUTTON RIPPLE EFFECT
  document.querySelectorAll(".btn, button").forEach(btn => {
    btn.addEventListener("click", function(e) {
      const circle = document.createElement("span");
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - this.offsetLeft - radius}px`;
      circle.style.top = `${e.clientY - this.offsetTop - radius}px`;
      circle.classList.add("ripple");
      const ripple = this.getElementsByClassName("ripple")[0];
      if (ripple) ripple.remove();
      this.appendChild(circle);
    });
  });

  // 6) FORM FIELD FOCUS UNDERSCORE
  document.querySelectorAll("input, textarea").forEach(input => {
    const wrapper = input.closest(".form-group") || input.parentElement;
    input.addEventListener("focus",  () => wrapper.classList.add("focused"));
    input.addEventListener("blur",   () => wrapper.classList.remove("focused"));
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeEls.forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  const fadeElems = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  fadeElems.forEach(elem => observer.observe(elem));
});

// Fade in on scroll animation
const fadeElements = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

fadeElements.forEach(el => observer.observe(el));

document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll(".fade-in");

  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });
});

// Animate .fade-in elements when they scroll into view
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.2,
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia Enhanced UI & Architecture Module
// Insert everything below at the very end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── State Management ────────────────────────────────────────────────────────
  const State = {
    theme: localStorage.getItem('theme') || 'dark',
    user: null,
    currentExam: 'shsat',
    trialStart: Number(localStorage.getItem('trialStart')) || null,
    tipsShown: false
  };

  // ─── Utilities ────────────────────────────────────────────────────────────────
  function qs(selector, ctx = document) {
    return ctx.querySelector(selector);
  }
  function qsa(selector, ctx = document) {
    return Array.from(ctx.querySelectorAll(selector));
  }
  function on(event, selector, handler) {
    document.addEventListener(event, e => {
      if (e.target.matches(selector)) handler(e);
    });
  }
  function throttle(fn, wait = 200) {
    let time = Date.now();
    return function(...args) {
      if ((time + wait - Date.now()) < 0) {
        fn.apply(this, args);
        time = Date.now();
      }
    };
  }
  function create(el, props = {}, parent = document.body) {
    const node = document.createElement(el);
    Object.entries(props).forEach(([k, v]) => node[k] = v);
    parent.appendChild(node);
    return node;
  }

  // ─── Theme Initialization ────────────────────────────────────────────────────
  function applyTheme() {
    document.body.dataset.theme = State.theme;
    localStorage.setItem('theme', State.theme);
  }
  function toggleTheme() {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    showToast(`Switched to ${State.theme.charAt(0).toUpperCase() + State.theme.slice(1)} Mode`);
  }
  on('keydown', e => e.key === 'T' && toggleTheme());

  // ─── Toast Notifications ─────────────────────────────────────────────────────
  const toasts = create('div', { className: 'toast-container' });
  function showToast(msg, duration = 3000) {
    const t = create('div', { className: 'toast fade-in', innerText: msg }, toasts);
    setTimeout(() => t.classList.add('visible'), 50);
    setTimeout(() => t.classList.remove('visible'), duration);
    setTimeout(() => t.remove(), duration + 500);
  }
  applyTheme();

  // ─── Hero Section Parallax & Reveal ──────────────────────────────────────────
  const hero = qs('.hero-content');
  if (hero) {
    window.addEventListener('scroll', throttle(() => {
      const offset = window.scrollY / 3;
      hero.style.transform = `translateY(${offset}px)`;
    }, 16));
  }

  // ─── Rotating Headline (Notion‑style) ─────────────────────────────────────────
  const rotatingText = qs('#rotating-text');
  const rotatingPhrases = [
    'Trusted by students. Powered by AI.',
    'Adapt. Learn. Conquer.',
    'Your edge in exam prep.',
    'Focus. Master. Excel.',
    'Confidence = Clarity.'
  ];
  let rIdx = 0;
  if (rotatingText) {
    setInterval(() => {
      rotatingText.classList.add('fade-in');
      rotatingText.textContent = rotatingPhrases[rIdx];
      setTimeout(() => rotatingText.classList.remove('fade-in'), 900);
      rIdx = (rIdx + 1) % rotatingPhrases.length;
    }, 4000);
  }

  // ─── Intersection Animations ─────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('fade-in');
    });
  }, { threshold: 0.2 });
  qsa('.feature-card, .stat-box, .mastery-card').forEach(el => io.observe(el));

  // ─── Exam Switcher with Micro‑Animation ──────────────────────────────────────
  function switchExamSection() {
    const val = qs('#exam-select').value;
    ['shsat','isee','sat'].forEach(id => {
      const el = qs(`#${id}`);
      if (el) {
        el.style.display = id === val ? 'block' : 'none';
        if (id === val) {
          el.classList.add('pop-in');
          setTimeout(() => el.classList.remove('pop-in'), 500);
        }
      }
    });
    State.currentExam = val;
  }
  qs('#exam-select')?.addEventListener('change', switchExamSection);
  switchExamSection();

  // ─── Confetti on Subscription CTA ─────────────────────────────────────────────
  function launchConfetti() {
    const colors = ['#ff4d4d', '#ff6b81', '#e74c3c'];
    const duration = 1500;
    const end = Date.now() + duration;
    (function frame() {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;
      const particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${Math.random() * 100}%`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
      requestAnimationFrame(frame);
    })();
  }
  on('click', '.cta-btn.red', () => {
    launchConfetti();
    showToast('Enjoy your free demo!');
  });

  // ─── Trial Countdown Reminder ─────────────────────────────────────────────────
  function showTrialReminder() {
    if (!State.trialStart) return;
    const msLeft = 7*24*60*60*1000 - (Date.now() - State.trialStart);
    if (msLeft < 2*24*60*60*1000 && !State.tipsShown) {
      State.tipsShown = true;
      showToast('🕒 Only 2 days left in your trial. Subscribe now!', 5000);
    }
  }
  setInterval(showTrialReminder, 6*60*60*1000); // every 6h

  // ─── Smooth Scroll for Navbar Links ───────────────────────────────────────────
  qsa('.navbar-links a, .hero-buttons a, .vision-call a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tgt = document.querySelector(a.getAttribute('href'));
      tgt?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ─── Profile Dropdown Toggle ──────────────────────────────────────────────────
  function toggleUserMenu() {
    qs('#userDropdownPanel')?.classList.toggle('hidden');
  }
  window.toggleUserMenu = toggleUserMenu;

  // ─── Initialize on DOM Ready ──────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    showToast('Welcome to Umbrixia!', 2000);
  });

  // ─── Export for Testing ───────────────────────────────────────────────────────
  window.UmbrixiaUI = {
    toggleTheme,
    switchExamSection,
    launchConfetti,
    showToast
  };
})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Additional Interactive Modules (Part 2)
// Insert everything below at the very end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Global Error Handler ────────────────────────────────────────────────────
  window.addEventListener('error', e => {
    console.error('Umbrixia Error:', e.message, e);
    if (window.UmbrixiaUI?.showToast) {
      UmbrixiaUI.showToast('⚠️ Something went wrong. Please refresh.', 5000);
    }
  });

  // ─── Chat Typing Indicator Monkey-Patch ───────────────────────────────────────
  if (typeof window.sendMessage === 'function') {
    const _send = window.sendMessage;
    window.sendMessage = async function patchedSend() {
      showTypingIndicator();
      await _send.apply(this, arguments);
      hideTypingIndicator();
    };
  }
  function showTypingIndicator() {
    const chat = document.getElementById('chat');
    if (!chat) return;
    let indicator = document.getElementById('typing-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'typing-indicator';
      indicator.className = 'message bot typing';
      indicator.innerHTML = '<strong>Bot:</strong> <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
      chat.appendChild(indicator);
    }
  }
  function hideTypingIndicator() {
    const ind = document.getElementById('typing-indicator');
    ind?.remove();
  }

  // ─── Subscription Modal ───────────────────────────────────────────────────────
  const subModalHTML = `
    <div id="subModal" class="modal hidden" role="dialog" aria-modal="true">
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h2>Subscribe to Umbrixia</h2>
        <p>Unlock unlimited access to personalized AI tutoring.</p>
        <button id="modal-subscribe-btn" class="btn btn-primary">Subscribe Now</button>
      </div>
      <div class="modal-backdrop"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', subModalHTML);
  const subModal = document.getElementById('subModal');
  on('click', '[data-subscribe]', () => openSubscribeModal());
  on('click', '.modal-close, .modal-backdrop', () => closeSubscribeModal());
  function openSubscribeModal() {
    subModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    trapFocus(subModal);
  }
  function closeSubscribeModal() {
    subModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea');
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    modal.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        closeSubscribeModal();
      }
    });
    first.focus();
  }

  // ─── Testimonials Carousel ────────────────────────────────────────────────────
  const testimonials = [
    { quote: "Umbrixia boosted my SHSAT score by 25 points in 2 weeks!", author: "— Jordan L." },
    { quote: "I love the adaptive AI feedback. It knows exactly what I struggle with.", author: "— Maya S." },
    { quote: "Sleek, intuitive, and it just works. Like magic.", author: "— Aaron P." }
  ];
  let testIdx = 0;
  function rotateTestimonials() {
    const box = qs('.testimonial-banner');
    if (!box) return;
    box.classList.add('fade-in');
    box.innerHTML = `<p>${testimonials[testIdx].quote}</p><span>${testimonials[testIdx].author}</span>`;
    setTimeout(() => box.classList.remove('fade-in'), 800);
    testIdx = (testIdx + 1) % testimonials.length;
  }
  setInterval(rotateTestimonials, 7000);
  rotateTestimonials();

  // ─── FAQ Accordion ────────────────────────────────────────────────────────────
  qsa('.faq-item .faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const parent = q.closest('.faq-item');
      parent?.classList.toggle('open');
    });
  });

  // ─── Idle Timeout Reminder ─────────────────────────────────────────────────────
  let idleTimer;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      showToast('👋 Still there? Ask me anything about your test prep!', 4000);
    }, 60_000); // 60s
  }
  ['mousemove','keydown','click','touchstart'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer);
  });
  resetIdleTimer();

  // ─── Lazy Load Images ─────────────────────────────────────────────────────────
  const lazyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.src) {
        e.target.src = e.target.dataset.src;
        e.target.removeAttribute('data-src');
        obs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px 200px 0px' });
  qsa('img[data-src]').forEach(img => lazyObserver.observe(img));

  // ─── Animate Growth Curve on Scroll ───────────────────────────────────────────
  const curve = qs('.why-graph-wrapper img');
  if (curve) {
    const graphObs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          curve.classList.add('pop-in');
          o.unobserve(curve);
        }
      });
    }, { threshold: 0.3 });
    graphObs.observe(curve);
  }

  // ─── Skeleton Loader Pulse ─────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.innerHTML = `
    .skeleton-pulse {
      animation: pulse 1.5s infinite ease-in-out;
      background: linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a);
      background-size: 200% 100%;
    }
    @keyframes pulse {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }`;
  document.head.appendChild(style);
  qsa('.skeleton').forEach(el => el.classList.add('skeleton-pulse'));

  // ─── Like Button Micro‑Animation ──────────────────────────────────────────────
  on('click', '.like-btn', e => {
    const btn = e.target;
    btn.classList.toggle('liked');
    btn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.4)' },
      { transform: 'scale(1)' }
    ], { duration: 400, easing: 'ease-out' });
  });

  // ─── Analytics Placeholder ────────────────────────────────────────────────────
  function track(eventName, data = {}) {
    // TODO: wire to real analytics
    console.log('🔍 Track:', eventName, data);
  }
  on('click', '[data-track]', e => {
    const ev = e.target.dataset.track;
    track(ev);
  });

  // ─── Auto–Scroll Chat to Bottom ────────────────────────────────────────────────
  const chatEl = qs('#chat');
  function scrollChat() {
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  }
  new MutationObserver(scrollChat).observe(chatEl, { childList: true });

  // ─── Export New APIs ──────────────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    openSubscribeModal,
    closeSubscribeModal,
    rotateTestimonials,
    resetIdleTimer,
    track
  });

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Additional Interactive Modules (Part 3)
// Insert everything below at the very end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Simple Utilities ─────────────────────────────────────────────────────────
  const qs   = sel => document.querySelector(sel);
  const qsa  = sel => Array.from(document.querySelectorAll(sel));
  const on   = (evt, sel, fn) => document.addEventListener(evt, e => e.target.matches(sel) && fn(e));
  const debounce = (fn, wait=300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  // ─── Accessibility: Skip to Content Link ──────────────────────────────────────
  (function injectSkipLink() {
    const link = document.createElement('a');
    link.href = '#features';
    link.innerText = 'Skip to content';
    link.className = 'skip-link';
    link.style.cssText = `
      position: absolute; top: -40px; left: 0;
      background: #4f46e5; color: #fff;
      padding: 8px 12px; z-index: 10000;
      transition: top 0.3s;
    `;
    link.addEventListener('focus', () => link.style.top = '0');
    link.addEventListener('blur', () => link.style.top = '-40px');
    document.body.prepend(link);
  })();

  // ─── High-Contrast Mode Toggle (Press C) ───────────────────────────────────────
  let highContrast = false;
  function toggleContrast() {
    highContrast = !highContrast;
    document.body.classList.toggle('high-contrast', highContrast);
    showToast(`High Contrast ${highContrast ? 'On' : 'Off'}`);
  }
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'c') toggleContrast();
  });

  // ─── Command Palette (Press Cmd+K) ─────────────────────────────────────────────
  const paletteHTML = `
    <div id="cmdPalette" class="modal hidden" role="dialog" aria-modal="true">
      <div class="modal-content palette">
        <input id="cmdInput" placeholder="Type a command (e.g., 'subscribe')" autofocus />
        <ul id="cmdList"></ul>
      </div>
      <div class="modal-backdrop"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', paletteHTML);
  const palette = qs('#cmdPalette');
  const cmdInput = qs('#cmdInput');
  const cmdList  = qs('#cmdList');
  const commands = {
    subscribe:   () => UmbrixiaUI.openSubscribeModal(),
    tour:        () => startTour(),
    toggletheme: () => UmbrixiaUI.toggleTheme(),
    focuschat:   () => qs('#userInput')?.focus(),
    help:        () => showToast('Try commands: subscribe, tour, toggletheme, focuschat')
  };

  function openPalette() {
    palette.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updateCmdList('');
    cmdInput.value = '';
    cmdInput.focus();
  }
  function closePalette() {
    palette.classList.add('hidden');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && !palette.classList.contains('hidden')) {
      closePalette();
    }
  });
  on('click', '.palette + .modal-backdrop', closePalette);
  cmdInput.addEventListener('input', () => updateCmdList(cmdInput.value.trim().toLowerCase()));
  function updateCmdList(query) {
    cmdList.innerHTML = '';
    Object.keys(commands)
      .filter(k => k.startsWith(query))
      .forEach(k => {
        const li = document.createElement('li');
        li.className = 'cmd-item';
        li.innerText = k;
        li.addEventListener('click', () => {
          commands[k]();
          closePalette();
        });
        cmdList.append(li);
      });
  }

  // ─── Onboarding Guided Tour ───────────────────────────────────────────────────
  const tourSteps = [
    { sel: '.modern-navbar', text: 'This is the navigation bar. Use it to move around.' },
    { sel: '.hero', text: 'Our hero section. Get started quickly here.' },
    { sel: '#chatbox', text: 'Chat with our AI tutor for instant help.' },
    { sel: '#features', text: 'Explore key features of Umbrixia.' },
    { sel: '.vision-call', text: 'Ready? Click here for a free demo!' }
  ];
  function startTour() {
    let i = 0;
    const overlay = document.createElement('div');
    overlay.id = 'tourOverlay';
    overlay.className = 'tour-overlay';
    document.body.appendChild(overlay);

    function showStep() {
      const { sel, text } = tourSteps[i];
      const target = qs(sel);
      if (!target) return endTour();
      const rect = target.getBoundingClientRect();
      overlay.innerHTML = `<div class="tour-tooltip" style="
        top:${rect.bottom + 10}px; left:${rect.left}px;
      ">${text}<button id="tourNext">${i < tourSteps.length-1 ? 'Next' : 'Done'}</button></div>`;
      qs('#tourNext').onclick = () => {
        i++;
        if (i < tourSteps.length) showStep();
        else endTour();
      };
    }
    function endTour() {
      overlay.remove();
      showToast('Tour complete! Enjoy Umbrixia.');
      localStorage.setItem('onboardDone', 'true');
    }
    showStep();
  }
  if (!localStorage.getItem('onboardDone')) {
    setTimeout(startTour, 1000);
  }

  // ─── Cookie Consent Banner ────────────────────────────────────────────────────
  if (!localStorage.getItem('cookiesAccepted')) {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <p>We use cookies to improve your experience. <button id="acceptCookies">Accept</button></p>
    `;
    document.body.append(banner);
    qs('#acceptCookies').addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      banner.remove();
      showToast('Cookies accepted. Thank you!');
    });
  }

  // ─── Particle Background Canvas ────────────────────────────────────────────────
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bgParticles';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    particles = Array.from({length: 80}, () => ({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3,
      size: Math.random()*2+1
    }));
    function animate() {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>w) p.vx*=-1;
        if (p.y<0||p.y>h) p.vy*=-1;
        ctx.fillStyle = 'rgba(255,77,77,0.4)';
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,2*Math.PI);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }
  initParticles();

  // ─── Chatboard Quick Focus (Press "/") ─────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== cmdInput) {
      e.preventDefault();
      qs('#userInput')?.focus();
    }
  });

  // ─── Localization Snippets ────────────────────────────────────────────────────
  const i18n = {
    en: { welcome: 'Welcome to Umbrixia!' },
    es: { welcome: '¡Bienvenido a Umbrixia!' }
  };
  let locale = navigator.language.startsWith('es') ? 'es' : 'en';
  showToast(i18n[locale].welcome);

  // ─── Export Additional APIs ───────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    openPalette,
    closePalette,
    toggleContrast,
    startTour,
    initParticles
  });

})();


})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Voice, Transcript & Clipboard Utilities (Part 4)
// Append this to the end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Voice Recognition (Press V) ─────────────────────────────────────────────
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    on('keydown', e => {
      if (e.key.toLowerCase() === 'v') {
        startVoiceInput();
      }
    });
  }

  function startVoiceInput() {
    if (!recognition) return showToast('🎙️ Voice not supported');
    showToast('🎙️ Listening...', 2000);
    recognition.start();
    recognition.onresult = evt => {
      const transcript = evt.results[0][0].transcript;
      const input = document.getElementById('userInput');
      if (input) {
        input.value = transcript;
        sendMessage();
      }
    };
    recognition.onerror = () => showToast('❌ Voice recognition error');
  }

  // ─── Voice Synthesis (Bot Responses) ─────────────────────────────────────────
  const synth = window.speechSynthesis;
  function speak(text) {
    if (!synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    synth.speak(utter);
  }
  // Patch bot message rendering to speak aloud
  const origSendMessage = window.sendMessage;
  window.sendMessage = async function(...args) {
    await origSendMessage.apply(this, args);
    // after message appears:
    const msgs = document.querySelectorAll('.message.bot');
    if (msgs.length) {
      const last = msgs[msgs.length - 1];
      const content = last.textContent.replace(/^Bot:\s*/, '');
      speak(content);
    }
  };

  // ─── Download Chat Transcript ────────────────────────────────────────────────
  function downloadTranscript() {
    const chat = document.getElementById('chat');
    if (!chat) return;
    const lines = Array.from(chat.querySelectorAll('.message')).map(p => p.textContent);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umbrixia-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Transcript downloaded');
  }
  // bind to Ctrl+S
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      downloadTranscript();
    }
  });

  // ─── Copy Last Bot Response ────────────────────────────────────────────────────
  function copyLastResponse() {
    const msgs = document.querySelectorAll('.message.bot');
    if (!msgs.length) return showToast('No response to copy');
    const text = msgs[msgs.length - 1].textContent.replace(/^Bot:\s*/, '');
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Copied response'))
      .catch(() => showToast('❌ Copy failed'));
  }
  // bind to Ctrl+C when focus in chat
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && document.activeElement.id === 'chat') {
      e.preventDefault();
      copyLastResponse();
    }
  });

  // ─── Clean Exit on Page Unload ────────────────────────────────────────────────
  window.addEventListener('beforeunload', e => {
    // store scroll position and input draft
    localStorage.setItem('chatScroll', document.getElementById('chat')?.scrollTop || 0);
    localStorage.setItem('inputDraft', document.getElementById('userInput')?.value || '');
  });
  window.addEventListener('DOMContentLoaded', () => {
    const scroll = parseInt(localStorage.getItem('chatScroll'), 10);
    if (!isNaN(scroll)) document.getElementById('chat').scrollTop = scroll;
    const draft = localStorage.getItem('inputDraft');
    if (draft) document.getElementById('userInput').value = draft;
  });

  // ─── Export Utilities ─────────────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    startVoiceInput,
    downloadTranscript,
    copyLastResponse
  });
})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Autosuggest, Performance & Notification Module (Part 5)
// Append this to the end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Simple Selectors & Events ────────────────────────────────────────────────
  const qs   = sel => document.querySelector(sel);
  const qsa  = sel => Array.from(document.querySelectorAll(sel));
  const on   = (evt, sel, fn) => document.addEventListener(evt, e => e.target.matches(sel) && fn(e));

  // ─── Chat History Autosuggest ────────────────────────────────────────────────
  const HISTORY_KEY = 'chatHistory';
  const MAX_HISTORY = 20;
  const inputEl     = qs('#userInput');

  function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  }
  function saveHistory(msg) {
    if (!msg) return;
    const h = getHistory();
    h.unshift(msg);
    while (h.length > MAX_HISTORY) h.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    renderHistory();
  }
  function renderHistory() {
    let list = qs('#historyList');
    if (!list) {
      list = document.createElement('datalist');
      list.id = 'historyList';
      document.body.appendChild(list);
      if (inputEl) inputEl.setAttribute('list', 'historyList');
    }
    list.innerHTML = '';
    getHistory().forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      list.appendChild(opt);
    });
  }

  // hook into sendMessage to record user inputs
  const origSend = window.sendMessage;
  window.sendMessage = async function(...args) {
    const text = inputEl?.value.trim();
    saveHistory(text);
    await origSend.apply(this, args);
  };
  renderHistory();

  // recall last message with ArrowUp
  on('keydown', '#userInput', e => {
    if (e.key === 'ArrowUp') {
      const h = getHistory();
      if (h.length) inputEl.value = h[0];
    }
  });

  // ─── Performance Monitor Overlay ──────────────────────────────────────────────
  const perf = { frames: 0, lastTime: performance.now(), fps: 0, ping: null };
  const perfOverlay = document.createElement('div');
  perfOverlay.id = 'perfMonitor';
  Object.assign(perfOverlay.style, {
    position: 'fixed', bottom: '10px', right: '10px',
    background: 'rgba(0,0,0,0.6)', color: '#fff',
    padding: '6px 10px', borderRadius: '8px',
    fontSize: '12px', fontFamily: 'monospace', zIndex: '9999'
  });
  document.body.appendChild(perfOverlay);

  function updatePerf() {
    const now = performance.now();
    perf.frames++;
    if (now - perf.lastTime >= 1000) {
      perf.fps = perf.frames;
      perf.frames = 0;
      perf.lastTime = now;
      perfOverlay.textContent = `FPS: ${perf.fps} | Ping: ${perf.ping ?? '–'}ms`;
    }
    requestAnimationFrame(updatePerf);
  }
  updatePerf();

  // ping server every 30s
  async function pingServer() {
    const start = Date.now();
    try {
      await fetch('/ping', { cache: 'no-store' });
      perf.ping = Date.now() - start;
    } catch {
      perf.ping = null;
    }
  }
  pingServer();
  setInterval(pingServer, 30000);

  // ─── Title Badge & Desktop Notifications ───────────────────────────────────────
  let unread = 0;
  const origReceive = window.sendMessage; // after patch above, origReceive no longer direct; use MutationObserver instead

  const chatEl = qs('#chat');
  const titleBase = document.title;

  // desktop notify
  function notify(text) {
    if (Notification.permission === 'granted') {
      new Notification('Umbrixia says:', { body: text });
    }
  }

  // track new bot messages
  new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.matches('.message.bot')) {
          const msg = node.textContent.replace(/^Bot:\s*/, '');
          if (!document.hasFocus()) {
            unread++;
            document.title = `(${unread}) ${titleBase}`;
            notify(msg);
          }
        }
      });
    });
  }).observe(chatEl, { childList: true });

  window.addEventListener('focus', () => {
    unread = 0;
    document.title = titleBase;
  });

  // request notification permission once
  if (Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // ─── Heartbeat Keep‑Alive ─────────────────────────────────────────────────────
  setInterval(() => fetch('/heartbeat', { cache: 'no-store' }), 5 * 60 * 1000);

  // ─── Export New Features ──────────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    startVoiceInput: window.startVoiceInput,
    downloadTranscript: window.downloadTranscript,
    copyLastResponse: window.copyLastResponse
  });
})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Puzzle Progress & Graph Module (Part 6)
// Append this to the end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Simple Helpers ──────────────────────────────────────────────────────────
  const qs     = selector => document.querySelector(selector);
  const qsa    = selector => Array.from(document.querySelectorAll(selector));
  const create = (tag, props = {}, parent = document.body) => {
    const el = document.createElement(tag);
    Object.assign(el, props);
    parent.appendChild(el);
    return el;
  };

  // ─── Load / Save State ───────────────────────────────────────────────────────
  let puzzleProgress = JSON.parse(localStorage.getItem('puzzleProgress') || '{}');
  let puzzleHistory  = JSON.parse(localStorage.getItem('puzzleHistory')  || '[]');
  const exams = ['shsat', 'isee', 'sat'];

  // ─── Inject Required CSS ─────────────────────────────────────────────────────
  function injectPuzzleStyles() {
    const css = `
      .puzzle-progress-container {
        margin: 16px 0;
        font-family: 'Inter', sans-serif;
      }
      .puzzle-progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #ccc;
        margin-bottom: 6px;
      }
      .puzzle-progress-bar {
        position: relative;
        background: #222;
        border-radius: 8px;
        height: 10px;
        overflow: hidden;
      }
      .puzzle-progress-fill {
        background: #ff4d4d;
        height: 100%;
        width: 0;
        transition: width 0.5s ease;
      }
      .puzzle-progress-container .btn-outline.small {
        margin-top: 8px;
        padding: 6px 12px;
        font-size: 0.85rem;
      }
      #puzzleProgressGraph {
        margin: 40px 0;
        text-align: center;
      }
      #puzzleProgressGraph h2 {
        color: #fff;
        margin-bottom: 12px;
        font-size: 1.5rem;
      }
      #puzzleGraphCanvas {
        width: 100%;
        height: 200px;
        background: #111;
        border: 1px solid #333;
        border-radius: 8px;
      }
    `;
    const style = create('style', { textContent: css }, document.head);
  }

  // ─── Initialize Puzzle UI ────────────────────────────────────────────────────
  function initPuzzles() {
    exams.forEach(exam => {
      const section   = qs(`#${exam}`);
      if (!section) return;
      const puzzleEl  = section.querySelector('.puzzle-section');
      if (!puzzleEl) return;

      // mark for lookup
      puzzleEl.dataset.exam = exam;

      // build progress container
      const container = create('div', { className: 'puzzle-progress-container' }, puzzleEl);
      container.innerHTML = `
        <div class="puzzle-progress-label">
          <span>Progress</span>
          <span class="puzzle-progress-percent">0%</span>
        </div>
        <div class="puzzle-progress-bar">
          <div class="puzzle-progress-fill"></div>
        </div>
      `;

      // demo “Solve +20%” button
      const btn = create('button', {
        className: 'btn btn-outline small',
        innerText: 'Solve +20%'
      }, container);
      btn.addEventListener('click', () => updatePuzzleProgress(exam, 20));

      // render initial state
      renderPuzzleProgress(exam);
    });
  }

  // ─── Render Single Puzzle Progress ───────────────────────────────────────────
  function renderPuzzleProgress(exam) {
    const percent = puzzleProgress[exam] || 0;
    const selector = `.puzzle-section[data-exam="${exam}"]`;
    const container = qs(selector + ' .puzzle-progress-container');
    if (!container) return;
    qs('.puzzle-progress-fill', container).style.width = percent + '%';
    qs('.puzzle-progress-percent', container).innerText = percent + '%';
  }

  // ─── Update Progress & History ───────────────────────────────────────────────
  function updatePuzzleProgress(exam, delta) {
    puzzleProgress[exam] = Math.min(100, (puzzleProgress[exam] || 0) + delta);
    localStorage.setItem('puzzleProgress', JSON.stringify(puzzleProgress));

    // record timestamped history entry
    puzzleHistory.push({
      time: Date.now(),
      exam,
      progress: puzzleProgress[exam]
    });
    localStorage.setItem('puzzleHistory', JSON.stringify(puzzleHistory));

    renderPuzzleProgress(exam);
    renderPuzzleGraph();
  }

  // ─── Draw Progress-Over-Time Graph ────────────────────────────────────────────
  function renderPuzzleGraph() {
    let wrapper = qs('#puzzleProgressGraph');
    if (!wrapper) {
      // place after dashboard
      const dash = qs('.dashboard') || qs('body');
      wrapper = create('section', { id: 'puzzleProgressGraph' }, dash);
      wrapper.innerHTML = `<h2>Puzzle Progress Over Time</h2><canvas id="puzzleGraphCanvas"></canvas>`;
    }
    const canvas = qs('#puzzleGraphCanvas');
    if (!canvas) return;

    // size for high-DPI
    const w = canvas.clientWidth;
    const h = 200;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, w, h);

    // prepare last 20 entries
    const data = puzzleHistory.slice(-20);
    if (data.length < 2) return;

    // compute step
    const stepX = w / (data.length - 1);

    // draw smooth line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff4d4d';
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - (pt.progress / 100) * (h - 20) - 10;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // draw circles at points
    data.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - (pt.progress / 100) * (h - 20) - 10;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff4d4d';
      ctx.fill();
    });
  }

  // ─── DOM Ready ────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    injectPuzzleStyles();
    initPuzzles();
    renderPuzzleGraph();
  });

  // ─── Expose APIs ─────────────────────────────────────────────────────────────
  window.UmbrixiaUI = Object.assign(window.UmbrixiaUI || {}, {
    updatePuzzleProgress,
    renderPuzzleGraph
  });
})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Advanced Apple/Notion Features (Part 7)
// Paste this at the end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Basic Utils ─────────────────────────────────────────────────────────────
  const qs    = s => document.querySelector(s);
  const qsa   = s => Array.from(document.querySelectorAll(s));
  const on    = (e, s, fn) => document.addEventListener(e, ev => ev.target.matches(s) && fn(ev));
  const create= (t,p={},parent=document.body)=>{ const el=document.createElement(t); Object.assign(el,p); parent.appendChild(el); return el; };

  // ─── 1) PWA: Service Worker Registration ────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg=> console.log('SW registered:', reg.scope))
      .catch(err=> console.warn('SW failed:', err));
  }

  // ─── 2) Shortcut Help Overlay ────────────────────────────────────────────────
  const shortcutList = [
    { key: '?',   desc: 'Show this help' },
    { key: 'T',   desc: 'Toggle theme' },
    { key: 'K',   desc: 'Toggle fullscreen' },
    { key: 'M',   desc: 'Toggle markdown preview' },
    { key: 'Ctrl+Z', desc: 'Undo input' },
    { key: 'Ctrl+Y', desc: 'Redo input' }
  ];
  const helpOverlay = create('div',{ id:'shortcut-help', className:'modal hidden' });
  helpOverlay.innerHTML = `
    <div class="modal-content small">
      <h2>Keyboard Shortcuts</h2>
      <ul>${shortcutList.map(s=>`<li><kbd>${s.key}</kbd> — ${s.desc}</li>`).join('')}</ul>
      <button id="close-shortcuts" class="btn btn-outline small">Close</button>
    </div>
    <div class="modal-backdrop"></div>`;
  qs('#close-shortcuts').onclick = ()=> helpOverlay.classList.add('hidden');
  document.body.addEventListener('keydown', e=>{
    if (e.key === '?') {
      helpOverlay.classList.toggle('hidden');
      e.preventDefault();
    }
  });

  // ─── 3) Fullscreen Toggle (Press K) ─────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{/*fail silently*/});
      } else {
        document.exitFullscreen();
      }
    }
  });

  // ─── 4) Markdown Preview (Press M) ───────────────────────────────────────────
  let mdPreviewVisible = false;
  const mdLibUrl = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
  function loadMarked(cb) {
    if (window.marked) return cb();
    const s = document.createElement('script');
    s.src = mdLibUrl;
    s.onload = cb;
    document.head.appendChild(s);
  }
  const previewBox = create('div',{ id:'md-preview', className:'hidden' });
  previewBox.innerHTML = '<h3>Preview</h3><div class="content"></div>';
  document.addEventListener('keydown', e=>{
    if (e.key.toLowerCase() === 'm') {
      const input = qs('#userInput');
      if (!input) return;
      mdPreviewVisible = !mdPreviewVisible;
      previewBox.classList.toggle('hidden', !mdPreviewVisible);
      if (mdPreviewVisible) {
        loadMarked(()=>{
          const html = marked(input.value);
          qs('.content', previewBox).innerHTML = html;
        });
      }
    }
  });

  // ─── 5) Undo/Redo for Chat Input ──────────────────────────────────────────────
  const undoStack = [], redoStack = [];
  const input = qs('#userInput');
  if (input) {
    input.addEventListener('input', () => {
      undoStack.push(input.value);
      if (undoStack.length > 50) undoStack.shift();
      redoStack.length = 0;
    });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z') {
        e.preventDefault();
        if (undoStack.length > 1) {
          redoStack.push(undoStack.pop());
          input.value = undoStack[undoStack.length-1] || '';
        }
      }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='y') {
        e.preventDefault();
        if (redoStack.length) {
          const val = redoStack.pop();
          undoStack.push(val);
          input.value = val;
        }
      }
    });
  }

  // ─── 6) Resizable Split‑View (Chat ↔️ History) ─────────────────────────────────
  (function makeResizable() {
    const container = create('div',{ className:'split-container' }, qs('body'));
    const chatBox   = qs('#chatbox');
    const histBox   = create('div',{ id:'history-panel', className:'hidden'}, container);
    histBox.innerHTML = '<h3>Your Chat History</h3><div id="history-list"></div>';
    chatBox.parentNode.insertBefore(container, chatBox);
    container.append(histBox, chatBox);
    const handle = create('div',{ className:'split-handle' }, container);

    let dragging = false;
    handle.addEventListener('mousedown', ()=> dragging = true);
    document.addEventListener('mouseup', ()=> dragging = false);
    document.addEventListener('mousemove', e=>{
      if (!dragging) return;
      const pct = (e.clientX / window.innerWidth)*100;
      histBox.style.width = pct+'%';
      chatBox.style.width = (100-pct)+'%';
    });

    // populate history
    const list = qs('#history-list');
    const save = JSON.parse(localStorage.getItem('chatHistory')||'[]');
    save.forEach(msg => {
      const p = document.createElement('p'); p.textContent = msg;
      list.append(p);
    });
    // toggle panel
    on('keydown','[data-toggle-history]',()=> histBox.classList.toggle('hidden'));
  })();

  // ─── 7) BroadcastChannel Stub for Collaboration ───────────────────────────────
  if ('BroadcastChannel' in window) {
    const chan = new BroadcastChannel('umbrixia-collab');
    chan.onmessage = msg=>{
      showToast(`Collaborator says: ${msg.data}`,2000);
    };
    // expose for future use
    window.Collab = msg => chan.postMessage(msg);
  }

  // ─── Styling for Part 7 UI ─────────────────────────────────────────────────────
  create('style',{ textContent: `
    /* Shortcut Help */
    #shortcut-help .modal-content.small { max-width:320px; padding:20px; }
    #shortcut-help ul { list-style:none; margin:0; padding:0; }
    #shortcut-help li { margin:8px 0; font-size:0.9rem; }
    #shortcut-help kbd { background:#333; padding:2px 6px; border-radius:4px; }

    /* Markdown Preview */
    #md-preview {
      position:fixed; right:20px; bottom:20px;
      width:300px; max-height:400px; overflow:auto;
      background:#1a1a1a; color:#fff; border:1px solid #444;
      border-radius:8px; padding:12px; z-index:9999;
    }

    /* Resizable Split */
    .split-container {
      display:flex; height:calc(100vh - 200px); /* adjust for header/footer */
    }
    #history-panel {
      background:#111; color:#ccc; overflow:auto;
      padding:12px; width:25%;
    }
    .split-handle {
      width:8px; cursor:ew-resize; background:#444;
    }
    #chatbox { width:75%; }

    /* Fullscreen helper (none needed) */
  ` }, document.head);

  // ─── Init any Part 7 UI ───────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    // nothing extra to call; all self‐initializing
  });

  // ─── Expose for Testing ───────────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    toggleFullscreen: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(),
    showShortcutHelp: () => helpOverlay.classList.remove('hidden'),
    toggleMarkdown: () => document.dispatchEvent(new KeyboardEvent('keydown',{key:'m'})),
    undoInput:    () => document.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true})),
    redoInput:    () => document.dispatchEvent(new KeyboardEvent('keydown',{key:'y',ctrlKey:true})),
    sendCollab:   msg => window.Collab && window.Collab(msg)
  });

})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Plugin System, WebSocket, & Settings Drawer (Part 8)
// Paste this at the VERY end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Core Utils ──────────────────────────────────────────────────────────────
  const qs    = sel => document.querySelector(sel);
  const qsa   = sel => Array.from(document.querySelectorAll(sel));
  const on    = (evt, sel, fn) => document.addEventListener(evt, e => e.target.matches(sel) && fn(e));
  const emit  = (ev, detail) => window.dispatchEvent(new CustomEvent(ev, { detail }));

  // ─── 1) Plugin Architecture ───────────────────────────────────────────────────
  const Plugins = {};
  window.UmbrixiaUI.registerPlugin = (name, initFn) => {
    if (Plugins[name]) return console.warn(`Plugin "${name}" already registered.`);
    Plugins[name] = initFn;
    try { initFn({ qs, qsa, on, emit }); }
    catch (e) { console.error(`Plugin "${name}" failed:`, e); }
  };
  window.UmbrixiaUI.unregisterPlugin = name => { delete Plugins[name]; };

  // ─── 2) Settings Drawer ───────────────────────────────────────────────────────
  const drawer = create('div', { className:'settings-drawer hidden' });
  drawer.innerHTML = `
    <h3>Settings</h3>
    <label><input type="checkbox" data-setting="animations" checked> Animations</label>
    <label><input type="checkbox" data-setting="sounds" checked> Sounds</label>
    <label><input type="checkbox" data-setting="notifications" checked> Desktop Notifications</label>
    <label>Text Size: <input type="range" min="14" max="24" data-setting="textSize" value="16"></label>
    <button id="close-settings" class="btn btn-outline small">Close</button>
  `;
  document.body.appendChild(drawer);
  create('button',{ id:'open-settings', innerText:'⚙️', className:'settings-btn' }, document.body);
  qs('#open-settings').onclick = ()=> drawer.classList.remove('hidden');
  qs('#close-settings').onclick = ()=> drawer.classList.add('hidden');
  drawer.querySelectorAll('[data-setting]').forEach(input => {
    input.addEventListener('input', e => {
      const key = e.target.dataset.setting;
      const val = e.target.type==='checkbox' ? e.target.checked : e.target.value;
      localStorage.setItem(`setting:${key}`, val);
      applySetting(key, val);
    });
    // initialize from storage
    const stored = localStorage.getItem(`setting:${input.dataset.setting}`);
    if (stored !== null) {
      if (input.type==='checkbox') input.checked = stored==='true';
      else input.value = stored;
      applySetting(input.dataset.setting, input.checked || input.value);
    }
  });
  function applySetting(key, val) {
    switch(key) {
      case 'animations':
        document.body.classList.toggle('no-animations', !val);
        break;
      case 'sounds':
        window.UmbrixiaUI.soundsEnabled = !!val;
        break;
      case 'notifications':
        window.UmbrixiaUI.notifsEnabled = !!val;
        break;
      case 'textSize':
        document.documentElement.style.fontSize = `${val}px`;
        break;
    }
  }

  // ─── 3) In-App Notification Center ────────────────────────────────────────────
  const notifCenter = create('div',{ className:'notif-center hidden' });
  notifCenter.innerHTML = '<h3>Notifications</h3><ul id="notif-list"></ul><button id="close-notifs" class="btn btn-outline small">Close</button>';
  document.body.appendChild(notifCenter);
  qs('#close-notifs').onclick = ()=> notifCenter.classList.add('hidden');
  window.UmbrixiaUI.notifyInApp = msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    qs('#notif-list').prepend(li);
    showToast(msg, 2000);
  };
  on('keydown', null, e => {
    // Ctrl+N opens center
    if (e.ctrlKey && e.key.toLowerCase()==='n') {
      notifCenter.classList.toggle('hidden');
    }
  });

  // ─── 4) WebSocket Chat Stub ──────────────────────────────────────────────────
  let ws;
  function connectChatWS(url='wss://example.com/chat') {
    if (!('WebSocket' in window)) return;
    ws = new WebSocket(url);
    ws.addEventListener('open', () => showToast('🔗 WS connected',1500));
    ws.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      emit('ws:message', data);
      chat.innerHTML += `<p class="message bot"><strong>WS Bot:</strong> ${data.text}</p>`;
    });
    ws.addEventListener('close', () => showToast('⚠️ WS disconnected',2000));
    ws.addEventListener('error', ()=> showToast('⚠️ WS error',2000));
  }
  window.UmbrixiaUI.sendWS = (data) => ws?.send(JSON.stringify(data));
  // Auto‐connect if setting enabled
  if (localStorage.getItem('setting:websocket')==='true') connectChatWS();

  // ─── 5) Remote Error Logging ─────────────────────────────────────────────────
  const ERR_URL = '/logError';
  window.addEventListener('error', e => {
    fetch(ERR_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ msg:e.message, file:e.filename, line:e.lineno })
    }).catch(()=>{/*silent*/});
  });

  // ─── 6) Device Orientation Card Tilt ─────────────────────────────────────────
  qsa('.feature-card').forEach(card => {
    window.addEventListener('deviceorientation', ({ gamma, beta }) => {
      const x = Math.min(30, Math.max(-30, gamma));
      const y = Math.min(30, Math.max(-30, beta));
      card.style.transform = `rotateY(${x/5}deg) rotateX(${-y/5}deg)`;
    });
  });

  // ─── 7) Expose & Init ────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    // nothing extra
  });
  Object.assign(window.UmbrixiaUI, {
    connectChatWS,
    registerPlugin: window.UmbrixiaUI.registerPlugin,
    unregisterPlugin: window.UmbrixiaUI.unregisterPlugin
  });

  // ─── Minimal Styles for Part 8 ───────────────────────────────────────────────
  create('style',{ textContent: `
    /* Settings button */
    .settings-btn { position:fixed; bottom:20px; right:20px; z-index:10000; }
    .settings-drawer {
      position:fixed; top:0; right:0; width:260px; height:100vh;
      background:#111; color:#ddd; padding:20px; box-shadow:-4px 0 10px rgba(0,0,0,0.5);
      overflow:auto; z-index:10000;
    }
    .settings-drawer.hidden { transform:translateX(100%); transition:transform .3s; }
    .settings-drawer:not(.hidden) { transform:translateX(0); }
    /* Notifications center */
    .notif-center {
      position:fixed; top:20px; right:20px; width:300px;
      background:#111; color:#ddd; padding:16px; border-radius:8px;
      box-shadow:0 0 10px rgba(0,0,0,0.7); z-index:10000;
    }
    .notif-center.hidden { display:none; }
    .notif-center ul { list-style:none; padding:0; margin:8px 0; max-height:200px; overflow:auto;}
    .split-container { --not-used:0; }
  `}, document.head);

})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Chart.js Metrics, OS Theme Sync & Connectivity Indicator (Part 9)
// Paste this at the very end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const qs  = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const create = (t,p={},parent=document.body) => {
    const el = document.createElement(t);
    Object.assign(el,p);
    parent.appendChild(el);
    return el;
  };

  // ─── 1) OS Dark/Light Theme Sync ─────────────────────────────────────────────
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', e => {
    document.body.dataset.theme = e.matches ? 'dark' : 'light';
  });

  // ─── 2) Connectivity Status Banner ───────────────────────────────────────────
  const statusBar = create('div',{ id:'conn-status', className:'conn-status hidden' }, document.body);
  function updateStatus() {
    if (navigator.onLine) {
      statusBar.textContent = '🟢 You are online';
      statusBar.classList.add('online'); statusBar.classList.remove('offline');
    } else {
      statusBar.textContent = '🔴 You are offline — some features may not work';
      statusBar.classList.add('offline'); statusBar.classList.remove('online');
    }
    statusBar.classList.remove('hidden');
    setTimeout(() => statusBar.classList.add('hidden'), 3000);
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // ─── 3) Chart.js in “Why Students Trust Us” ──────────────────────────────────
  // Ensure Chart.js is loaded via <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  if (window.Chart) {
    const stats = [ {label:'Addictive', value:85}, {label:'Tests', value:10}, {label:'Accuracy', value:100} ];
    const container = qs('.stats-row');
    if (container) {
      // insert canvas
      const ctx = create('canvas',{ id:'statsChart' }, container);
      // hide the fallback stat-boxes
      qsa('.stat-box').forEach(el => el.style.display = 'none');
      // draw donut
      new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: stats.map(s=>s.label),
          datasets: [{
            data: stats.map(s=>s.value),
            backgroundColor: ['#ff4d4d','#4f46e5','#60a5fa'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#fff' } },
          }
        }
      });
      // size canvas
      ctx.parentNode.style.position = 'relative';
      ctx.style.width = '100%';
      ctx.style.height = '250px';
    }
  }

  // ─── 4) AI Suggestion Chip ───────────────────────────────────────────────────
  const chip = create('button',{ className:'suggestion-chip hidden' }, document.body);
  chip.onclick = () => { qs('#userInput').value = chip.textContent; chip.classList.add('hidden'); qs('#userInput').focus(); };
  function showSuggestion(text) {
    chip.textContent = text;
    chip.classList.remove('hidden');
    setTimeout(() => chip.classList.add('hidden'), 8000);
  }
  // example: suggest based on inactivity
  let idle=0;
  setInterval(() => {
    idle++;
    if (idle===3) showSuggestion('Try asking: “Explain central idea.”');
  }, 60000);
  ['keydown','click'].forEach(ev => document.addEventListener(ev,()=>idle=0));

  // ─── 5) Animated Gradient Background ─────────────────────────────────────────
  const bg = create('div',{ className:'animated-gradient' }, document.body);
  bg.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1;
    background: linear-gradient(45deg, #111, #222, #111);
    background-size: 400% 400%; animation: gradientMove 15s ease infinite;
  `;
  create('style',{ textContent: `
    @keyframes gradientMove {
      0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
    }
  `}, document.head);

  // ─── 6) Hotkey to toggle split‑view (Press S) ─────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase()==='s') {
      qs('#history-panel')?.classList.toggle('hidden');
    }
  });

  // ─── 7) Expose Part 9 APIs ────────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    showSuggestion,
    updateStatus,
    refreshChart: () => window.dispatchEvent(new Event('resize'))
  });

  // ─── Init ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = mq.matches ? 'dark' : 'light';
    updateStatus();
  });
})();

// ───────────────────────────────────────────────────────────────────────────────
// Umbrixia UI — Scroll Progress, Wave Sections & Dynamic Table of Contents (Part 10)
// Paste this at the very end of script.js
// ───────────────────────────────────────────────────────────────────────────────
(() => {
  'use strict';

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const qs    = s => document.querySelector(s);
  const qsa   = s => Array.from(document.querySelectorAll(s));
  const on    = (evt, sel, fn) => document.addEventListener(evt, e => e.target.matches(sel) && fn(e));
  const create= (tag, props={}, parent=document.body) => {
    const el = document.createElement(tag);
    Object.assign(el, props);
    parent.appendChild(el);
    return el;
  };

  // ─── 1) Scroll Progress Indicator ─────────────────────────────────────────────
  const progress = create('div',{ id:'scroll-progress' }, document.body);
  progress.style.cssText = `
    position: fixed; top: 0; left: 0; height: 4px; width: 0;
    background: linear-gradient(90deg,#ff4d4d,#e74c3c);
    z-index: 9999; transition: width 0.2s ease;
  `;
  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = (window.scrollY / docH)*100;
    progress.style.width = `${pct}%`;
  });

  // ─── 2) Wave Section Dividers ──────────────────────────────────────────────────
  qsa('section').forEach(sec => {
    const wave = create('div',{ className:'wave-divider' }, sec);
    wave.innerHTML = `
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="display:block;width:100%;height:60px;">
        <path fill="#0d0d0d" d="M0,0 C360,60 1080,0 1440,60 L1440,60 L0,60 Z"></path>
      </svg>`;
  });

  // ─── 3) Dynamic Table of Contents ──────────────────────────────────────────────
  const toc = create('nav',{ id:'toc', className:'toc hidden' }, document.body);
  toc.innerHTML = '<h4>On This Page</h4><ul></ul>';
  const tocList = qs('#toc ul');
  qsa('h2.section-title, h3').forEach(heading => {
    const id = heading.id || heading.textContent.trim().toLowerCase().replace(/\W+/g,'-');
    heading.id = id;
    const li = create('li',{ innerHTML:`<a href="#${id}">${heading.textContent}</a>` }, tocList);
  });
  on('keydown', null, e => {
    if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
      toc.classList.toggle('hidden');
      e.preventDefault();
    }
  });
  const tocStyle = create('style',{ textContent: `
    #toc {
      position: fixed; top: 100px; right: 20px; width: 200px;
      background: rgba(20,20,20,0.8); color: #ddd;
      padding: 12px; border-radius: 8px; font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 9999;
      max-height: 70vh; overflow:auto;
    }
    #toc.hidden { display: none; }
    #toc h4 { margin-top:0; color:#ff4d4d; }
    #toc ul { list-style:none; padding:0; margin:8px 0; }
    #toc li { margin:6px 0; }
    #toc a { color:#ccc; text-decoration:none; }
    #toc a:hover { text-decoration:underline; }
  `}, document.head);

  // ─── 4) Section Reveal Delay by Index ─────────────────────────────────────────
  qsa('.features-grid .feature-card').forEach((card,i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.6s ease ${i*0.15}s, transform 0.6s ease ${i*0.15}s`;
  });
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.style.opacity = '1';
        ent.target.style.transform = 'translateY(0)';
        obs.unobserve(ent.target);
      }
    });
  },{ threshold:0.2 });
  qsa('.features-grid .feature-card').forEach(card => revealObserver.observe(card));

  // ─── 5) “Back to Top” Floating Label ──────────────────────────────────────────
  const label = create('div',{ id:'back-to-top', innerText:'Back to Top' }, document.body);
  label.style.cssText = `
    position: fixed; bottom: 80px; right: 20px;
    background:#ff4d4d; color:#fff; padding:8px 12px;
    border-radius:20px; cursor:pointer; opacity:0;
    transition:opacity 0.3s, transform 0.3s;
    font-size:0.9rem; user-select:none; z-index:9999;
  `;
  label.onclick = () => window.scrollTo({ top:0, behavior:'smooth' });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      label.style.opacity = '1';
      label.style.transform = 'translateY(0)';
    } else {
      label.style.opacity = '0';
      label.style.transform = 'translateY(20px)';
    }
  });

  // ─── 6) Analytics Event on Section View ───────────────────────────────────────
  qsa('section').forEach(sec => {
    const id = sec.id || sec.querySelector('.section-title')?.id;
    if (!id) return;
    const obs = new IntersectionObserver((ents, o) => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          if (window.UmbrixiaUI.track) UmbrixiaUI.track('view:'+id);
          o.unobserve(e.target);
        }
      });
    },{ threshold:0.3 });
    obs.observe(sec);
  });

  // ─── 7) Expose Part 10 APIs ───────────────────────────────────────────────────
  Object.assign(window.UmbrixiaUI, {
    toggleTOC: () => toc.classList.toggle('hidden'),
    showBackToTop: () => label.style.opacity = '1'
  });
})();



