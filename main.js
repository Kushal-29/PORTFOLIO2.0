// --- 1. INTRO FRAME CANVAS ANIMATION (207 FRAMES) ---
const TOTAL_FRAMES = 207;
const images = [];
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas.getContext('2d', { alpha: false });
const introContainer = document.getElementById('intro-scroll-container');

let currentFrameIndex = 0;
let targetFrameIndex = 0;

function getFramePath(index) {
  const num = String(index + 1).padStart(3, '0');
  return `ezgif-frame-${num}.jpg`;
}

function renderFrame(index) {
  const img = images[index];
  if (!img || !img.complete) return;

  const canvasWidth = heroCanvas.width;
  const canvasHeight = heroCanvas.height;
  const imgWidth = img.naturalWidth || 1920;
  const imgHeight = img.naturalHeight || 1080;

  let scale, drawWidth, drawHeight, x, y;

  // On Mobile Portrait (<768px), fit full width so left & right motion graphics are 100% visible!
  if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
    scale = (canvasWidth / imgWidth) * 1.03;
    drawWidth = imgWidth * scale;
    drawHeight = imgHeight * scale;
    x = (canvasWidth - drawWidth) / 2;
    y = (canvasHeight - drawHeight) / 2.2;
  } else {
    // Desktop / Tablet / Mobile Landscape: Cover scale with slight 1.03x crop to hide edge watermarks
    scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight) * 1.03;
    drawWidth = imgWidth * scale;
    drawHeight = imgHeight * scale;
    x = (canvasWidth - drawWidth) / 2;
    y = (canvasHeight - drawHeight) / 2;
  }

  heroCtx.fillStyle = '#000000';
  heroCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  heroCtx.drawImage(img, x, y, drawWidth, drawHeight);

  // Mask out VEO watermark at bottom-right corner of image frame & canvas
  const maskWidth = Math.max(160 * (scale / 1.03), 140);
  const maskHeight = Math.max(80 * (scale / 1.03), 70);

  // Fill black patch over bottom-right of image frame & bottom-right of viewport canvas
  heroCtx.fillRect(
    Math.min(canvasWidth - maskWidth, x + drawWidth - maskWidth - 10),
    Math.min(canvasHeight - maskHeight, y + drawHeight - maskHeight - 10),
    maskWidth + 30,
    maskHeight + 30
  );

  // Extra safety black box at extreme bottom-right of canvas viewport
  heroCtx.fillRect(canvasWidth - 160, canvasHeight - 80, 170, 90);
}

function resizeHeroCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  heroCanvas.width = window.innerWidth * dpr;
  heroCanvas.height = window.innerHeight * dpr;
  renderFrame(Math.round(currentFrameIndex));
}

function updateHeroScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const introHeight = introContainer.offsetHeight - window.innerHeight;

  const hudOverlay = document.getElementById('hero-hud-overlay');
  if (hudOverlay) {
    if (scrollTop > 30) {
      hudOverlay.classList.add('scrolled-out');
    } else {
      hudOverlay.classList.remove('scrolled-out');
    }
  }

  if (introHeight > 0) {
    const fraction = Math.min(1, Math.max(0, scrollTop / introHeight));
    targetFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(fraction * TOTAL_FRAMES));

    // Fade out canvas once scrolled past intro sequence container
    if (scrollTop > introHeight + 100) {
      heroCanvas.classList.add('faded');
    } else {
      heroCanvas.classList.remove('faded');
    }
  }
}

function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    if (i === 0) {
      img.onload = () => {
        resizeHeroCanvas();
        renderFrame(0);
      };
    }
    images.push(img);
  }
}

function tickHero() {
  const diff = targetFrameIndex - currentFrameIndex;
  if (Math.abs(diff) > 0.001) {
    currentFrameIndex += diff * 0.3;
  } else {
    currentFrameIndex = targetFrameIndex;
  }

  if (!heroCanvas.classList.contains('faded')) {
    renderFrame(Math.round(currentFrameIndex));
  }

  requestAnimationFrame(tickHero);
}

