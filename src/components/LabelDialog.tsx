import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {useState} from "react";
import type {CreateLabelRequest, Label} from "@/features/attendance/types";
import LabelChip from "./LabelChip";

type Props = {
    open: boolean;
    labels: Label[];
    onClose: () => void;
    onCreate: (data: CreateLabelRequest) => Promise<void>;
    onUpdate: (id: number, label: Label) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onError: (err: unknown) => void;
    onSuccess: (message: string) => void;
};

export default function LabelDialog({open, labels, onClose, onCreate, onUpdate, onDelete, onError, onSuccess}: Props) {
    const [loading, SetLoading] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [draft, setDraft] = useState<Label | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const startEdit = (label: Label) => {
        setEditingId(label.id);
        setDeletingId(null);
        setDraft(label);
    };

    const startDelete = (label: Label) => {
        setEditingId(label.id);
        setDeletingId(label.id);
        setDraft(label);
    };

    const startCreate = () => {
        setEditingId("new");
        setDeletingId(null);
        setDraft({
            id: 0, // temporary
            name: "",
            color: "#1976d2",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDeletingId(null);
        setDraft(null);
    };

    const confirmEdit = async () => {
        if (!draft) return;

        if (deletingId === draft.id) {
            try {
                SetLoading(true);
                await onDelete(draft.id);
                onSuccess("Label deleted successfully");
                cancelEdit();
            } catch (e) {
                onError(e);
            } finally {
                SetLoading(false);
            }
            return;
        }

        if (!draft.name.trim()) return;

        try {
            SetLoading(true);
            if (editingId === "new") {
                await onCreate({
                    name: draft.name,
                    color: draft.color,
                });
                onSuccess("Label created successfully");
                cancelEdit();
            } else {
                await onUpdate(draft.id, draft);
                onSuccess("Label updated successfully");
                cancelEdit();
            }
        } catch (e) {
            onError(e);
        } finally {
            SetLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Manage Labels</DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {labels.map((label) => {
                        const isEditing = editingId === label.id;
                        const isDeleting = deletingId === label.id;
                        const current = isEditing && draft ? draft : label;

                        return (
                            <Box key={label.id} display="flex" alignItems="center" gap={1}>
                                <Box sx={{flex: 1}}>
                                    <LabelChip label={current}/>
                                </Box>

                                <TextField
                                    value={current.name}
                                    size="small"
                                    disabled={!isEditing || isDeleting}
                                    onChange={(e) =>
                                        setDraft((prev) =>
                                            prev ? {...prev, name: e.target.value} : prev
                                        )
                                    }
                                    sx={{maxWidth: 220}}
                                />

                                <input
                                    type="color"
                                    value={current.color}
                                    disabled={!isEditing || isDeleting}
                                    onChange={(e) =>
                                        setDraft((prev) =>
                                            prev ? {...prev, color: e.target.value} : prev
                                        )
                                    }
                                    style={{
                                        width: 40,
                                        height: 40,
                                        border: "none",
                                        background: "none",
                                        cursor: isEditing && !isDeleting ? "pointer" : "not-allowed",
                                    }}
                                />

                                {isEditing ? (
                                    <>
                                        <Button
                                            disabled={loading}
                                            size="small"
                                            variant="contained"
                                            color={isDeleting ? "error" : "primary"}
                                            onClick={confirmEdit}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            disabled={loading}
                                            size="small"
                                            color={isDeleting ? "error" : "primary"}
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            disabled={loading}
                                            size="small"
                                            onClick={() => startEdit(label)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            disabled={loading}
                                            size="small"
                                            color="error"
                                            onClick={() => startDelete(label)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Box>
                        );
                    })}

                    {editingId === "new" && draft && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{flex: 1}}>
                                <LabelChip label={draft}/>
                            </Box>

                            <TextField
                                value={draft.name}
                                size="small"
                                autoFocus
                                placeholder="Label name"
                                onChange={(e) =>
                                    setDraft({...draft, name: e.target.value})
                                }
                                sx={{maxWidth: 220}}
                            />

                            <input
                                type="color"
                                value={draft.color}
                                onChange={(e) =>
                                    setDraft({...draft, color: e.target.value})
                                }
                                style={{
                                    width: 40,
                                    height: 40,
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                }}
                            />

                            <Button
                                disabled={loading}
                                size="small"
                                variant="contained"
                                onClick={confirmEdit}
                            >
                                Save
                            </Button>
                            <Button
                                disabled={loading}
                                size="small"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}

                    {editingId !== "new" && (
                        <Button
                            disabled={loading}
                            variant="outlined"
                            startIcon={<AddIcon fontSize="small"/>}
                            onClick={startCreate}
                        >
                            Add Label
                        </Button>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}