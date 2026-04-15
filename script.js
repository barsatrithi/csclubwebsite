const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const currentPage = document.body.dataset.page;

if (navLinks && currentPage) {
  navLinks.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });
}

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

  const supabaseEvents = await loadEventsFromSupabase();

  if (Array.isArray(supabaseEvents) && supabaseEvents.length) {
    renderEvents(supabaseEvents, eventList);
    return;
  }

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

async function loadMembers() {
  const membersList = document.getElementById("members-list");

  if (!membersList) {
    return;
  }

  const fallbackMembers = [
    {
      initials: "BR",
      name: "Example Member Page",
      description: "A starter personal page placeholder that can become your example profile once you send your details.",
      page_url: "members/example-member.html",
    },
    {
      initials: "?",
      name: "How to Build Your Page",
      description: "A future article-style tutorial placeholder for students to follow step by step.",
      page_url: "members/how-to-build-your-page.html",
    },
    {
      initials: "TP",
      name: "Member Template",
      description: "A starter file members can eventually copy when the profile-page project officially launches.",
      page_url: "members/member-template.html",
    },
  ];

  const supabaseMembers = await loadTableFromSupabase("members", "initials, name, description, page_url", {
    column: "display_order",
    ascending: true,
  });

  renderMembers(
    Array.isArray(supabaseMembers) && supabaseMembers.length ? supabaseMembers : fallbackMembers,
    membersList
  );
}

async function loadResources() {
  const resourcesList = document.getElementById("resources-list");

  if (!resourcesList) {
    return;
  }

  const fallbackResources = [
    {
      category: "On-Campus Support",
      title: "Tutoring location placeholder",
      description: "Add the tutoring room or department office once confirmed.",
    },
    {
      category: "On-Campus Support",
      title: "Peer help / office hours placeholder",
      description: "Use this for office hours, peer support sessions, or study groups.",
    },
    {
      category: "On-Campus Support",
      title: "Faculty and department support placeholder",
      description: "List helpful faculty contacts or department resources here.",
    },
    {
      category: "Online Learning Resources",
      title: "Programming practice links placeholder",
      description: "Swap in LeetCode, HackerRank, Exercism, or other practice platforms.",
    },
    {
      category: "Online Learning Resources",
      title: "Course support references placeholder",
      description: "Use this for notes, tutorials, and study references tied to coursework.",
    },
    {
      category: "Online Learning Resources",
      title: "Internship and career prep links placeholder",
      description: "Add resume, interview, or internship resources here.",
    },
  ];

  const supabaseResources = await loadTableFromSupabase("resources", "category, title, description, url", {
    column: "display_order",
    ascending: true,
  });

  renderResources(
    Array.isArray(supabaseResources) && supabaseResources.length ? supabaseResources : fallbackResources,
    resourcesList
  );
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

function renderMembers(members, container) {
  container.innerHTML = members
    .map(
      (member, index) => `
        <a class="member-link-card reveal is-visible" href="${member.page_url}">
          <div class="member-icon${index % 2 ? " member-icon-alt" : ""}">${member.initials}</div>
          <div>
            <h3>${member.name}</h3>
            <p>${member.description}</p>
          </div>
        </a>
      `
    )
    .join("");
}

function renderResources(resources, container) {
  const groupedResources = resources.reduce((groups, resource) => {
    const category = resource.category || "Resources";
    groups[category] = groups[category] || [];
    groups[category].push(resource);
    return groups;
  }, {});

  container.innerHTML = Object.entries(groupedResources)
    .map(
      ([category, items]) => `
        <article class="resource-panel reveal is-visible">
          <h3>${category}</h3>
          <ul>
            ${items
              .map((item) => {
                const label = item.url
                  ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>`
                  : item.title;

                return `<li><strong>${label}</strong><br>${item.description}</li>`;
              })
              .join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function createSupabaseClient() {
  const config = window.supabaseConfig;
  const supabaseBrowser = window.supabase;

  if (!config || !config.url || !config.anonKey || !supabaseBrowser?.createClient) {
    return null;
  }

  return supabaseBrowser.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function loadTableFromSupabase(tableName, columns, orderBy) {
  const client = createSupabaseClient();

  if (!client) {
    return null;
  }

  try {
    let query = client.from(tableName).select(columns);

    if (orderBy?.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`Supabase ${tableName} load failed, falling back to local content.`, error);
    return null;
  }
}

async function loadEventsFromSupabase() {
  return loadTableFromSupabase("events", "tag, title, date, location, description", {
    column: "id",
    ascending: true,
  });
}

loadEvents();
loadMembers();
loadResources();
