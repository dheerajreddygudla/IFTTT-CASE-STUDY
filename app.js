// ==========================================
// IFTTT CASE STUDY
// Main JavaScript functionality
// ==========================================


// 1. DEFAULT APPLET DATA

const starterApplets = [
    {
        id: "academic",
        name: "Academic Productivity Hub",
        icon: "▣",
        description: "Organises study sessions, tasks and assignment deadlines.",
        trigger: "A new assignment is added",
        condition: "The deadline is within 7 days",
        action: "Create a reminder",
        enabled: true,
        runs: 12
    },
    {
        id: "opportunity",
        name: "Opportunity Scout",
        icon: "✧",
        description: "Collects internships, competitions and learning opportunities.",
        trigger: "A new opportunity is discovered",
        condition: "Matches selected interests",
        action: "Save the opportunity to drafts",
        enabled: true,
        runs: 8
    },
    {
        id: "energy",
        name: "Energy Leak Detective",
        icon: "ϟ",
        description: "Flags unusual energy usage.",
        trigger: "Energy usage crosses a threshold",
        condition: "Usage is higher than the set limit",
        action: "Show a dashboard notification",
        enabled: true,
        runs: 6
    },
    {
        id: "weather",
        name: "Weather-Aware Campus Planner",
        icon: "☼",
        description: "Suggests schedule adjustments based on weather.",
        trigger: "Weather conditions change",
        condition: "Rain is expected during an activity",
        action: "Create a reminder",
        enabled: false,
        runs: 4
    },
    {
        id: "devops",
        name: "DevOps Build Watchtower",
        icon: "⌘",
        description: "Tracks software build events and records their status.",
        trigger: "A software build completes",
        condition: "Build status is failed",
        action: "Record an activity update",
        enabled: true,
        runs: 10
    }
];


// 2. SAMPLE OPPORTUNITIES

const sampleOpportunities = [
    {
        id: "opp1",
        title: "Student Innovation Challenge",
        type: "Competition",
        detail: "A sample innovation challenge for student project teams.",
        tag: "Innovation"
    },
    {
        id: "opp2",
        title: "Frontend Developer Intern",
        type: "Internship",
        detail: "A sample entry-level web development opportunity.",
        tag: "Web Development"
    },
    {
        id: "opp3",
        title: "AI & Robotics Project Fellowship",
        type: "Program",
        detail: "A sample program focused on AI and robotics projects.",
        tag: "AI / Robotics"
    },
    {
        id: "opp4",
        title: "Open Source Contributor Program",
        type: "Program",
        detail: "A sample opportunity to build software experience.",
        tag: "Development"
    }
];


// 3. INTEGRATIONS

const integrations = [
    ["Google Calendar", "▦", "Calendar events and reminders"],
    ["Gmail", "✉", "Email notifications and updates"],
    ["GitHub", "⌘", "Repository and build activity"],
    ["Weather", "☼", "Weather condition updates"],
    ["Notion", "▤", "Tasks and project tracking"],
    ["Webhooks", "↗", "Connect automation workflows"]
];


// 4. STORAGE

const STORAGE_KEY = "iftttCaseStudy_v2";

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved) {
            return {
                applets: saved.applets?.length
                    ? saved.applets
                    : starterApplets.map(a => ({ ...a })),

                events: saved.events || [],
                activity: saved.activity || [],
                savedOpportunities: saved.savedOpportunities || []
            };
        }
    } catch (error) {
        console.error("Storage error:", error);
    }

    return {
        applets: starterApplets.map(a => ({ ...a })),
        events: [],
        activity: [],
        savedOpportunities: []
    };
}

let state = loadState();

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


// 5. HELPER FUNCTIONS

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function dateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function prettyDate(key, options = {
    weekday: "short",
    month: "short",
    day: "numeric"
}) {
    if (!key) return "";

    const [year, month, day] = key.split("-").map(Number);

    return new Date(year, month - 1, day)
        .toLocaleDateString(undefined, options);
}

