import {useEffect, useState} from "react";
import {LabelContext} from "./LabelContext";
import {createLabelApi, deleteLabelApi, getLabelsApi, updateLabelApi} from "./api";
import type {CreateLabelRequest, Label} from "./types";

export const LabelProvider = ({children}: { children: React.ReactNode }) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLabels = async () => {
        setLoading(true);
        try {
            const data = await getLabelsApi();
            setLabels(data);
        } finally {
            setLoading(false);
        }
    };

    const createLabel = async (data: CreateLabelRequest) => {
        const newLabel = await createLabelApi({name: data.name, color: data.color});
        setLabels((prev) => [...prev, newLabel]);
    };

    const updateLabel = async (id: number, updated: Label) => {
        const res = await updateLabelApi(id, {name: updated.name, color: updated.color});
        setLabels((prev) => prev.map((l) => (l.id === id ? res : l)));
    };

    const deleteLabel = async (id: number) => {
        await deleteLabelApi(id);
        setLabels((prev) => prev.filter((l) => l.id !== id));
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    return (
        <LabelContext.Provider value={{labels, loading, createLabel, updateLabel, deleteLabel}}>
            {children}
        </LabelContext.Provider>
    );
};
