const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const serviceDetails = {
  marketing: {
    index: "[WEB_01] / MARKETING",
    title: "Marketing Websites",
    description:
      "A complete website for businesses that need to explain a valuable offer clearly, establish trust quickly, and generate the right next action.",
    items: ["Positioning, sitemap, and content hierarchy", "Responsive design and production development", "CMS, lead capture, analytics, and launch QA"],
  },
  commerce: {
    index: "[WEB_02] / COMMERCE",
    title: "E-commerce",
    description:
      "A focused storefront that helps customers understand the products, find the right option, and complete a purchase without unnecessary friction.",
    items: ["Catalog and product-page experience", "Commerce, payment, and fulfillment integrations", "Responsive build, analytics, and launch support"],
  },
  campaign: {
    index: "[WEB_03] / CAMPAIGN",
    title: "Landing Pages",
    description:
      "A dedicated page for one audience, one offer, and one conversion goal, built to support campaigns, launches, and focused lead generation.",
    items: ["Offer structure and conversion-focused layout", "Responsive development and form integration", "Analytics, testing foundation, and deployment"],
  },
  optimization: {
    index: "[WEB_04] / OPTIMIZATION",
    title: "Redesign & Optimization",
    description:
      "A practical improvement path for an existing website that is unclear, slow, inaccessible, difficult to manage, or no longer represents the business.",
    items: ["Content, UX, performance, and accessibility audit", "Prioritized redesign or rebuild plan", "Implementation, migration, and measurement setup"],
  },
};

const menuButton = document.querySelector(".menu-button");
const navLinks = [...document.querySelectorAll(".site-nav a")];

menuButton.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-30% 0px -60% 0px" },
);
sections.forEach((section) => sectionObserver.observe(section));

const dialog = document.getElementById("serviceDialog");
const dialogIndex = document.getElementById("dialogIndex");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const dialogList = document.getElementById("dialogList");

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    const service = serviceDetails[card.dataset.service];
    dialogIndex.textContent = service.index;
    dialogTitle.textContent = service.title;
    dialogDescription.textContent = service.description;
    dialogList.replaceChildren(
      ...service.items.map((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        return listItem;
      }),
    );
    dialog.showModal();
  });
});

dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (outside) dialog.close();
});
dialog.querySelector("a").addEventListener("click", () => dialog.close());

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const formFallback = document.getElementById("formFallback");
const submitButton = document.getElementById("submitButton");
const formEndpoint = import.meta.env.VITE_FORM_ENDPOINT?.trim();