let calendarCursor = new Date();
let selectedDate = dateKey(new Date());

let toastTimer;

function toast(message) {
    const element = document.getElementById("toast");

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        element.classList.remove("show");
    }, 2500);
}


// 6. ACTIVITY TRACKING

function addActivity(title, detail) {

    state.activity.unshift({
        id: Date.now() + Math.random(),
        title: title,
        detail: detail,
        time: new Date().toISOString()
    });

    state.activity = state.activity.slice(0, 80);

    saveState();
}


// 7. PAGE NAVIGATION

function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.toggle("active", section.id === page);
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    const names = {
        overview: "Overview",
        applets: "My Applets",
        builder: "Create Applet",
        opportunities: "Opportunity Scout",
        calendar: "Calendar",
        activity: "Activity",
        analytics: "Analytics",
        integrations: "Integrations"
    };

    document.getElementById("page-heading").textContent =
        names[page] || "Overview";

    if (page === "overview") renderOverview();
    if (page === "applets") renderApplets();
    if (page === "opportunities") renderOpportunities();
    if (page === "calendar") renderCalendar();
    if (page === "activity") renderActivity();
    if (page === "analytics") renderAnalytics();
    if (page === "integrations") renderIntegrations();
}


// 8. STATISTICS CARD

function statCard(label, value, description, icon) {

    return `
        <div class="stat-card">

            <div class="stat-top">
                <span>${label}</span>
                <span class="stat-icon">${icon}</span>
            </div>

            <div class="stat-value">${value}</div>

            <div class="stat-sub">${description}</div>

        </div>
    `;
}


// 9. OVERVIEW DASHBOARD

function renderOverview() {

    const enabled = state.applets.filter(a => a.enabled).length;

    const runs = state.applets.reduce(
        (total, a) => total + (a.runs || 0),
        0
    );

    document.getElementById("overview-cards").innerHTML =

        statCard("Total applets", state.applets.length,
            "Automations in workspace", "◈") +

        statCard("Active applets", enabled,
            "Currently enabled", "✓") +

        statCard("Simulated runs", runs,
            "Across all applets", "↗") +

        statCard("Calendar items", state.events.length,
            "Saved events and tasks", "▦");


    document.getElementById("overview-applet-list").innerHTML =
        state.applets.slice(0, 4).map(applet => `

            <div class="compact-item">

                <div class="item-main">
                    <div class="mini-icon">${applet.icon}</div>

                    <div>
                        <b>${escapeHTML(applet.name)}</b>
                        <small>${applet.enabled ? "Enabled" : "Disabled"}</small>
                    </div>
                </div>

                <span class="state ${applet.enabled ? "" : "off"}">
                    ${applet.enabled ? "ON" : "OFF"}
                </span>

            </div>

        `).join("");


    const upcoming = state.events
        .filter(event => event.date >= dateKey(new Date()))
        .sort((a, b) =>
            (a.date + a.time).localeCompare(b.date + b.time)
        )
        .slice(0, 4);


    document.getElementById("upcoming-list").innerHTML =

        upcoming.length

            ? upcoming.map(event => `

                <div class="compact-item">

                    <div class="item-main">
                        <div class="mini-icon">▦</div>

                        <div>
                            <b>${escapeHTML(event.title)}</b>

                            <small>
                                ${prettyDate(event.date)}
                                ${event.time ? " · " + event.time : ""}
                            </small>
                        </div>
                    </div>

                    <span class="tiny muted">${event.type}</span>

                </div>

            `).join("")

            : `<div class="empty-state">
                No upcoming calendar items.
               </div>`;


    document.getElementById("overview-activity").innerHTML =
        activityMarkup(state.activity.slice(0, 4));
}


// 10. APPLET CARDS

