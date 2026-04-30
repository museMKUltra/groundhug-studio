import {useEffect, useMemo, useState} from "react";
import type {Session, UpdateSessionRequest} from "@/features/attendance/types";
import {useAutoSaveForm} from "@/features/attendance/useAutoSaveForm";

type AutoSaveFormState = {
    labelId: number;
    description: string;
}

export function useSessionForm(
    session: Session | null,
    updateSession: (id: number, data: UpdateSessionRequest) => Promise<Session>,
    onError: (err: unknown) => void
) {
    const initialLabelId = useMemo(() => session?.label?.id ?? 0, [session]);
    const initialDescription = useMemo(() => session?.description ?? "", [session]);

    const [labelId, setLabelId] = useState(initialLabelId);
    const [description, setDescription] = useState(initialDescription);

    const {scheduleSave, syncValue} = useAutoSaveForm<AutoSaveFormState>({
        defaultValue: {
            labelId: initialLabelId,
            description: initialDescription
        },
        buildDiff: (current, saved) => {
            const diff: UpdateSessionRequest = {};

            if (current.labelId !== saved.labelId) {
                diff.labelId = current.labelId;
            }

            const curDesc = current.description.trim();
            const savedDesc = saved.description.trim();

            if (curDesc !== savedDesc) {
                diff.description = curDesc;
            }

            return diff;
        },
        onSave: async (data) => {
            if (!session) return;
            await updateSession(session.id, data);
        },
        debounceMs: 2000,
        onError
    });


    // sync when session changes
    useEffect(() => {
        setLabelId(initialLabelId);
    }, [initialLabelId]);
    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);
    useEffect(() => {
        syncValue({labelId: initialLabelId, description: initialDescription});
    }, [initialLabelId, initialDescription]);

    // auto save
    useEffect(() => {
        scheduleSave({labelId, description});
    }, [labelId, description]);

    return {
        labelId,
        setLabelId,
        description,
        setDescription
    };
}