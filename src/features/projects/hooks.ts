import {useParams} from "react-router-dom";

/** Project id from the `/projects/:projectId/...` route path; NaN if missing or not a number. */
export const useProjectId = () => {
    const {projectId} = useParams<{ projectId: string }>();
    return Number(projectId);
};

export const isValidProjectId = (id: number) => Number.isInteger(id) && id > 0;
