import {useEffect, useState} from "react";
import {LabelContext} from "./LabelContext";
import {createLabelApi, deleteLabelApi, getLabelsApi, reorderLabelsApi, updateLabelApi} from "./api";
import type {CreateLabelRequest, Label} from "./types";

export const LabelProvider = ({children}: { children: React.ReactNode }) => {
    const [globalLabels, setGlobalLabels] = useState<Label[]>([]);
    const [sortableLabels, setSortableLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLabels = async () => {
        setLoading(true);
        try {
            const data = await getLabelsApi();

            setGlobalLabels(data.filter(l => l.isGlobal));
            setSortableLabels(data.filter(l => !l.isGlobal));
        } finally {
            setLoading(false);
        }
    };

    const createLabel = async (data: CreateLabelRequest) => {
        const newLabel = await createLabelApi({name: data.name, color: data.color});
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
        await reorderLabelsApi({ids});
    };

    useEffect(() => {
        fetchLabels();
    }, []);

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
