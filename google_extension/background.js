chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "START_TIMER") {
        const duration = message.duration;

        chrome.alarms.create("tickbun-break", {
            delayInMinutes: duration / 60_000
        });

        console.log("Timer started:", duration);
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "tickbun-break") {
        return;
    }

    console.log('alarm');

    chrome.notifications.create("tickbun-break", {
        type: "basic",
        iconUrl: "icon.png",
        title: "🍅 Time to take a break!",
        message: "Your TickBun work session is finished."
    });

    const tabs = await chrome.tabs.query({
        url: [
            "http://localhost:5173/*",
            "https://spring-api-starter-production-0867.up.railway.app/*"
        ]
    });

    if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, {
            active: true
        });
    }
});
