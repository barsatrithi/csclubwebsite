const adminLoginForm = document.getElementById("admin-login-form");
const adminRecoveryButton = document.getElementById("admin-recovery-button");
const adminLogoutButton = document.getElementById("admin-logout-button");
const adminStatus = document.getElementById("admin-status");
const adminDashboard = document.getElementById("admin-dashboard");
const adminEventForm = document.getElementById("admin-event-form");
const adminEventResetButton = document.getElementById("admin-event-reset-button");
const adminEventRefreshButton = document.getElementById("admin-event-refresh-button");
const adminEventStatus = document.getElementById("admin-event-status");
const adminEventList = document.getElementById("admin-event-list");

const adminClient = createAdminClient();
let approvedAdmin = null;

if (adminClient && adminLoginForm && adminDashboard && adminEventForm && adminEventList) {
  setAdminStatus("Sign in with an approved admin email.");
  adminLoginForm.addEventListener("submit", handleAdminLogin);
  adminRecoveryButton?.addEventListener("click", handlePasswordRecovery);
  adminLogoutButton?.addEventListener("click", handleAdminLogout);
  adminEventForm.addEventListener("submit", handleEventSave);
  adminEventResetButton?.addEventListener("click", resetEventForm);
  adminEventRefreshButton?.addEventListener("click", loadAdminEvents);

  adminClient.auth.onAuthStateChange(async (_event, session) => {
    await updateAdminSessionState(session);
  });

  initializeAdmin();
}

function createAdminClient() {
  const config = window.supabaseConfig;
  const supabaseBrowser = window.supabase;

  if (!config?.url || !config?.anonKey || !supabaseBrowser?.createClient) {
    return null;
  }

  return supabaseBrowser.createClient(config.url, config.anonKey);
}

async function initializeAdmin() {
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

  const { error } = await adminClient.auth.signInWithPassword({ email, password });

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  adminLoginForm.reset();
  setAdminStatus("Signed in. Checking admin approval...");
}

async function handlePasswordRecovery() {
  const emailInput = adminLoginForm.querySelector('input[name="email"]');
  const email = String(emailInput?.value || "").trim();

  if (!email) {
    setAdminStatus("Enter the admin email first, then click Password Reset.", true);
    return;
  }

  setAdminStatus("Sending password reset email...");

  const { error } = await adminClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href,
  });

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  setAdminStatus("Password reset email sent. Open the link from the email and then return here to sign in.");
}

async function handleAdminLogout() {
  const { error } = await adminClient.auth.signOut();

  if (error) {
    setAdminStatus(error.message, true);
    return;
  }

  approvedAdmin = null;
  adminDashboard.hidden = true;
  adminLogoutButton.hidden = true;
  adminEventList.innerHTML = "";
  setAdminStatus("Signed out.");
}

async function updateAdminSessionState(session) {
  if (!session?.user) {
    approvedAdmin = null;
    adminDashboard.hidden = true;
    adminLogoutButton.hidden = true;
    adminEventList.innerHTML = "";
    setEventStatus("");
    return;
  }

  setAdminStatus("Signed in. Verifying admin access...");
  const adminRecord = await fetchApprovedAdmin(session.user);

  if (!adminRecord) {
    approvedAdmin = null;
    adminDashboard.hidden = true;
    adminLogoutButton.hidden = true;
    setAdminStatus("This account is authenticated, but it is not approved in admin_users.", true);
    await adminClient.auth.signOut();
    return;
  }

  approvedAdmin = adminRecord;
  adminDashboard.hidden = false;
  adminLogoutButton.hidden = false;
  await syncAdminUserId(session.user, adminRecord);
  setAdminStatus(`Signed in as ${adminRecord.name || session.user.email}`);
  await loadAdminEvents();
}

