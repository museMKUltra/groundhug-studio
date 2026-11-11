import {Button, Snackbar} from "@mui/material";
import {useRegisterSW} from "virtual:pwa-register/react";

/** Check for a new deployment every hour while the app stays open. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and offers to reload when a new version
 * is available. Updates are not applied automatically, because a reload
 * would close the break-reminder PiP window mid-cycle.
 */
export default function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            if (!registration) return;

            setInterval(() => {
                // Skip while offline or mid-install.
                if (registration.installing || !navigator.onLine) return;

                fetch(swUrl, {cache: "no-store", headers: {"cache-control": "no-cache"}})
                    .then((response) => {
                        if (response.status === 200) {
                            return registration.update();
                        }
                    })
                    .catch((error) => console.warn("Service worker update check failed:", error));
            }, UPDATE_CHECK_INTERVAL_MS);
        },
        onRegisterError(error) {
            console.error("Service worker registration failed:", error);
        },
    });

    return (
        <Snackbar
            open={needRefresh}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            message="A new version of TickBun is available."
            action={
                <>
                    <Button color="inherit" size="small" onClick={() => setNeedRefresh(false)}>
                        Later
                    </Button>
                    <Button color="secondary" size="small" onClick={() => updateServiceWorker(true)}>
                        Reload
                    </Button>
                </>
            }
        />
    );
}
