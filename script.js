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

const memberModal = document.getElementById("member-detail-modal");
const memberModalName = document.getElementById("member-modal-name");
const memberModalInitials = document.getElementById("member-modal-initials");
const memberModalDescription = document.getElementById("member-modal-description");
const memberModalKicker = document.getElementById("member-modal-kicker");
const memberModalNote = document.getElementById("member-modal-note");
const memberModalPrimaryAction = document.getElementById("member-modal-primary-action");
let memberDirectory = [];
let lastMemberTrigger = null;

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
      name: "Barsat Rithi",
      description: "A starter personal website page that opens from the members hub and can grow into a fuller profile over time.",
      page_url: "members/barsat-rithi.html",
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

async function loadTeamMembers() {
  const teamList = document.getElementById("team-list");

  if (!teamList) {
    return;
  }

  const fallbackTeamMembers = [
    {
      badge: "01",
      role: "President",
      bio: "Photo and leadership bio coming soon.",
    },
    {
      badge: "02",
      role: "Vice President",
      bio: "Photo and leadership bio coming soon.",
    },
    {
      badge: "03",
      role: "Treasurer",
      bio: "Photo and leadership bio coming soon.",
    },
    {
      badge: "04",
      role: "Secretary",
      bio: "Photo and leadership bio coming soon.",
    },
  ];

  const supabaseTeamMembers = await loadTableFromSupabase("team_members", "badge, role, bio", {
    column: "display_order",
    ascending: true,
  });

  renderTeamMembers(
    Array.isArray(supabaseTeamMembers) && supabaseTeamMembers.length ? supabaseTeamMembers : fallbackTeamMembers,
    teamList
  );
}

async function loadSiteLinks() {
  const connectList = document.getElementById("connect-list");

  if (!connectList) {
    return;
  }

  const fallbackSiteLinks = [
    {
      label: "Discord",
      title: "Server link coming soon",
      description: "Use this area for a join link, server invite button, and a short note about what members can expect there.",
      url: null,
    },
    {
      label: "Instagram",
      title: "@fordhamcsclub",
      description: "Perfect for event reminders, workshop recaps, and announcements.",
      url: null,
    },
    {
      label: "Email",
      title: "club email placeholder",
      description: "Add your official contact email here so students and campus partners know where to reach the club.",
      url: null,
    },
  ];

  const supabaseSiteLinks = await loadTableFromSupabase("site_links", "label, title, description, url", {
    column: "display_order",
    ascending: true,
  });

  renderSiteLinks(
    Array.isArray(supabaseSiteLinks) && supabaseSiteLinks.length ? supabaseSiteLinks : fallbackSiteLinks,
    connectList
  );
}

async function loadSiteSettings() {
  const settings = await loadTableFromSupabase("site_settings", "key, value");

  if (!Array.isArray(settings) || !settings.length) {
    return;
  }

  const settingsMap = settings.reduce((accumulator, setting) => {
    accumulator[setting.key] = setting.value;
    return accumulator;
  }, {});

  document.querySelectorAll("[data-setting]").forEach((element) => {
    const key = element.dataset.setting;
    const value = settingsMap[key];

    if (typeof value === "string" && value.length) {
      element.textContent = value;
    }
  });
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

function renderTeamMembers(teamMembers, container) {
  container.innerHTML = teamMembers
    .map(
      (member) => `
        <article class="profile-card reveal is-visible">
          <div class="profile-avatar">${member.badge}</div>
          <h3>${member.role}</h3>
          <p>${member.bio}</p>
        </article>
      `
    )
    .join("");
}

function renderMembers(members, container) {
  memberDirectory = members.map((member) => normalizeMember(member));

  container.innerHTML = memberDirectory
    .map(
      (member, index) => `
        <a class="member-link-card reveal is-visible" href="${member.page_url}" data-open-member data-member-index="${index}">
          <div class="member-icon${index % 2 ? " member-icon-alt" : ""}">${member.initials}</div>
          <div>
            <h3>${member.name}</h3>
            <p>${member.description}</p>
            <span class="member-card-link-label">${member.isExternal ? "Preview personal site" : "Preview member page"}</span>
          </div>
        </a>
      `
    )
    .join("");

  container.querySelectorAll("[data-open-member]").forEach((memberLink) => {
    memberLink.addEventListener("click", handleMemberCardClick);
  });
}

function normalizeMember(member) {
  const pageUrl = String(member.page_url || "").trim();
  const isExternal = /^https?:\/\//i.test(pageUrl);

  return {
    initials: String(member.initials || "?").trim().slice(0, 3) || "?",
    name: String(member.name || "Member").trim() || "Member",
    description: String(member.description || "Profile details coming soon.").trim() || "Profile details coming soon.",
    page_url: pageUrl || "members.html",
    isExternal,
  };
}

function handleMemberCardClick(event) {
  if (!memberModal || event.defaultPrevented) {
    return;
  }

  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const memberIndex = Number(event.currentTarget.dataset.memberIndex);
  const member = memberDirectory[memberIndex];

  if (!member) {
    return;
  }

  event.preventDefault();
  openMemberModal(member, event.currentTarget);
}

function openMemberModal(member, trigger) {
  if (!memberModal) {
    return;
  }

  lastMemberTrigger = trigger || null;
  memberModalInitials.textContent = member.initials;
  memberModalName.textContent = member.name;
  memberModalDescription.textContent = member.description;
  memberModalKicker.textContent = member.isExternal ? "External personal site" : "Club-hosted member page";
  memberModalNote.textContent = member.isExternal
    ? "This card links out to a member's own website, portfolio, or profile outside the club repository."
    : "This member page lives inside the club site, so the student can branch off and keep expanding it here.";
  memberModalPrimaryAction.textContent = member.isExternal ? "Visit Personal Site" : "Open Member Page";
  memberModalPrimaryAction.href = member.page_url;
  memberModalPrimaryAction.target = member.isExternal ? "_blank" : "_self";

  if (member.isExternal) {
    memberModalPrimaryAction.rel = "noreferrer";
  } else {
    memberModalPrimaryAction.removeAttribute("rel");
  }

  memberModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeMemberModal() {
  if (!memberModal || memberModal.hidden) {
    return;
  }

  memberModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastMemberTrigger) {
    lastMemberTrigger.focus();
  }
}

if (memberModal) {
  memberModal.querySelectorAll("[data-member-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", closeMemberModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMemberModal();
    }
  });
}

function renderSiteLinks(siteLinks, container) {
  container.innerHTML = siteLinks
    .map(
      (link) => `
        <article class="connect-card reveal is-visible">
          <span class="connect-label">${link.label}</span>
          <h3>${link.title}</h3>
          <p>${link.description}</p>
          ${link.url ? `<a class="connect-card-link" href="${link.url}" target="_blank" rel="noreferrer">Open Link</a>` : ""}
        </article>
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
loadTeamMembers();
loadSiteLinks();
loadSiteSettings();
