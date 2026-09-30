import {useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {Box, CircularProgress} from "@mui/material";
import type {AxiosError} from "axios";
import {ProjectContext} from "./ProjectContext";
import {getProjectApi} from "./api";
import type {Project} from "./types";
import {isValidProjectId, useProjectId} from "./hooks";
import {useSnackbar} from "@/shared/providers/SnackbarContext.ts";

export const ProjectProvider = ({children}: { children: React.ReactNode }) => {
    const projectId = useProjectId();
    const validProjectId = isValidProjectId(projectId);
    const {showError} = useSnackbar();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        if (!validProjectId) return;

        let cancelled = false;

        getProjectApi(projectId)
            .then((p) => {
                if (!cancelled) setProject(p);
            })
            .catch((e) => {
                if (cancelled) return;
                const error = e as AxiosError<{ error?: string }>;
                const status = error.response?.status;
                console.error(error);
                showError(status === 400 || status === 404
                    ? "Project not found"
                    : error.response?.data?.error || "Something went wrong");
                navigate("/projects", {replace: true});
            });

        return () => {
            cancelled = true;
        };
    }, [projectId]);

    if (!validProjectId) {
        return <Navigate to="/projects" replace/>;
    }

    // Children fetch project-scoped data on mount, so hold them back until this exact project is loaded
    if (project?.id !== projectId) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <ProjectContext.Provider value={{project, setProject}}>
            {children}
        </ProjectContext.Provider>
    );
};
