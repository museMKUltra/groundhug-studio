import {
    clampDuration,
    DEFAULT_DURATION_MINUTES,
    MAX_DURATION_MINUTES,
    MIN_DURATION_MINUTES,
    STEP_MINUTES
} from "./duration.js";

const durationInput = document.getElementById("duration");
const durationValue = document.getElementById("duration-value");

const decreaseButton = document.getElementById("decrease");
const increaseButton = document.getElementById("increase");

const quickButtons = document.querySelectorAll(".quick-button");


/**
 * Apply the shared range to the slider and its labels.
 */
durationInput.min = String(MIN_DURATION_MINUTES);
durationInput.max = String(MAX_DURATION_MINUTES);
durationInput.step = String(STEP_MINUTES);

document.getElementById("duration-min-label").textContent =
    `${MIN_DURATION_MINUTES} min`;
document.getElementById("duration-max-label").textContent =
    `${MAX_DURATION_MINUTES} min`;

updateUI(DEFAULT_DURATION_MINUTES);


/**
 * Load the saved duration.
 */
async function loadDuration() {
    const result = await chrome.storage.local.get(
        "durationMinutes"
    );

    const duration =
        result.durationMinutes ?? DEFAULT_DURATION_MINUTES;

    updateUI(duration);
}


/**
 * Save duration to Chrome storage.
 */
async function saveDuration(duration) {
    const value = clampDuration(duration);

    await chrome.storage.local.set({
        durationMinutes: value
    });

    updateUI(value);
}


/**
 * Update the popup UI.
 */
function updateUI(duration) {
    durationInput.value = duration;
    durationValue.textContent = duration;

    updateQuickButtons(duration);
}


/**
 * Update quick-select button state.
 */
function updateQuickButtons(duration) {
    quickButtons.forEach((button) => {
        const buttonDuration = Number(
            button.dataset.duration
        );

        button.classList.toggle(
            "active",
            buttonDuration === duration
        );
    });
}


/**
 * Slider: preview while dragging, save on release.
 * Saving on every "input" event would reschedule the reminder
 * (and possibly trigger it) for every intermediate value.
 */
durationInput.addEventListener("input", () => {
    const duration = Number(durationInput.value);

    durationValue.textContent = duration;
    updateQuickButtons(duration);
});

durationInput.addEventListener("change", async () => {
    await saveDuration(Number(durationInput.value));
});


/**
 * Keep the popup in sync when the duration changes elsewhere
 * (e.g. from the TickBun web app).
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.durationMinutes) {
        updateUI(
            changes.durationMinutes.newValue ?? DEFAULT_DURATION_MINUTES
        );
    }
});


/**
 * Decrease duration by 5 minutes.
 */
decreaseButton.addEventListener("click", async () => {
    const current = Number(durationInput.value);

    const next = clampDuration(
        current - STEP_MINUTES
    );

    await saveDuration(next);
});


/**
 * Increase duration by 5 minutes.
 */
increaseButton.addEventListener("click", async () => {
    const current = Number(durationInput.value);

    const next = clampDuration(
        current + STEP_MINUTES
    );

    await saveDuration(next);
});


/**
 * Quick duration buttons.
 */
quickButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const duration = Number(
            button.dataset.duration
        );

        await saveDuration(duration);
    });
});


/* ------------------------------------------------------------------ */
/* Session state (public state from the service worker)                */
/* ------------------------------------------------------------------ */

const STATE_KEY = "reminderState";

const sessionStatus = document.getElementById("session-status");
const sessionStarted = document.getElementById("session-started");
const sessionDeadline = document.getElementById("session-deadline");
const sessionElapsed = document.getElementById("session-elapsed");
const sessionRemaining = document.getElementById("session-remaining");
const sessionProgress = document.getElementById("session-progress");
const sessionProgressFill = document.getElementById("session-progress-fill");
const sessionReminder = document.getElementById("session-reminder");
const sessionIdLabel = document.getElementById("session-id");

/** Latest public state received from the service worker. */
let publicState = null;

function formatTime(timestamp) {
    if (timestamp === null || timestamp === undefined) {
        return "—";
    }

    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function describeReminder(state) {
    if (!state.reminderEnabled) {
        return "Off";
    }

    if (state.reminderAcknowledged) {
        return "Acknowledged";
    }

    if (state.reminderTriggered) {
        return "Time's up!";
    }

    return state.status === "RUNNING" ? "Scheduled" : "On";
}

function setStatusBadge(status) {
    sessionStatus.dataset.status = status;
    sessionStatus.textContent = status;
}

function setProgress(ratio, isDue) {
    const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);

    sessionProgressFill.style.width = `${percent}%`;
    sessionProgressFill.classList.toggle("due", isDue);
    sessionProgress.setAttribute("aria-valuenow", String(percent));
}

/**
 * Render the time-dependent rows. Called every second while running.
 */
function renderTimers() {
    const state = publicState;
    const isRunning = state?.status === "RUNNING" && state.startedAt !== null;

    if (!isRunning) {
        sessionElapsed.textContent = "—";
        sessionRemaining.textContent = "—";
        sessionRemaining.classList.remove("due");
        setProgress(0, false);
        return;
    }

    const now = Date.now();

    sessionElapsed.textContent = formatDuration(now - state.startedAt);

    if (state.deadline === null) {
        sessionRemaining.textContent = "—";
        sessionRemaining.classList.remove("due");
        setProgress(0, false);
        return;
    }

    const remaining = state.deadline - now;
    const total = state.deadline - state.startedAt;

    sessionRemaining.textContent = remaining > 0
        ? formatDuration(remaining)
        : "Due";
    sessionRemaining.classList.toggle("due", remaining <= 0);
    setProgress(total > 0 ? (now - state.startedAt) / total : 1, remaining <= 0);
}

function renderSession() {
    const state = publicState;

    if (!state) {
        setStatusBadge("UNAVAILABLE");
        sessionStarted.textContent = "—";
        sessionDeadline.textContent = "—";
        sessionReminder.textContent = "—";
        sessionIdLabel.textContent = "";
        renderTimers();
        return;
    }

    setStatusBadge(state.status);
    sessionStarted.textContent = formatTime(state.startedAt);
    sessionDeadline.textContent = formatTime(state.deadline);
    sessionReminder.textContent = describeReminder(state);
    sessionIdLabel.textContent = state.sessionId
        ? `Session ${state.sessionId}`
        : "";

    renderTimers();
}

async function loadSession() {
    try {
        const response = await chrome.runtime.sendMessage({type: "GET_STATE"});

        publicState = response?.success ? response.state : null;
    } catch (error) {
        console.error("Failed to load TickBun state:", error);
        publicState = null;
    }

    renderSession();
}

/**
 * Re-fetch the public state whenever the worker persists a change
 * (timer start / finish, reminder fired / acknowledged, duration change).
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes[STATE_KEY] || changes.durationMinutes)) {
        loadSession();
    }
});

setInterval(renderTimers, 1000);


/**
 * Load settings and session state when popup opens.
 */
loadDuration();
loadSession();