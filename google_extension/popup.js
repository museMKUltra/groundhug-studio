const DEFAULT_DURATION_MINUTES = 30;

const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 100;
const STEP_MINUTES = 5;

const durationInput = document.getElementById("duration");
const durationValue = document.getElementById("duration-value");

const decreaseButton = document.getElementById("decrease");
const increaseButton = document.getElementById("increase");

const quickButtons = document.querySelectorAll(".quick-button");
const status = document.getElementById("status");


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
 * Keep duration within the allowed range.
 */
function clampDuration(duration) {
    return Math.min(
        MAX_DURATION_MINUTES,
        Math.max(MIN_DURATION_MINUTES, duration)
    );
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
 * Slider.
 */
durationInput.addEventListener("input", async () => {
    const duration = Number(durationInput.value);

    durationValue.textContent = duration;
    updateQuickButtons(duration);

    await chrome.storage.local.set({
        durationMinutes: duration
    });
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


/**
 * Load settings when popup opens.
 */
loadDuration();