const buildMailto = (data) => {
  const subject = encodeURIComponent(`Project inquiry: ${data.get("service")}`);
  const body = encodeURIComponent(
    [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Company: ${data.get("company") || "Not provided"}`,
      `Current website: ${data.get("current_url") || "Not provided"}`,
      `Project type: ${data.get("service")}`,
      `Approximate size: ${data.get("page_count") || "Not provided"}`,
      `Timing: ${data.get("timeline") || "Not provided"}`,
      `Integrations: ${data.get("integrations") || "Not provided"}`,
      "",
      "Website brief:",
      data.get("message"),
    ].join("\n"),
  );
  return `mailto:hello@vectra.systems?subject=${subject}&body=${body}`;
};

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = [
    ...contactForm.querySelectorAll(
      "input:not([name='company_website_confirm']), select, textarea",
    ),
  ];
  fields.forEach((field) => field.classList.remove("invalid"));
  formFallback.classList.remove("visible");

  const invalidFields = fields.filter((field) => !field.checkValidity());
  if (invalidFields.length) {
    invalidFields.forEach((field) => field.classList.add("invalid"));
    invalidFields[0].focus();
    formStatus.textContent = "Complete the highlighted fields.";
    formStatus.className = "error";
    return;
  }

  const data = new FormData(contactForm);
  if (data.get("company_website_confirm")) {
    formStatus.textContent = "Request received.";
    formStatus.className = "";
    contactForm.reset();
    return;
  }

  const mailto = buildMailto(data);
  formFallback.href = mailto;

  if (!formEndpoint) {
    formStatus.textContent = "Opening your email client...";
    formStatus.className = "";
    window.location.href = mailto;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Transmitting...";
  formStatus.textContent = "Sending your request securely...";
  formStatus.className = "";

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(data)),
    });

    if (!response.ok) {
      throw new Error(`Submission failed with status ${response.status}`);
    }

    contactForm.reset();
    formStatus.textContent = "Request sent. We’ll reply directly.";
  } catch (error) {
    console.error("Contact form submission failed:", error);
    formStatus.textContent = "The form could not connect. Your email draft is ready instead.";
    formStatus.className = "error";
    formFallback.classList.add("visible");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Plan my website <span>→</span>";
  }
});

document.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => field.classList.remove("invalid"));
});

document.getElementById("copyrightYear").textContent = new Date().getFullYear();
const liveClock = document.getElementById("liveClock");
const updateClock = () => {
  liveClock.textContent = `${new Date().toLocaleTimeString("en-US", {
    hour12: false,
    timeZone: "UTC",
  })} UTC`;
};
updateClock();
setInterval(updateClock, 1000);

if (finePointer && !reducedMotion) {
  const cursor = document.getElementById("cursor");
  const cursorGlow = document.getElementById("cursorGlow");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    document.body.style.setProperty("--mx", `${mouseX}px`);
    document.body.style.setProperty("--my", `${mouseY}px`);
  });

  const followGlow = () => {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.transform = `translate(${glowX - 120}px, ${glowY - 120}px)`;
    requestAnimationFrame(followGlow);
  };
  followGlow();

  document.querySelectorAll("a, button, input, textarea, select").forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("expanded"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("expanded"));
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - (bounds.left + bounds.width / 2);
      const y = event.clientY - (bounds.top + bounds.height / 2);
      element.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
    });
    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateX = ((y - bounds.height / 2) / bounds.height) * -8;
      const rotateY = ((x - bounds.width / 2) / bounds.width) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--cx", `${x}px`);
      card.style.setProperty("--cy", `${y}px`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

document.querySelectorAll("[data-scramble]").forEach((element) => {
  const original = element.dataset.scramble;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789[]{}<>/_";
  let animationFrame;

  element.addEventListener("mouseenter", () => {
    if (reducedMotion) return;
    cancelAnimationFrame(animationFrame);
    let progress = 0;
    const animate = () => {
      element.textContent = [...original]
        .map((character, index) => {
          if (character === " " || index < progress) return character;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");
      progress += 0.45;
      if (progress < original.length) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        element.textContent = original;
      }
    };
    animate();
  });
});

const saveDataEnabled = navigator.connection?.saveData === true;

if (!reducedMotion && !saveDataEnabled) {
  const canvas = document.getElementById("particleField");
  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = window.innerWidth < 720 ? 12 : 22;
  let animationFrame = null;
  let lastFrame = 0;

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  for (let index = 0; index < particleCount; index += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      xSpeed: (Math.random() - 0.5) * 0.18,
      ySpeed: (Math.random() - 0.5) * 0.18,
      radius: Math.random() + 0.4,
    });
  }

  const drawParticles = (timestamp) => {
    animationFrame = requestAnimationFrame(drawParticles);
    if (timestamp - lastFrame < 33) return;
    lastFrame = timestamp;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle, index) => {
      particle.x = (particle.x + particle.xSpeed + window.innerWidth) % window.innerWidth;
      particle.y = (particle.y + particle.ySpeed + window.innerHeight) % window.innerHeight;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(119, 149, 255, 0.3)";
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 120) continue;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(119, 149, 255, ${(1 - distance / 120) * 0.07})`;
        context.lineWidth = 0.5;
        context.stroke();
      }
    });
  };

  const updateAnimationState = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      return;
    }
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(drawParticles);
    }
  };

  document.addEventListener("visibilitychange", updateAnimationState);
  updateAnimationState();
} else {
  document.getElementById("particleField").hidden = true;
}