async function fetchApprovedAdmin(user) {
  const email = String(user.email || "").trim().toLowerCase();

  if (!email) {
    return null;
  }

  const byUserId = await adminClient
    .from("admin_users")
    .select("email, name, role, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUserId.error) {
    setAdminStatus(`Could not verify admin access: ${byUserId.error.message}`, true);
    return null;
  }

  if (byUserId.data) {
    return byUserId.data;
  }

  const { data, error } = await adminClient
    .from("admin_users")
    .select("email, name, role, user_id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    setAdminStatus(`Could not verify admin access: ${error.message}`, true);
    return null;
  }

  return data || null;
}

async function syncAdminUserId(user, adminRecord) {
  if (!user?.id || !adminRecord?.email || adminRecord.user_id === user.id) {
    return;
  }

  const { error } = await adminClient
    .from("admin_users")
    .update({ user_id: user.id })
    .eq("email", adminRecord.email);

  if (error) {
    setAdminStatus(`Signed in, but could not sync admin profile: ${error.message}`, true);
  }
}

async function loadAdminEvents() {
  setEventStatus("Loading events...");
  const { data, error } = await adminClient
    .from("events")
    .select("id, title, tag, description, location, starts_at, ends_at, flyer_path, flyer_url, registration_url, is_published, created_at, updated_at")
    .order("starts_at", { ascending: true });

  if (error) {
    setAdminStatus(`Admin access is valid, but events could not load: ${error.message}`, true);
    setEventStatus(error.message, true);
    return;
  }

  setEventStatus("");
  renderAdminEvents(data || []);
}

