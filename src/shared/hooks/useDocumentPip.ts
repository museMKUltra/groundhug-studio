import {useCallback, useEffect, useState} from "react";

/**
 * Document Picture-in-Picture API (Chromium 116+).
 * Not yet part of TypeScript's DOM lib.
 */
interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
    preferInitialWindowPlacement?: boolean;
}

interface DocumentPictureInPicture extends EventTarget {
    readonly window: Window | null;
    requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
}

declare global {
    interface Window {
        documentPictureInPicture?: DocumentPictureInPicture;
    }
}

export function isDocumentPipSupported() {
    return typeof window !== "undefined" && "documentPictureInPicture" in window;
}

/**
 * Open / close a Document PiP window. Render into it with a portal.
 * `open` must be called from a user gesture (e.g. a click).
 */
export function useDocumentPip(
    options?: DocumentPictureInPictureOptions & { title?: string }
) {
    const [pipWindow, setPipWindow] = useState<Window | null>(null);
    const isSupported = isDocumentPipSupported();

    const width = options?.width;
    const height = options?.height;
    const title = options?.title;

    const open = useCallback(async () => {
        const api = window.documentPictureInPicture;
        if (!api) return null;

        // Only one PiP window per page; reuse it if already open.
        if (api.window) {
            api.window.focus();
            setPipWindow(api.window);
            return api.window;
        }

        const win = await api.requestWindow({width, height});

        if (title) {
            win.document.title = title;
        }

        win.addEventListener("pagehide", () => setPipWindow(null), {once: true});
        setPipWindow(win);

        return win;
    }, [width, height, title]);

    const close = useCallback(() => {
        pipWindow?.close();
        setPipWindow(null);
    }, [pipWindow]);

    // Close the window when the owner unmounts (it would show stale content).
    useEffect(() => {
        return () => {
            pipWindow?.close();
        };
    }, [pipWindow]);

    return {isSupported, pipWindow, open, close};
}
