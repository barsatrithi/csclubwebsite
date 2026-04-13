const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const heroSection = document.querySelector(".hero");

function updateHeroScrollEffect() {
  if (!heroSection) {
    return;
  }

  const rect = heroSection.getBoundingClientRect();
  const total = Math.max(rect.height, 1);
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);

  document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
}

updateHeroScrollEffect();
window.addEventListener("scroll", updateHeroScrollEffect, { passive: true });
window.addEventListener("resize", updateHeroScrollEffect);

async function loadEvents() {
  const eventList = document.getElementById("events-list");

  if (!eventList) {
    return;
  }

  const fallbackEvents = [
    {
      tag: "Workshop",
      title: "Intro to Club Projects",
      date: "Date coming soon",
      location: "Lincoln Center campus",
      description: "A placeholder event card showing how workshops and club activities will appear once the data source is connected."
    },
    {
      tag: "Community",
      title: "Member Meetup",
      date: "Date coming soon",
      location: "Student space placeholder",
      description: "Use this slot for casual meetups, social events, or open coding sessions that bring the club together."
    },
    {
      tag: "Career",
      title: "Resume and Portfolio Review",
      date: "Date coming soon",
      location: "Room details coming soon",
      description: "A future event idea for helping members refine their resumes, GitHub profiles, and technical portfolios."
    }
  ];

  try {
    const response = await fetch("data/events.json");

    if (!response.ok) {
      throw new Error("Unable to load events");
    }

    const events = await response.json();
    renderEvents(Array.isArray(events) && events.length ? events : fallbackEvents, eventList);
  } catch (error) {
    renderEvents(fallbackEvents, eventList);
  }
}

function renderEvents(events, container) {
  container.innerHTML = events
    .map(
      (event) => `
        <article class="event-card">
          <span class="event-tag">${event.tag}</span>
          <h3>${event.title}</h3>
          <div class="event-meta">
            <span>${event.date}</span>
            <span>${event.location}</span>
          </div>
          <p>${event.description}</p>
          <span class="event-cta">Future admin-ready event slot</span>
        </article>
      `
    )
    .join("");
}

loadEvents();