function renderAdminEvents(events) {
  if (!events.length) {
    adminEventList.innerHTML = `<div class="admin-empty-state">No events yet. Create your first one using the form.</div>`;
    return;
  }

  adminEventList.innerHTML = events
    .map(
      (event) => `
        <article class="admin-event-card">
          <div class="admin-event-card-copy">
            <span class="event-tag">${escapeHtml(event.tag)}</span>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.description)}</p>
            <div class="event-meta">
              <span>${formatEventDate(event.starts_at, event.ends_at)}</span>
              <span>${escapeHtml(event.location)}</span>
            </div>
            <p class="admin-event-card-status">${event.is_published ? "Published" : "Draft"}</p>
            ${event.flyer_url ? `<a class="connect-card-link" href="${escapeAttribute(event.flyer_url)}" target="_blank" rel="noreferrer">Open Flyer</a>` : ""}
          </div>
          <div class="admin-auth-actions">
            <button class="button button-secondary" type="button" data-action="edit-event" data-id="${event.id}">Edit</button>
            <button class="button button-secondary" type="button" data-action="delete-event" data-id="${event.id}" data-flyer-path="${escapeAttribute(event.flyer_path || "")}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  adminEventList.querySelectorAll('[data-action="edit-event"]').forEach((button) => {
    button.addEventListener("click", () => populateEventForm(events.find((event) => String(event.id) === button.dataset.id)));
  });

  adminEventList.querySelectorAll('[data-action="delete-event"]').forEach((button) => {
    button.addEventListener("click", () => deleteEventRecord(button.dataset.id, button.dataset.flyerPath || ""));
  });
}

function populateEventForm(event) {
  if (!event) {
    return;
  }

  adminEventForm.elements.id.value = event.id;
  adminEventForm.elements.title.value = event.title || "";
  adminEventForm.elements.tag.value = event.tag || "";
  adminEventForm.elements.description.value = event.description || "";
  adminEventForm.elements.location.value = event.location || "";
  adminEventForm.elements.starts_at.value = toDateTimeLocalValue(event.starts_at);
  adminEventForm.elements.ends_at.value = toDateTimeLocalValue(event.ends_at);
  adminEventForm.elements.registration_url.value = event.registration_url || "";
  adminEventForm.elements.existing_flyer_path.value = event.flyer_path || "";
  adminEventForm.elements.existing_flyer_url.value = event.flyer_url || "";
  adminEventForm.elements.is_published.checked = Boolean(event.is_published);
  adminEventForm.elements.flyer.value = "";
  setEventStatus(`Editing "${event.title}".`);
}

function resetEventForm() {
  adminEventForm.reset();
  adminEventForm.elements.id.value = "";
  adminEventForm.elements.existing_flyer_path.value = "";
  adminEventForm.elements.existing_flyer_url.value = "";
  setEventStatus("Event form cleared.");
}

async function handleEventSave(event) {
  event.preventDefault();

  if (!approvedAdmin) {
    setEventStatus("You must be signed in as an approved admin.", true);
    return;
  }

  const formData = new FormData(adminEventForm);
  const existingFlyerPath = String(formData.get("existing_flyer_path") || "");
  const existingFlyerUrl = String(formData.get("existing_flyer_url") || "");
  const flyerFile = formData.get("flyer");

  setEventStatus("Saving event...");

  let flyerPath = existingFlyerPath || null;
  let flyerUrl = existingFlyerUrl || null;

  if (flyerFile instanceof File && flyerFile.size > 0) {
    const uploadedFlyer = await uploadEventFlyer(flyerFile, formData.get("title"));

    if (!uploadedFlyer) {
      return;
    }

    flyerPath = uploadedFlyer.path;
    flyerUrl = uploadedFlyer.url;
  }

  const payload = {
    title: String(formData.get("title") || "").trim(),
    tag: String(formData.get("tag") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    starts_at: formatForDatabase(formData.get("starts_at")),
    ends_at: formData.get("ends_at") ? formatForDatabase(formData.get("ends_at")) : null,
    registration_url: String(formData.get("registration_url") || "").trim() || null,
    flyer_path: flyerPath,
    flyer_url: flyerUrl,
    is_published: formData.get("is_published") === "on",
  };

  const id = String(formData.get("id") || "").trim();

  if (id) {
    payload.id = Number(id);
  }

  const { error } = await adminClient
    .from("events")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    setAdminStatus(`Event save failed: ${error.message}`, true);
    setEventStatus(error.message, true);
    return;
  }

  setAdminStatus("Event saved successfully.");
  setEventStatus("Event saved.");
  resetEventForm();
  await loadAdminEvents();
}

async function uploadEventFlyer(file, titleValue) {
  const safeTitle = String(titleValue || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "event";
  const extension = (file.name.split(".").pop() || "png").toLowerCase();
  const filePath = `${Date.now()}-${safeTitle}.${extension}`;

  const { error: uploadError } = await adminClient.storage
    .from("event-flyers")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    setAdminStatus(`Flyer upload failed: ${uploadError.message}`, true);
    setEventStatus(uploadError.message, true);
    return null;
  }

  const { data } = adminClient.storage.from("event-flyers").getPublicUrl(filePath);

  return {
    path: filePath,
    url: data.publicUrl,
  };
}

async function deleteEventRecord(idValue, flyerPath) {
  setEventStatus("Deleting event...");

  const { error } = await adminClient
    .from("events")
    .delete()
    .eq("id", Number(idValue));

  if (error) {
    setAdminStatus(`Delete failed: ${error.message}`, true);
    setEventStatus(error.message, true);
    return;
  }

  if (flyerPath) {
    await adminClient.storage.from("event-flyers").remove([flyerPath]);
  }

  if (String(adminEventForm.elements.id.value) === String(idValue)) {
    resetEventForm();
  }

  setEventStatus("Event deleted.");
  await loadAdminEvents();
}

function setAdminStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.dataset.state = isError ? "error" : "default";
}

function setEventStatus(message, isError = false) {
  adminEventStatus.textContent = message;
  adminEventStatus.dataset.state = isError ? "error" : "default";
}

function formatForDatabase(value) {
  if (!value) {
    return null;
  }

  return new Date(String(value)).toISOString();
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatEventDate(startsAt, endsAt) {
  const startDate = new Date(startsAt);

  if (Number.isNaN(startDate.getTime())) {
    return "Date to be announced";
  }

  const datePart = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startTime = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!endsAt) {
    return `${datePart} • ${startTime}`;
  }

  const endDate = new Date(endsAt);

  if (Number.isNaN(endDate.getTime())) {
    return `${datePart} • ${startTime}`;
  }

  const endTime = endDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${datePart} • ${startTime} - ${endTime}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
