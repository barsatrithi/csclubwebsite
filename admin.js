const adminLoginForm = document.getElementById("admin-login-form");
const adminLogoutButton = document.getElementById("admin-logout-button");
const adminStatus = document.getElementById("admin-status");
const adminDashboard = document.getElementById("admin-dashboard");
const adminSections = document.getElementById("admin-sections");

const adminClient = createSupabaseClient();

const adminTableConfigs = [
  {
    table: "site_settings",
    title: "Site Settings",
    description: "Shared branding, headings, and intro copy used across the site.",
    primaryKey: "key",
    orderBy: { column: "key", ascending: true },
    allowDelete: false,
    fields: [
      { name: "key", label: "Key", type: "text", required: true },
      { name: "value", label: "Value", type: "textarea", required: true },
    ],
  },
  {
    table: "events",
    title: "Events",
    description: "Upcoming workshops, meetups, and club programming.",
    primaryKey: "id",
    orderBy: { column: "id", ascending: true },
    fields: [
      { name: "tag", label: "Tag", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "date", label: "Date", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
  },
  {
    table: "team_members",
    title: "Team Members",
    description: "Leadership cards for the Meet the Team page.",
    primaryKey: "id",
    orderBy: { column: "display_order", ascending: true },
    fields: [
      { name: "badge", label: "Badge", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea", required: true },
      { name: "display_order", label: "Display Order", type: "number", required: true },
    ],
  },
  {
    table: "site_links",
    title: "Site Links",
    description: "Discord, Instagram, email, and other public contact links.",
    primaryKey: "id",
    orderBy: { column: "display_order", ascending: true },
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "url", label: "URL", type: "url" },
      { name: "display_order", label: "Display Order", type: "number", required: true },
    ],
  },
  {
    table: "resources",
    title: "Resources",
    description: "Support links and learning resources shown on the Resources page.",
    primaryKey: "id",
    orderBy: { column: "display_order", ascending: true },
    fields: [
      { name: "category", label: "Category", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "url", label: "URL", type: "url" },
      { name: "display_order", label: "Display Order", type: "number", required: true },
    ],
  },
  {
    table: "members",
    title: "Members",
    description: "Cards and profile links for the member hub.",
    primaryKey: "id",
    orderBy: { column: "display_order", ascending: true },
    fields: [
      { name: "initials", label: "Initials", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "page_url", label: "Page URL", type: "text", required: true },
      { name: "is_public", label: "Public", type: "checkbox" },
      { name: "display_order", label: "Display Order", type: "number", required: true },
    ],
  },
];

if (adminClient && adminLoginForm && adminSections) {
  setAdminStatus("Sign in to continue.");
  adminLoginForm.addEventListener("submit", handleAdminLogin);
  adminLogoutButton?.addEventListener("click", handleAdminLogout);
  adminSections.addEventListener("submit", handleRecordSave);
  adminSections.addEventListener("click", handleAdminClick);

  adminClient.auth.onAuthStateChange(async (_event, session) => {
    await updateAdminSessionState(session);
  });

  initializeAdminDashboard();
}

async function initializeAdminDashboard() {
  const { data, error } = await adminClient.auth.getSession();

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  await updateAdminSessionState(data.session);
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  setAdminStatus("Signing in...");

  const { error } = await adminClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  adminLoginForm.reset();
  setAdminStatus("Signed in.");
}

async function handleAdminLogout() {
  const { error } = await adminClient.auth.signOut();

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  setAdminStatus("Signed out.");
}

async function updateAdminSessionState(session) {
  const isSignedIn = Boolean(session?.user);

  adminDashboard.hidden = !isSignedIn;
  adminLogoutButton.hidden = !isSignedIn;

  if (!isSignedIn) {
    adminSections.innerHTML = "";
    return;
  }

  setAdminStatus(`Signed in as ${session.user.email}`);
  await loadAdminData();
}

async function loadAdminData() {
  const sectionMarkup = await Promise.all(
    adminTableConfigs.map(async (config) => renderAdminSection(config, await fetchAdminRows(config)))
  );

  adminSections.innerHTML = sectionMarkup.join("");
}

async function fetchAdminRows(config) {
  let query = adminClient.from(config.table).select(buildSelectColumns(config));

  if (config.orderBy?.column) {
    query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending !== false });
  }

  const { data, error } = await query;

  if (error) {
    setAdminStatus(`Failed to load ${config.title.toLowerCase()}: ${error.message}`, true);
    return [];
  }

  return data || [];
}

function renderAdminSection(config, rows) {
  const recordsMarkup = rows.length
    ? rows.map((row) => renderRecordCard(config, row, false)).join("")
    : `<div class="admin-empty-state">No records yet.</div>`;

  return `
    <section class="admin-section">
      <div class="admin-section-heading">
        <div>
          <h3>${config.title}</h3>
          <p>${config.description}</p>
        </div>
        <button class="button button-secondary admin-refresh-button" type="button" data-action="refresh-section" data-table="${config.table}">
          Refresh
        </button>
      </div>
      <div class="admin-record-grid" id="section-${config.table}">
        ${recordsMarkup}
        ${renderRecordCard(config, {}, true)}
      </div>
    </section>
  `;
}

