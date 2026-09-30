import {useEffect, useState} from "react";
import {LabelContext} from "./LabelContext";
import {createLabelApi, deleteLabelApi, getLabelsApi, reorderLabelsApi, updateLabelApi} from "./api";
import type {CreateLabelRequest, Label} from "./types";
import {useProjectId} from "@/features/projects/hooks.ts";

export const LabelProvider = ({children}: { children: React.ReactNode }) => {
    const projectId = useProjectId();
    const [globalLabels, setGlobalLabels] = useState<Label[]>([]);
    const [sortableLabels, setSortableLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLabels = async () => {
        setLoading(true);
        try {
            const data = await getLabelsApi(projectId);

            setGlobalLabels(data.filter(l => l.isGlobal));
            setSortableLabels(data.filter(l => !l.isGlobal));
        } finally {
            setLoading(false);
        }
    };

    const createLabel = async (data: CreateLabelRequest) => {
        const newLabel = await createLabelApi(projectId, {name: data.name, color: data.color});
        setSortableLabels((prev) => [...prev, newLabel]);
    };

    const updateLabel = async (id: number, updated: Label) => {
        const res = await updateLabelApi(id, {name: updated.name, color: updated.color});
        setSortableLabels((prev) => prev.map((l) => (l.id === id ? res : l)));
    };

    const deleteLabel = async (id: number) => {
        await deleteLabelApi(id);
        setSortableLabels((prev) => prev.filter((l) => l.id !== id));
    };

    const reorderLabels = async (ids: number[]) => {
        await reorderLabelsApi(projectId, {ids});
    };

    useEffect(() => {
        fetchLabels();
    }, [projectId]);

    return (
        <LabelContext.Provider value={{
            labels: [...globalLabels, ...sortableLabels],
            globalLabels,
            sortableLabels,
            setSortableLabels,
            loading,
            createLabel,
            updateLabel,
            deleteLabel,
            reorderLabels
        }}>
            {children}
        </LabelContext.Provider>
    );
};
