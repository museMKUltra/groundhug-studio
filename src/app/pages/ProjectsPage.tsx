import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import {useSnackbar} from "@/shared/providers/SnackbarContext.ts";
import {
    archiveProjectApi,
    createProjectApi,
    getProjectsApi,
    restoreProjectApi,
    updateProjectApi,
} from "@/features/projects/api.ts";
import type {Project} from "@/features/projects/types.ts";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 255;

type Draft = {
    id: number | null; // null → creating
    name: string;
    description: string;
};

export default function ProjectsPage() {
    const {showError, showSuccess} = useSnackbar();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [draft, setDraft] = useState<Draft | null>(null);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const loadProjects = async () => {
        try {
            setLoading(true);
            setProjects(await getProjectsApi());
        } catch (e) {
            handleError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const visibleProjects = useMemo(
        () => showArchived ? projects : projects.filter((p) => p.status === "ACTIVE"),
        [projects, showArchived]
    );

    const replaceProject = (updated: Project) => {
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    };

    const startCreate = () => setDraft({id: null, name: "", description: ""});

    const startEdit = (project: Project) =>
        setDraft({id: project.id, name: project.name, description: project.description ?? ""});

    const closeDialog = () => setDraft(null);

    const nameError = draft !== null && draft.name.length > NAME_MAX;
    const descriptionError = draft !== null && draft.description.length > DESCRIPTION_MAX;
    const canSave = draft !== null && draft.name.trim() !== "" && !nameError && !descriptionError;

    const handleSave = async () => {
        if (!draft || !canSave) return;

        try {
            setLoading(true);

            if (draft.id === null) {
                const created = await createProjectApi({name: draft.name.trim()});
                setProjects((prev) => [...prev, created]);
                showSuccess("Project created");
            } else {
                const updated = await updateProjectApi(draft.id, {
                    name: draft.name.trim(),
                    description: draft.description.trim() || null,
                });
                replaceProject(updated);
                showSuccess("Project updated");
            }

            closeDialog();
        } catch (e) {
            handleError(e);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (project: Project) => {
        if (!window.confirm(`Archive "${project.name}"?`)) return;
        try {
            setLoading(true);
            replaceProject(await archiveProjectApi(project.id));
            showSuccess("Project archived");
        } catch (e) {
            handleError(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (project: Project) => {
        try {
            setLoading(true);
            replaceProject(await restoreProjectApi(project.id));
            showSuccess("Project restored");
        } catch (e) {
            handleError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                            <Typography variant="h6">Projects</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showArchived}
                                            onChange={(e) => setShowArchived(e.target.checked)}
                                        />
                                    }
                                    label="Show archived"
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    disabled={loading}
                                    onClick={startCreate}
                                >
                                    New
                                </Button>
                            </Box>
                        </Box>

                        {visibleProjects.length === 0 && !loading && (
                            <Typography color="text.secondary">No projects</Typography>
                        )}

                        {visibleProjects.map((project) => {
                            const archived = project.status === "ARCHIVED";

                            return (
                                <Box
                                    key={project.id}
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        opacity: archived ? 0.6 : 1,
                                        "&:hover": {backgroundColor: "action.hover"},
                                    }}
                                >
                                    <Box flex={1} minWidth={0}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography fontWeight="bold" noWrap>{project.name}</Typography>
                                            {archived && <Chip size="small" label="Archived"/>}
                                        </Box>
                                        {project.description && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {project.description}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            Created {dayjs(project.createdAt).format("YYYY-MM-DD")}
                                        </Typography>
                                    </Box>

                                    {!archived && (
                                        <Tooltip title="Edit">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={loading}
                                                    onClick={() => startEdit(project)}
                                                >
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}

                                    {archived ? (
                                        <Tooltip title="Restore">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={loading}
                                                    onClick={() => handleRestore(project)}
                                                >
                                                    <UnarchiveIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Archive">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={loading}
                                                    onClick={() => handleArchive(project)}
                                                >
                                                    <ArchiveIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={draft !== null} onClose={closeDialog} fullWidth>
                <DialogTitle>{draft?.id === null ? "New Project" : "Edit Project"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{pt: 1}}>
                        <TextField
                            label="Name"
                            required
                            autoFocus
                            value={draft?.name ?? ""}
                            onChange={(e) => setDraft((prev) => prev ? {...prev, name: e.target.value} : prev)}
                            error={nameError}
                            helperText={`${draft?.name.length ?? 0}/${NAME_MAX}`}
                            fullWidth
                        />
                        {draft?.id !== null && (
                            <TextField
                                label="Description"
                                multiline
                                minRows={2}
                                value={draft?.description ?? ""}
                                onChange={(e) =>
                                    setDraft((prev) => prev ? {...prev, description: e.target.value} : prev)
                                }
                                error={descriptionError}
                                helperText={`${draft?.description.length ?? 0}/${DESCRIPTION_MAX}`}
                                fullWidth
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading || !canSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