function renderRecordCard(config, row, isNew) {
  const identifier = isNew ? "new" : escapeHtml(String(row[config.primaryKey]));
  const actionLabel = isNew ? "Add Record" : "Save Changes";
  const cardTitle = isNew ? `New ${config.title.slice(0, -1) || config.title}` : `${config.title.slice(0, -1) || config.title} #${identifier}`;

  return `
    <form class="admin-record-card" data-table="${config.table}" data-mode="${isNew ? "create" : "edit"}" data-primary-key="${config.primaryKey}" data-primary-value="${identifier}">
      <div class="admin-record-header">
        <h4>${cardTitle}</h4>
        ${!isNew && config.allowDelete !== false ? `<button class="button button-secondary admin-delete-button" type="button" data-action="delete-record">Delete</button>` : ""}
      </div>
      <div class="admin-record-fields">
        ${config.fields.map((field) => renderAdminField(field, row[field.name], isNew && field.name === config.primaryKey && config.primaryKey === "id")).join("")}
      </div>
      <button class="button button-primary" type="submit">${actionLabel}</button>
    </form>
  `;
}

function renderAdminField(field, value, skipField) {
  if (skipField) {
    return "";
  }

  if (field.type === "checkbox") {
    return `
      <label class="admin-field admin-checkbox-field">
        <input type="checkbox" name="${field.name}" ${value ? "checked" : ""}>
        <span>${field.label}</span>
      </label>
    `;
  }

  const safeValue = typeof value === "string" || typeof value === "number" ? escapeHtml(String(value)) : "";
  const required = field.required ? "required" : "";
  const isLockedSettingKey = field.name === "key" && safeValue.length > 0;
  const readOnly = isLockedSettingKey ? "readonly" : "";

  if (field.type === "textarea") {
    return `
      <label class="admin-field">
        <span>${field.label}</span>
        <textarea name="${field.name}" ${required} ${readOnly}>${safeValue}</textarea>
      </label>
    `;
  }

  return `
    <label class="admin-field">
      <span>${field.label}</span>
      <input type="${field.type || "text"}" name="${field.name}" value="${safeValue}" ${required} ${readOnly}>
    </label>
  `;
}

async function handleRecordSave(event) {
  event.preventDefault();

  const form = event.target.closest(".admin-record-card");

  if (!form) {
    return;
  }

  const table = form.dataset.table;
  const config = adminTableConfigs.find((item) => item.table === table);

  if (!config) {
    return;
  }

  const formData = new FormData(form);
  const payload = {};

  config.fields.forEach((field) => {
    if (field.type === "checkbox") {
      payload[field.name] = formData.get(field.name) === "on";
      return;
    }

    const rawValue = formData.get(field.name);

    if (rawValue === null) {
      return;
    }

    const stringValue = String(rawValue).trim();

    if (!stringValue.length && !field.required) {
      payload[field.name] = null;
      return;
    }

    if (field.type === "number") {
      payload[field.name] = Number(stringValue);
      return;
    }

    payload[field.name] = stringValue;
  });

  if (form.dataset.mode === "edit" && config.primaryKey !== "key") {
    payload[config.primaryKey] = Number(form.dataset.primaryValue);
  }

  if (form.dataset.mode === "edit" && config.primaryKey === "key") {
    payload[config.primaryKey] = form.dataset.primaryValue;
  }

  setAdminStatus(`Saving ${config.title.toLowerCase()}...`);

  const { error } = await adminClient
    .from(config.table)
    .upsert(payload, { onConflict: config.primaryKey });

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  setAdminStatus(`${config.title} saved.`);
  await refreshAdminSection(config.table);
}

async function handleAdminClick(event) {
  const actionTarget = event.target.closest("[data-action]");

  if (!actionTarget) {
    return;
  }

  const action = actionTarget.dataset.action;
  const card = actionTarget.closest(".admin-record-card");

  if (action === "refresh-section") {
    await refreshAdminSection(actionTarget.dataset.table);
    return;
  }

  if (action === "delete-record" && card) {
    await deleteAdminRecord(card);
  }
}

async function deleteAdminRecord(card) {
  const table = card.dataset.table;
  const primaryKey = card.dataset.primaryKey;
  const primaryValue = card.dataset.primaryValue;
  const config = adminTableConfigs.find((item) => item.table === table);

  if (!config) {
    return;
  }

  const parsedValue = primaryKey === "id" ? Number(primaryValue) : primaryValue;

  setAdminStatus(`Deleting ${config.title.toLowerCase()} record...`);

  const { error } = await adminClient
    .from(table)
    .delete()
    .eq(primaryKey, parsedValue);

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  setAdminStatus("Record deleted.");
  await refreshAdminSection(table);
}

async function refreshAdminSection(table) {
  const config = adminTableConfigs.find((item) => item.table === table);

  if (!config) {
    return;
  }

  const sectionContainer = document.getElementById(`section-${table}`)?.closest(".admin-section");

  if (!sectionContainer) {
    await loadAdminData();
    return;
  }

  sectionContainer.outerHTML = renderAdminSection(config, await fetchAdminRows(config));
}

function buildSelectColumns(config) {
  const columns = new Set([config.primaryKey, ...config.fields.map((field) => field.name)]);
  return Array.from(columns).join(", ");
}

function setAdminStatus(message, isError = false) {
  if (!adminStatus) {
    return;
  }

  adminStatus.textContent = message;
  adminStatus.dataset.state = isError ? "error" : "default";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
