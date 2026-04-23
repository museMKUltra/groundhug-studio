import {createContext, useContext} from "react";
import type {CreateLabelRequest, Label} from "./types";

export type LabelContextType = {
    labels: Label[];
    globalLabels: Label[];
    sortableLabels: Label[];
    setSortableLabels: (labels: Label[]) => void;
    loading: boolean;
    createLabel: (data: CreateLabelRequest) => Promise<void>;
    updateLabel: (id: number, updated: Label) => Promise<void>;
    deleteLabel: (id: number) => Promise<void>;
    reorderLabels: (ids: number[]) => Promise<void>;
};

export const LabelContext = createContext<LabelContextType | null>(null);

export const useLabelContext = () => {
    const ctx = useContext(LabelContext);
    if (!ctx) throw new Error("useLabelContext must be used inside LabelProvider");
    return ctx;
};
