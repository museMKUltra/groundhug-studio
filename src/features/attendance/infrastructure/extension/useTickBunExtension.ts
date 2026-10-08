import {useCallback, useEffect, useRef, useState} from "react";

const EXTENSION_ID = import.meta.env.VITE_TICKBUN_EXTENSION_ID;

interface GetTimeSettingResponse {
    success: boolean;
    durationMinutes?: number;
    message?: string;
}

interface FocusTickBunResponse {
    success: boolean;
    message?: string;
}

export function useTickBunExtension(seconds: number) {
    const hasFocused = useRef(false);
    const [doFocusing, setDoFocusing] = useState(true);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [timeSettingMinutes, setTimeSettingMinutes] = useState<number | null>(
        null
    );

    /**
     * Get the current time setting from the Chrome extension.
     */
    const refreshTimeSetting = useCallback(() => {
        return new Promise<number>((resolve, reject) => {
            if (!EXTENSION_ID) {
                reject(new Error("TickBun extension ID is not configured."));
                return;
            }

            chrome.runtime?.sendMessage(
                EXTENSION_ID,
                {type: "GET_TIME_SETTING"},
                (response: GetTimeSettingResponse) => {
                    if (chrome.runtime.lastError) {
                        reject(
                            new Error(
                                chrome.runtime.lastError.message
                            )
                        );
                        return;
                    }

                    if (!response?.success) {
                        reject(
                            new Error(
                                response?.message ??
                                "Failed to get time setting."
                            )
                        );
                        return;
                    }

                    const minutes = response.durationMinutes;

                    if (minutes === undefined) {
                        reject(
                            new Error(
                                "Extension returned an invalid time setting."
                            )
                        );
                        return;
                    }

                    setTimeSettingMinutes(minutes);
                    resolve(minutes);

                    setIsTimeUp(false);
                    hasFocused.current = false;
                }
            );
        });
    }, []);

    /**
     * Focus the TickBun browser tab.
     */
    const focusTickBun = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (!EXTENSION_ID) {
                reject(new Error("TickBun extension ID is not configured."));
                return;
            }

            chrome.runtime?.sendMessage(
                EXTENSION_ID,
                {type: "FOCUS_TICKBUN"},
                (response: FocusTickBunResponse) => {
                    if (chrome.runtime.lastError) {
                        reject(
                            new Error(
                                chrome.runtime.lastError.message
                            )
                        );
                        return;
                    }

                    if (!response?.success) {
                        reject(
                            new Error(
                                response?.message ??
                                "Failed to focus TickBun."
                            )
                        );
                        return;
                    }

                    resolve();

                    setIsTimeUp(true);
                    hasFocused.current = true;
                }
            );
        });
    }, []);

    /**
     * Initially get the time setting.
     */
    useEffect(() => {
        refreshTimeSetting().catch((error) => {
            console.error(
                "Failed to get TickBun time setting:",
                error
            );
        });
    }, [refreshTimeSetting]);

    /**
     * Check whether the elapsed seconds
     * have reached the configured duration.
     */
    useEffect(() => {
        if (!doFocusing || timeSettingMinutes === null || hasFocused.current) {
            return;
        }

        const targetSeconds = timeSettingMinutes * 60;

        console.log('seconds', seconds, targetSeconds);
        if (seconds < targetSeconds) {
            return;
        }

        focusTickBun().catch((error) => {
            console.error(
                "Failed to focus TickBun:",
                error
            );
        });
    }, [
        seconds,
        timeSettingMinutes,
        focusTickBun,
        doFocusing,
    ]);

    return {
        isTimeUp,
        setIsTimeUp,
        doFocusing,
        setDoFocusing,
        timeSettingMinutes,
        refreshTimeSetting,
    };
}