function appletCard(applet) {

    return `

        <article class="applet-card">

            <div class="card-top">

                <div class="applet-icon">${applet.icon}</div>

                <span class="state ${applet.enabled ? "" : "off"}">
                    ${applet.enabled ? "ENABLED" : "DISABLED"}
                </span>

            </div>

            <h3>${escapeHTML(applet.name)}</h3>

            <p>${escapeHTML(applet.description || "")}</p>

            <div class="flow-line">

                <b>IF</b> ${escapeHTML(applet.trigger)}<br>

                <b>IF</b>
                ${escapeHTML(applet.condition || "No additional condition")}
                <br>

                <b>THEN</b> ${escapeHTML(applet.action)}

            </div>

            <div class="card-actions">

                <div>
                    <button class="text-btn run-applet"
                        data-id="${applet.id}">
                        ▷ Run demo
                    </button>

                    <span class="tiny muted">
                        ${applet.runs || 0} runs
                    </span>
                </div>

                <button
                    class="toggle ${applet.enabled ? "on" : ""}"
                    data-toggle="${applet.id}">
                </button>

            </div>

        </article>

    `;
}


// 11. RENDER APPLETS

function renderApplets() {

    const search = (
        document.getElementById("applet-search").value
    ).toLowerCase();

    const filter =
        document.getElementById("applet-filter").value;

    const filtered = state.applets.filter(applet => {

        const matchesSearch =
            (applet.name + " " + applet.description)
                .toLowerCase()
                .includes(search);

        const matchesFilter =
            filter === "all" ||
            (filter === "enabled" && applet.enabled) ||
            (filter === "disabled" && !applet.enabled);

        return matchesSearch && matchesFilter;
    });

    document.getElementById("all-cards").innerHTML =

        filtered.length

            ? filtered.map(appletCard).join("")

            : `<div class="panel empty-state">
                No applets match your search.
               </div>`;
}


// 12. RUN APPLET DEMO

function runApplet(id) {

    const applet = state.applets.find(a => a.id === id);

    if (!applet) return;

    if (!applet.enabled) {
        toast("Enable this applet before running it.");
        return;
    }

    applet.runs = (applet.runs || 0) + 1;

    addActivity(
        `${applet.name} ran successfully`,
        `Demo run · Action: ${applet.action}`
    );

    saveState();

    renderApplets();
    renderOverview();
    renderAnalytics();

    toast("Demo applet run recorded.");
}


// 13. ACTIVITY HISTORY

function activityMarkup(items) {

    return items.length

        ? items.map(item => `

            <div class="activity-item">

                <div class="activity-symbol">✓</div>

                <div>
                    <b>${escapeHTML(item.title)}</b>

                    <p>
                        ${escapeHTML(item.detail)}
                        ·
                        ${new Date(item.time).toLocaleString()}
                    </p>
                </div>

            </div>

        `).join("")

        : `<div class="empty-state">
            No activity yet.
           </div>`;
}


function renderActivity() {

    document.getElementById("full-activity").innerHTML =
        activityMarkup(state.activity);
}


// 14. OPPORTUNITY SCOUT

function renderOpportunities() {

    document.getElementById("opportunity-list").innerHTML =

        sampleOpportunities.map(opportunity => {

            const saved = state.savedOpportunities.some(
                item => item.id === opportunity.id
            );

            return `

                <article class="applet-card">

                    <div class="card-top">

                        <div class="applet-icon">✧</div>

                        <span class="sample-label">
                            ${opportunity.type}
                        </span>

                    </div>

                    <h3>${opportunity.title}</h3>

                    <p>${opportunity.detail}</p>

                    <div class="card-actions">

                        <span class="tiny muted">
                            ${opportunity.tag}
                        </span>

                        <button class="save-btn"
                            data-save="${opportunity.id}"
                            ${saved ? "disabled" : ""}>

                            ${saved ? "✓ Saved" : "＋ Save draft"}

                        </button>

                    </div>

                </article>

            `;

        }).join("");


    document.getElementById("saved-opportunities").innerHTML =

        state.savedOpportunities.length

            ? state.savedOpportunities.map(item => `

                <div class="compact-item">

                    <div class="item-main">
                        <div class="mini-icon">✧</div>

                        <div>
                            <b>${escapeHTML(item.title)}</b>
                            <small>${item.type} · Saved draft</small>
                        </div>
                    </div>

                    <button class="text-btn"
                        data-remove-opportunity="${item.id}">
                        Remove
                    </button>

                </div>

            `).join("")

            : `<div class="empty-state">
                No saved drafts yet.
               </div>`;
}


