// Initialize icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    mobileNav.style.display = mobileNav.style.display === 'block' ? 'none' : 'block';
  });
  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.style.display = 'none';
  }));
}

// Theme toggle with localStorage
const themeToggle = document.getElementById('themeToggle');
const applyTheme = (mode) => {
  document.body.classList.toggle('theme-light', mode === 'light');
  document.body.classList.toggle('theme-dark', mode !== 'light');
  // swap icon
  themeToggle.innerHTML = '';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', mode === 'light' ? 'sun' : 'moon-star');
  themeToggle.appendChild(icon);
  if (window.lucide) lucide.createIcons();
};
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

// Reveal-on-scroll animations
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Contact form (client-side validation only)
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      contactStatus.textContent = 'Please fill out all fields.';
      return;
    }
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!emailOk) {
      contactStatus.textContent = 'Please provide a valid email address.';
      return;
    }

    // Simulate success
    contactStatus.textContent = 'Thanks! Your message has been sent.';
    contactForm.reset();
  });
}

/* ===========================================================
   AI "About Me" — Local Client-side Summarizer (≤200 words)
   - Reads a resume file as text (PDF/DOCX need server parse).
   - Generates a concise summary using simple heuristics.
   - You can swap this with a real Genkit endpoint (see below).
   =========================================================== */
const readFileAsText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  // NOTE: For PDF/DOCX, this returns gibberish; you need server-side parsing.
  reader.onload = () => resolve(reader.result || '');
  reader.onerror = reject;
  reader.readAsText(file);
});

function summarizeResumeLocally(text, links) {
  // Very naive heuristic summarizer
  const clean = text.replace(/\s+/g, ' ').trim();

  // Try to detect name (first capitalized word cluster)
  const nameMatch = clean.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
  const name = nameMatch ? nameMatch[0] : 'Akshada Jadhav';

  // Extract likely skills keywords
  const SKILLS = ['React','Next.js','TypeScript','JavaScript','Tailwind','Node.js','Express','MongoDB','MySQL','Python','C','Git','Docker','Prisma','AWS','Figma'];
  const found = [...new Set(SKILLS.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(clean)))];
  const topSkills = found.slice(0, 8);

  // Experience count
  const roles = (clean.match(/(developer|engineer|intern|designer)/gi) || []).length;

  // Compose summary (<= 200 words)
  const sentences = [];
  sentences.push(`${name} is a developer focused on building clean, performant web experiences with modern tooling.`);
  if (topSkills.length) sentences.push(`Core skills include ${topSkills.join(', ')}.`);
  if (roles > 0) sentences.push(`Experienced across roles such as developer and intern, delivering UI components, API integrations, and performance improvements.`);
  if (links.github || links.linkedin) {
    const bits = [];
    if (links.github) bits.push(`GitHub: ${links.github}`);
    if (links.linkedin) bits.push(`LinkedIn: ${links.linkedin}`);
    sentences.push(`Explore more work at ${bits.join(' • ')}.`);
  }
  sentences.push(`Open to impactful opportunities and collaborations.`);

  let summary = sentences.join(' ');
  // crude word limiter
  const words = summary.split(/\s+/);
  if (words.length > 200) summary = words.slice(0, 200).join(' ') + '…';
  return summary;
}

const resumeInput = document.getElementById('resumeInput');
const generateBtn = document.getElementById('generateBtn');
const aboutSummary = document.getElementById('aboutSummary');
const githubUrl = document.getElementById('githubUrl');
const linkedinUrl = document.getElementById('linkedinUrl');

