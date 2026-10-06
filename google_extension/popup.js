document
    .getElementById("start")
    .addEventListener("click", () => {
        console.log('click');
        chrome.runtime.sendMessage({
            type: "START_TIMER",
            duration: 10_000
        });
    });