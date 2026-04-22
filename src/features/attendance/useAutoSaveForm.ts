import {useRef, useState} from "react";

type SaveStatus = "idle" | "saving" | "saved";

type Diff<T> = Partial<T>;

interface Options<T> {
    defaultValue: T;
    buildDiff: (current: T, saved: T) => Diff<T>;
    onSave: (data: Diff<T>) => Promise<void>;
    debounceMs?: number;
    onError?: (e: unknown) => void;
}

export function useAutoSaveForm<T>({
                                       defaultValue,
                                       buildDiff,
                                       onSave,
                                       debounceMs = 1200,
                                       onError
                                   }: Options<T>) {

    const [autoStatus, setAutoStatus] = useState<SaveStatus>("idle");

    const savedRef = useRef<T>(defaultValue);
    const debounceRef = useRef<number | null>(null);
    const requestIdRef = useRef(0);

    const syncValue = (next: T) => {
        savedRef.current = next;
        console.log('saveRef.current', savedRef.current);
    };

    const flush = async (currentValue: T) => {
        const diff = buildDiff(currentValue, savedRef.current);
        if (!diff || Object.keys(diff).length === 0) return;

        const currentRequestId = ++requestIdRef.current;

        try {
            setAutoStatus("saving");

            await onSave(diff);

            // only commit if latest request
            if (requestIdRef.current === currentRequestId) {
                savedRef.current = currentValue;
                setAutoStatus("saved");

                setTimeout(() => {
                    if (requestIdRef.current === currentRequestId) {
                        setAutoStatus("idle");
                    }
                }, 1000);
            }

        } catch (e) {
            if (requestIdRef.current === currentRequestId) {
                setAutoStatus("idle");
            }
            onError?.(e);
        }
    };

    const scheduleSave = (currentValue: T) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            flush(currentValue);
        }, debounceMs);
    };

    const flushSave = async (currentValue: T) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        await flush(currentValue);
    };

    return {
        autoStatus,
        scheduleSave,
        flushSave,
        syncValue
    };
}