// 15. ANALYTICS

function renderAnalytics() {

    const runs = state.applets.reduce(
        (total, a) => total + (a.runs || 0),
        0
    );

    const enabled = state.applets.filter(a => a.enabled).length;

    document.getElementById("analytics-cards").innerHTML =

        statCard("Total runs", runs,
            "Simulated automation runs", "↗") +

        statCard("Enabled applets", enabled,
            "Currently active", "✓") +

        statCard("Saved opportunities",
            state.savedOpportunities.length,
            "Saved drafts", "✧") +

        statCard("Calendar items",
            state.events.length,
            "Events and deadlines", "▦");


    const maximum = Math.max(
        1,
        ...state.applets.map(a => a.runs || 0)
    );

    document.getElementById("bars").innerHTML =

        state.applets.map(applet => `

            <div class="bar-row">

                <span>${escapeHTML(applet.name)}</span>

                <div class="bar-track">

                    <div class="bar-fill"
                        style="width:${(applet.runs || 0) / maximum * 100}%">
                    </div>

                </div>

                <b>${applet.runs || 0}</b>

            </div>

        `).join("");
}


// 16. INTEGRATIONS

function renderIntegrations() {

    document.getElementById("integration-list").innerHTML =

        integrations.map(item => `

            <article class="integration-card">

                <div class="mini-icon">${item[1]}</div>

                <h3>${item[0]}</h3>

                <p>${item[2]}</p>

                <small>Demo representation</small>

            </article>

        `).join("");
}


// ==========================================
// 17. CALENDAR FUNCTIONALITY
// ==========================================


// Generate the monthly calendar

function renderCalendar() {

    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();

    document.getElementById("calendar-month").textContent =

        calendarCursor.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        });


    const firstDay = new Date(year, month, 1);

    const startDate = new Date(
        year,
        month,
        1 - firstDay.getDay()
    );

    const today = dateKey(new Date());

    let html = "";


    for (let i = 0; i < 42; i++) {

        const current = new Date(startDate);

        current.setDate(startDate.getDate() + i);

        const key = dateKey(current);

        const items = state.events.filter(
            event => event.date === key
        );


        html += `

            <button class="day-cell

                ${current.getMonth() !== month ? "other-month" : ""}

                ${key === selectedDate ? "selected" : ""}

                ${key === today ? "today" : ""}"

                data-date="${key}">

                <span class="day-number">
                    ${current.getDate()}
                </span>

                ${items.slice(0, 2).map(event => `

                    <span class="day-event ${event.type}">
                        ${escapeHTML(event.title)}
                    </span>

                `).join("")}

                ${items.length > 2
                    ? `<span class="tiny muted">+${items.length - 2} more</span>`
                    : ""}

            </button>

        `;
    }


    document.getElementById("calendar-days").innerHTML = html;

    renderSelectedDay();
}


// Display selected date events