// --- 2. MOUSE-DIRECTION CONTROLLED EXPERIENCE TIMELINE ENGINE ---
const expSection = document.getElementById('experience');
const marqueeTrack = document.querySelector('.marquee-track');

let marqueeX = -10;
const defaultSpeed = -1.5; // Default smooth continuous flow to left
let currentSpeed = defaultSpeed;
let targetSpeed = defaultSpeed;

function updateExperienceMouseDirection(e) {
  if (!expSection) return;
  const rect = expSection.getBoundingClientRect();
  
  // Check if mouse is vertically within Experience section
  if (e.clientY >= rect.top - 50 && e.clientY <= rect.bottom + 50) {
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width)); // 0.0 (left edge) to 1.0 (right edge)

    if (ratio < 0.45) {
      // Mouse on LEFT side -> Flow LEFT (speed accelerates towards left edge)
      const factor = (0.45 - ratio) / 0.45;
      targetSpeed = -1.5 - (factor * 7.5);
    } else if (ratio > 0.55) {
      // Mouse on RIGHT side -> Flow RIGHT (speed accelerates towards right edge)
      const factor = (ratio - 0.55) / 0.45;
      targetSpeed = 1.5 + (factor * 7.5);
    } else {
      // Center zone -> slight pause / smooth shift
      targetSpeed = 0;
    }
  } else {
    targetSpeed = defaultSpeed;
  }
}

window.addEventListener('mousemove', updateExperienceMouseDirection, { passive: true });

function tickMarquee() {
  if (marqueeTrack) {
    currentSpeed += (targetSpeed - currentSpeed) * 0.1;
    marqueeX += currentSpeed;

    const halfWidth = marqueeTrack.scrollWidth / 2;
    if (halfWidth > 200) {
      if (marqueeX < -halfWidth) {
        marqueeX += halfWidth;
      }
      if (marqueeX > 0) {
        marqueeX -= halfWidth;
      }
      marqueeTrack.style.transform = `translate3d(${marqueeX.toFixed(2)}px, 0, 0)`;
    }
  }
  requestAnimationFrame(tickMarquee);
}

// --- 3. 3D INTERACTIVE TECH GLOBE SPHERE ENGINE ---
const techSkills = [
  // 🤖 AI / ML
  { name: "Keras", category: "aiml" },
  { name: "TensorFlow", category: "aiml" },
  { name: "OpenCV", category: "aiml" },
  { name: "NumPy", category: "aiml" },
  { name: "Pandas", category: "aiml" },
  { name: "Matplotlib", category: "aiml" },
  { name: "Seaborn", category: "aiml" },
  { name: "NLP", category: "aiml" },
  { name: "CNN", category: "aiml" },
  { name: "Deep Learning", category: "aiml" },
  { name: "LSTM", category: "aiml" },
  { name: "Random Forest", category: "aiml" },
  { name: "Cosine Similarity", category: "aiml" },
  { name: "Machine Learning", category: "aiml" },

  // 🌐 Full Stack & Web
  { name: "Next.js", category: "fullstack" },
  { name: "TypeScript", category: "fullstack" },
  { name: "Socket.IO", category: "fullstack" },
  { name: "WebRTC", category: "fullstack" },

  // 🗄️ Database & Backend
  { name: "Firebase", category: "backend" },
  { name: "Firestore", category: "backend" },
  { name: "MongoDB", category: "backend" },
  { name: "MySQL", category: "backend" },
  { name: "SQLite", category: "backend" },
  { name: "Flask", category: "backend" },
  { name: "Express.js", category: "backend" },
  { name: "Node.js", category: "backend" },

  // 🎨 Frontend / UI
  { name: "React", category: "frontend" },
  { name: "React Native", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "HTML5", category: "frontend" },
  { name: "CSS3", category: "frontend" },
  { name: "JavaScript", category: "frontend" },

  // 🧠 APIs & Generative AI
  { name: "Gemini API", category: "genai" },
  { name: "Google Translate API", category: "genai" },
  { name: "REST APIs", category: "genai" },

  // 🛠️ Tools & Analytics
  { name: "Git", category: "tools" },
  { name: "GitHub", category: "tools" },
  { name: "VS Code", category: "tools" },
  { name: "NPM", category: "tools" },
  { name: "Docker", category: "tools" },
  { name: "AWS", category: "tools" },
  { name: "Power BI", category: "tools" },
  { name: "LibreOffice Calc", category: "tools" }
];