if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    if (!resumeInput.files || resumeInput.files.length === 0) {
      aboutSummary.textContent = 'Please upload a resume file (.txt recommended for this local demo) to generate a summary.';
      return;
    }
    const file = resumeInput.files[0];

    try {
      // LOCAL DEMO: read as text (good for .txt). PDF/DOCX require server parsing.
      const text = await readFileAsText(file);

      const summary = summarizeResumeLocally(text, {
        github: githubUrl.value.trim(),
        linkedin: linkedinUrl.value.trim()
      });

      aboutSummary.textContent = summary;
    } catch (err) {
      aboutSummary.textContent = 'Sorry, could not read the file. Try a .txt resume for this local demo.';
      console.error(err);
    }
  });
}
// Questions & answers
const qaList = {
  // About
  "hello": "Hello! I am Akshada's portfolio assistant 😊",
  "who are you?": "I am a chatbot embedded in Akshada Jadhav's portfolio to guide you!",
  "tell me about yourself": "I am a passionate and dedicated developer eager to learn new technologies, contribute to projects, and build modern web experiences.",
  "about you": "I focus on web development and AI, enjoy learning new skills, and am always ready for challenges.",

  // Experience
  "experience": "I have worked as a Web Developer Intern at Maxgen Technologies, Python Intern at Coding Raja, Web Developer and Campus Ambassador at Acmegrade, Project Admin at GSSOC, and Frontend Intern at Edunet Foundation.",
  "work experience": "I have hands-on experience in HTML, CSS, JavaScript, React, Node.js, PHP, and project management.",

  // Education
  "education": "I am pursuing a B.E. in Information Technology at Pravara Rural Engineering College (2022–2026). Previously completed HSC at B.G.P. Sahyadri Jr. College and SSC at B.G.P. Sahyadri Vidyalaya, Sangamner.",
  "degree": "Bachelor of Engineering (IT) with a CGPA of 9.14.",

  // Skills
  "skills": "I work with HTML, CSS, JavaScript, React, Next.js, Node.js, Express, Python, C, Git, GitHub, Docker, and more.",
  "tech stack": "Frontend: HTML, CSS, Tailwind, JavaScript, React, Next.js. Backend: Node.js, Express, Prisma, MySQL. Languages: JavaScript, TypeScript, Python, C. Tools: Git, Docker, Postman, Vite.",

  // Certifications
  "certifications": "I have completed multiple certifications including Web Development Training (Acmegrade), Summer Workshop (GFG), Introduction to Frontend (Simplilearn), Data Analytics (Deloitte), JavaScript (Simplilearn), C Programming (IIT Bombay), and more.",
  "certificates": "I have certificates for web development, JavaScript, C programming, React, and various hackathons and quizzes from platforms like Udemy, Simplilearn, and Unstop.",

  // Contact
  "contact": "You can reach me at jadhavakshada414@gmail.com or call me at +91 9923834380. I am based in Sangamner, Maharashtra, India.",
  "how to contact": "Email: jadhavakshada414@gmail.com | Phone: +91 9923834380 | LinkedIn: https://www.linkedin.com/in/akshada-jadhav-4b72062b5/",

  // Misc / Greetings
  "thank you": "You're welcome! 😊",
  "bye": "Goodbye! Have a great day! 👋"
};


// DOM elements
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotBox = document.getElementById("chatbotBox");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");
const chatbotSuggestions = document.getElementById("chatbotSuggestions");

// Toggle chatbot
chatbotToggle.addEventListener("click", () => {
  chatbotBox.style.display = chatbotBox.style.display === "flex" ? "none" : "flex";
});

// Close chatbot
chatbotClose.addEventListener("click", () => {
  chatbotBox.style.display = "none";
});

// Send message
function sendMessage(msg) {
  if (!msg) return;

  // Hide suggestions
  chatbotSuggestions.style.display = "none";

  // User message
  const userBubble = document.createElement("div");
  userBubble.classList.add("chatbot-message", "user");
  userBubble.textContent = msg;
  chatbotMessages.appendChild(userBubble);

  // Bot response
  const key = msg.toLowerCase();
  const botReply = qaList[key] || "Sorry, I don't understand that.";
  const botBubble = document.createElement("div");
  botBubble.classList.add("chatbot-message", "bot");
  botBubble.textContent = botReply;
  chatbotMessages.appendChild(botBubble);

  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  chatbotInput.value = "";
}

// Input events
chatbotSend.addEventListener("click", () => sendMessage(chatbotInput.value.trim()));
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage(chatbotInput.value.trim());
});

// Suggestion buttons
document.querySelectorAll(".suggestion-btn").forEach((btn) => {
  btn.addEventListener("click", () => sendMessage(btn.textContent));
});
