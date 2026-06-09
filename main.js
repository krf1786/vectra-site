const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const serviceDetails = {
  marketing: {
    index: "01 — Marketing",
    title: "Marketing Websites",
    description:
      "A complete website for businesses that need to explain a valuable offer clearly, establish trust quickly, and generate the right next action.",
    items: [
      "Positioning, sitemap, and content hierarchy",
      "Responsive design and production development",
      "CMS, lead capture, analytics, and launch QA",
    ],
  },
  commerce: {
    index: "02 — Commerce",
    title: "E-commerce",
    description:
      "A focused storefront that helps customers understand the products, find the right option, and complete a purchase without unnecessary friction.",
    items: [
      "Catalog and product-page experience",
      "Commerce, payment, and fulfillment integrations",
      "Responsive build, analytics, and launch support",
    ],
  },
  campaign: {
    index: "03 — Campaign",
    title: "Landing Pages",
    description:
      "A dedicated page for one audience, one offer, and one conversion goal, built to support campaigns, launches, and focused lead generation.",
    items: [
      "Offer structure and conversion-focused layout",
      "Responsive development and form integration",
      "Analytics, testing foundation, and deployment",
    ],
  },
  optimization: {
    index: "04 — Optimization",
    title: "Redesign & Optimization",
    description:
      "A practical improvement path for an existing website that is unclear, slow, inaccessible, difficult to manage, or no longer represents the business.",
    items: [
      "Content, UX, performance, and accessibility audit",
      "Prioritized redesign or rebuild plan",
      "Implementation, migration, and measurement setup",
    ],
  },
};

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const nav = document.getElementById("siteNav");
const navLinks = [...document.querySelectorAll(".site-nav a")];

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
};

menuButton.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1040) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
    closeMenu();
    menuButton.focus();
  }
});

const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

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
  { rootMargin: "-35% 0px -60% 0px" },
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
      `Project type: ${data.get("service")}`,
      `Timing: ${data.get("timeline") || "Not provided"}`,
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
  submitButton.textContent = "Sending...";
  formStatus.textContent = "Sending your request securely...";
  formStatus.className = "";

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);
    contactForm.reset();
    formStatus.textContent = "Request sent. We’ll reply directly.";
  } catch (error) {
    console.error("Contact form submission failed:", error);
    formStatus.textContent = "The form could not connect. Your email draft is ready instead.";
    formStatus.className = "error";
    formFallback.classList.add("visible");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Plan my website <span>&rarr;</span>";
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