const globeContainer = document.getElementById('tech-globe-container');
const tags = [];
let radius = window.innerWidth <= 480 ? 115 : (window.innerWidth <= 768 ? 145 : 220);
let angleX = 0.003;
let angleY = 0.005;
let targetAngleX = 0.003;
let targetAngleY = 0.005;

function initTechGlobe() {
  if (!globeContainer) return;
  globeContainer.innerHTML = '';
  tags.length = 0;

  radius = window.innerWidth <= 480 ? 115 : (window.innerWidth <= 768 ? 145 : 220);

  const N = techSkills.length;
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const tagEl = document.createElement('div');
    tagEl.className = 'tech-globe-tag';
    tagEl.textContent = techSkills[i].name;
    tagEl.setAttribute('data-category', techSkills[i].category);
    globeContainer.appendChild(tagEl);

    tags.push({
      x: x * radius,
      y: y * radius,
      z: z * radius,
      el: tagEl,
      category: techSkills[i].category
    });
  }
}

if (globeContainer) {
  const globeWrapper = document.querySelector('.tech-globe-wrapper');
  globeWrapper.addEventListener('mousemove', (e) => {
    const rect = globeWrapper.getBoundingClientRect();
    const mouseX = e.clientX - (rect.left + rect.width / 2);
    const mouseY = e.clientY - (rect.top + rect.height / 2);

    targetAngleY = (mouseX / rect.width) * 0.03;
    targetAngleX = -(mouseY / rect.height) * 0.03;
  });

  globeWrapper.addEventListener('mouseleave', () => {
    targetAngleX = 0.003;
    targetAngleY = 0.005;
  });
}

function rotateGlobe() {
  if (globeContainer && tags.length > 0) {
    angleX += (targetAngleX - angleX) * 0.05;
    angleY += (targetAngleY - angleY) * 0.05;

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    for (let tag of tags) {
      let x1 = tag.x * cosY - tag.z * sinY;
      let z1 = tag.z * cosY + tag.x * sinY;

      let y1 = tag.y * cosX - z1 * sinX;
      let z2 = z1 * cosX + tag.y * sinX;

      tag.x = x1;
      tag.y = y1;
      tag.z = z2;

      const fov = 380;
      const scale = Math.max(0.4, fov / (fov + z2 * 0.7));
      const alpha = Math.max(0.2, (z2 + radius) / (2 * radius));

      if (!tag.el.classList.contains('active-hover')) {
        tag.el.style.transform = `translate(-50%, -50%) translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0px) scale(${scale.toFixed(2)})`;
        tag.el.style.opacity = alpha.toFixed(2);
        tag.el.style.zIndex = Math.floor(z2 + radius);
      }
    }
  }
  requestAnimationFrame(rotateGlobe);
}

// TECH STACK FILTER TABS
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    tags.forEach((tag) => {
      if (filter === 'all' || tag.category === filter) {
        tag.el.classList.remove('dimmed');
      } else {
        tag.el.classList.add('dimmed');
      }
    });
  });
});

// --- 4. INTERACTIVE BACKGROUND PARTICLE CANVAS ---
const particleCanvas = document.getElementById('particle-canvas');
const particleCtx = particleCanvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