function renderSelectedDay() {

    document.getElementById("selected-date-title").textContent =

        prettyDate(selectedDate, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });


    const items = state.events

        .filter(event => event.date === selectedDate)

        .sort((a, b) =>
            (a.time || "").localeCompare(b.time || "")
        );


    document.getElementById("selected-day-events").innerHTML =

        items.length

            ? items.map(event => `

                <div class="compact-item">

                    <div class="item-main">

                        <div class="mini-icon">
                            ${event.type === "assignment" ? "▤" :
                              event.type === "task" ? "✓" : "▦"}
                        </div>

                        <div>

                            <b>${escapeHTML(event.title)}</b>

                            <small>
                                ${event.time || "Time not set"}
                                · ${event.type}
                            </small>

                            ${event.notes
                                ? `<small>${escapeHTML(event.notes)}</small>`
                                : ""}

                        </div>

                    </div>

                    <button class="text-btn"
                        data-delete-event="${event.id}">
                        Delete
                    </button>

                </div>

            `).join("")

            : `<div class="empty-state">
                Nothing scheduled for this date.
               </div>`;
}


// Show calendar event form

function openEventForm() {

    const form = document.getElementById("event-form");

    form.classList.remove("hidden");

    form.elements.date.value = selectedDate;

    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// Close calendar event form

function closeEventForm() {

    document.getElementById("event-form")
        .classList.add("hidden");
}


// ==========================================
// 18. EVENT LISTENERS
// ==========================================


// Navigation

document.addEventListener("click", event => {

    const nav = event.target.closest("[data-page]");

    if (nav) {

        event.preventDefault();

        showPage(nav.dataset.page);

        return;
    }


    const go = event.target.closest("[data-go]");

    if (go) {

        showPage(go.dataset.go);

        return;
    }


    // Enable / Disable applet

    const toggle = event.target.closest("[data-toggle]");

    if (toggle) {

        const applet = state.applets.find(
            a => a.id === toggle.dataset.toggle
        );

        if (applet) {

            applet.enabled = !applet.enabled;

            addActivity(
                `${applet.name} ${applet.enabled ? "enabled" : "disabled"}`,
                "Applet settings updated"
            );

            saveState();

            renderApplets();
            renderOverview();
            renderAnalytics();

            toast(`Applet ${applet.enabled ? "enabled" : "disabled"}.`);
        }

        return;
    }


    // Run applet

    const run = event.target.closest(".run-applet");

    if (run) {

        runApplet(run.dataset.id);

        return;
    }


    // Save opportunity

    const save = event.target.closest("[data-save]");

    if (save) {

        const opportunity = sampleOpportunities.find(
            item => item.id === save.dataset.save
        );

        if (
            opportunity &&
            !state.savedOpportunities.some(
                item => item.id === opportunity.id
            )
        ) {

            state.savedOpportunities.push(opportunity);

            addActivity(
                "Opportunity saved",
                `${opportunity.title} added to saved drafts`
            );

            saveState();

            renderOpportunities();
            renderOverview();
            renderAnalytics();

            toast("Opportunity saved.");
        }

        return;
    }


    // Remove saved opportunity

    const remove = event.target.closest("[data-remove-opportunity]");

    if (remove) {

        state.savedOpportunities =
            state.savedOpportunities.filter(
                item => item.id !== remove.dataset.removeOpportunity
            );

        saveState();

        renderOpportunities();
        renderAnalytics();

        return;
    }


    // Select calendar date

    const day = event.target.closest("[data-date]");

    if (day) {

        selectedDate = day.dataset.date;

        const [year, month] = selectedDate.split("-").map(Number);

        if (
            year !== calendarCursor.getFullYear() ||
            month - 1 !== calendarCursor.getMonth()
        ) {
            calendarCursor = new Date(year, month - 1, 1);
        }

        renderCalendar();

        return;
    }


    // Delete calendar event

    const deleteEvent = event.target.closest("[data-delete-event]");

    if (deleteEvent) {

        state.events = state.events.filter(
            item => String(item.id) !== deleteEvent.dataset.deleteEvent
        );

        addActivity(
            "Calendar item deleted",
            "A calendar item was removed"
        );

        saveState();

        renderCalendar();
        renderOverview();
        renderAnalytics();

        toast("Calendar item deleted.");
    }

});


// ==========================================
// 19. APPLET SEARCH
// ==========================================

document.getElementById("applet-search")
    .addEventListener("input", renderApplets);

document.getElementById("applet-filter")
    .addEventListener("change", renderApplets);


// ==========================================
// 20. CREATE APPLET
// ==========================================

function updatePreview() {

    const form = document.getElementById("builder-form");

    document.getElementById("preview-trigger").textContent =
        form.elements.trigger.value || "Choose a trigger";

    document.getElementById("preview-condition").textContent =
        form.elements.condition.value || "Optional condition";

    document.getElementById("preview-action").textContent =
        form.elements.action.value || "Choose an action";
}


document.getElementById("builder-form")
    .addEventListener("input", updatePreview);

document.getElementById("builder-form")
    .addEventListener("change", updatePreview);


document.getElementById("builder-form")
    .addEventListener("submit", event => {

        event.preventDefault();

        const form = event.currentTarget;

        const data = new FormData(form);


        const applet = {

            id: "custom-" + Date.now(),

            name: data.get("name").trim(),

            icon: "⚡",

            description:
                data.get("description").trim() ||
                "Custom automation created in this workspace.",

            trigger: data.get("trigger"),

            condition: data.get("condition").trim(),

            action: data.get("action"),

            enabled: true,

            runs: 0
        };


        state.applets.push(applet);

        addActivity(
            "New applet created",
            `${applet.name} was added to My Applets`
        );

        saveState();

        form.reset();

        updatePreview();

        showPage("applets");

        toast("Your applet was created.");

    });


// ==========================================
// 21. CALENDAR EVENT CREATION
// ==========================================

document.getElementById("show-event-form")
    .addEventListener("click", openEventForm);

document.getElementById("close-event-form")
    .addEventListener("click", closeEventForm);

document.getElementById("cancel-event")
    .addEventListener("click", closeEventForm);


document.getElementById("event-form")
    .addEventListener("submit", event => {

        event.preventDefault();

        const form = event.currentTarget;

        const data = new FormData(form);


        const item = {

            id: String(Date.now()),

            title: data.get("title").trim(),

            type: data.get("type"),

            date: data.get("date"),

            time: data.get("time"),

            notes: data.get("notes").trim()

        };


        state.events.push(item);

        selectedDate = item.date;

        const [year, month] = item.date.split("-").map(Number);

        calendarCursor = new Date(year, month - 1, 1);


        addActivity(
            "Calendar item added",
            `${item.title} · ${prettyDate(item.date)}`
        );


        saveState();

        form.reset();

        closeEventForm();

        renderCalendar();
        renderOverview();
        renderAnalytics();

        toast("Added to your calendar.");

    });


// ==========================================
// 22. CALENDAR NAVIGATION
// ==========================================

document.getElementById("prev-month")
    .addEventListener("click", () => {

        calendarCursor.setMonth(
            calendarCursor.getMonth() - 1
        );

        renderCalendar();

    });


document.getElementById("next-month")
    .addEventListener("click", () => {

        calendarCursor.setMonth(
            calendarCursor.getMonth() + 1
        );

        renderCalendar();

    });


document.getElementById("today-btn")
    .addEventListener("click", () => {

        calendarCursor = new Date();

        selectedDate = dateKey(new Date());

        renderCalendar();

    });


// ==========================================
// 23. CLEAR ACTIVITY
// ==========================================

document.getElementById("clear-activity")
    .addEventListener("click", () => {

        if (confirm("Clear all activity history?")) {

            state.activity = [];

            saveState();

            renderActivity();
            renderOverview();

        }

    });


// ==========================================
// 24. INITIALIZE WEBSITE
// ==========================================

renderIntegrations();

renderOverview();

renderApplets();

renderOpportunities();

renderActivity();

renderAnalytics();

renderCalendar();