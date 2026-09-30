import {createContext, useContext} from "react";
import type {Project} from "./types";

export type ProjectContextType = {
    project: Project;
    setProject: (project: Project) => void;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectContext = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error("useProjectContext must be used inside ProjectProvider");
    return ctx;
};