class Particle {
  constructor() {
    this.x = Math.random() * particleCanvas.width;
    this.y = Math.random() * particleCanvas.height;
    this.size = Math.random() * 1.8 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > particleCanvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > particleCanvas.height) this.speedY *= -1;
  }

  draw() {
    particleCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    particleCtx.beginPath();
    particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    particleCtx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor(window.innerWidth / 16));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        particleCtx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist / 700})`;
        particleCtx.lineWidth = 0.6;
        particleCtx.beginPath();
        particleCtx.moveTo(particles[i].x, particles[i].y);
        particleCtx.lineTo(particles[j].x, particles[j].y);
        particleCtx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

// --- 5. STATS ANIMATED COUNTERS ---
let animatedStats = false;
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isFloat = target % 1 !== 0;
    let count = 0;
    const speed = target / 40;

    const updateCount = () => {
      count += speed;
      if (count < target) {
        el.textContent = isFloat ? count.toFixed(2) : Math.ceil(count) + '+';
        setTimeout(updateCount, 30);
      } else {
        el.textContent = isFloat ? target.toFixed(2) : target + '+';
      }
    };
    updateCount();
  });
}

// --- 6. INTERSECTION OBSERVER FOR ANIMATIONS ---
const observerOptions = { threshold: 0.2 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.target.id === 'stats' && !animatedStats) {
        animatedStats = true;
        animateStats();
      }
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.section-header, .about-card, .education-card, .project-card, .award-card, #stats').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  observer.observe(el);
});

// Hide intro overlay cleanly after 3.0 seconds
setTimeout(() => {
  const overlay = document.getElementById('netflix-intro-overlay');
  if (overlay) overlay.style.display = 'none';
}, 3000);

// Smooth Scroll Anchor Click Handler
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Mobile Navigation Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Auto-close mobile nav menu on clicking any navigation link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

// Certifications Accordion Card Toggle Logic
document.querySelectorAll('.cert-card-header').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.closest('.cert-card');
    if (card) {
      card.classList.toggle('open');
    }
  });
});

// Event Listeners
window.addEventListener('resize', () => {
  resizeHeroCanvas();
  resizeParticleCanvas();
  radius = window.innerWidth <= 480 ? 125 : (window.innerWidth <= 768 ? 165 : 250);
});

window.addEventListener('scroll', updateHeroScroll, { passive: true });

// DOM Loaded Initialization
window.addEventListener('DOMContentLoaded', () => {
  preloadFrames();
  resizeHeroCanvas();
  updateHeroScroll();
  requestAnimationFrame(tickHero);

  requestAnimationFrame(tickMarquee);

  initTechGlobe();
  requestAnimationFrame(rotateGlobe);

  resizeParticleCanvas();
  initParticles();
  requestAnimationFrame(animateParticles);

  // --- ARC REACTOR INTERACTIVE HOVER CONTROLLER & REPULSOR AUDIO ---
  const avatarFrame = document.querySelector('.avatar-frame');
  const showcaseCard = document.querySelector('.tech-showcase-card');
  const repulsorAudio = new Audio('mr_tinystark-iron-man-repulsor-157371.mp3');
  repulsorAudio.volume = 0.6;

  function playRepulsorSound() {
    try {
      repulsorAudio.currentTime = 0;
      const playPromise = repulsorAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: user interaction will trigger playback
        });
      }
    } catch (err) {
      // Graceful fallback if audio is not supported
    }
  }

  if (avatarFrame) {
    const activate = () => {
      if (!avatarFrame.classList.contains('active-reactor')) {
        avatarFrame.classList.add('active-reactor');
        playRepulsorSound();
      }
    };
    const deactivate = () => {
      avatarFrame.classList.remove('active-reactor');
    };

    avatarFrame.addEventListener('mouseenter', activate);
    avatarFrame.addEventListener('mouseleave', deactivate);
    avatarFrame.addEventListener('click', () => {
      playRepulsorSound();
      avatarFrame.classList.add('active-reactor');
    });
    avatarFrame.addEventListener('touchstart', activate, { passive: true });
    avatarFrame.addEventListener('touchend', deactivate, { passive: true });
  }
});
