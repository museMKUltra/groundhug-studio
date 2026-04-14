import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import {useMemo, useState} from "react";
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

    const startEdit = (label: Label) => {
        setEditingId(label.id);
        setDraft({...label});
    };

    const handleDelete = async (label: Label) => {
        if (!window.confirm(`Delete "${label.name}"?`)) return;
        try {
            SetLoading(true);
            await onDelete(label.id);
            onSuccess("Label deleted successfully");
        } catch (e) {
            onError(e);
        } finally {
            SetLoading(false);
        }
    };

    const startCreate = () => {
        setEditingId("new");
        setDraft({
            id: 0,
            name: "",
            color: "#1976d2",
            isGlobal: false,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft(null);
    };

    const confirmEdit = async () => {
        if (!draft) return;
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

    const hasChanged = useMemo(() => {
        if (!draft) return false;

        if (editingId === "new") {
            return draft.name.trim() !== "";
        }

        const original = labels.find((l) => l.id === editingId);
        if (!original) return false;

        return (
            draft.name.trim() !== original.name.trim() ||
            draft.color !== original.color
        );
    }, [draft, editingId, labels]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Manage Labels</DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {labels.map((label) => {
                        const isEditing = editingId === label.id;
                        const current = isEditing && draft ? draft : label;

                        return (
                            label.isGlobal
                                ? (
                                    <Box key={label.id}>
                                        <LabelChip label={current}/>
                                    </Box>
                                )
                                : (
                                    <Box key={label.id} display="flex" alignItems="center" gap={1}>
                                        <Box sx={{flex: 1}}>
                                            <LabelChip label={current}/>
                                        </Box>

                                        {isEditing && (
                                            <>
                                                <Box sx={{flex: 1}}>
                                                    <TextField
                                                        value={current.name}
                                                        size="small"
                                                        fullWidth
                                                        autoFocus
                                                        onChange={(e) =>
                                                            setDraft((prev) =>
                                                                prev ? {...prev, name: e.target.value} : prev
                                                            )
                                                        }
                                                    />
                                                </Box>

                                                <input
                                                    type="color"
                                                    value={current.color}
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
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            </>
                                        )}

                                        {isEditing ? (
                                            <>
                                                <IconButton
                                                    disabled={loading || !hasChanged}
                                                    size="small"
                                                    color="primary"
                                                    onClick={confirmEdit}
                                                >
                                                    <CheckIcon fontSize="small"/>
                                                </IconButton>
                                                <IconButton
                                                    disabled={loading}
                                                    size="small"
                                                    onClick={cancelEdit}
                                                >
                                                    <CloseIcon fontSize="small"/>
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    disabled={loading}
                                                    size="small"
                                                    onClick={() => startEdit(label)}
                                                >
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                                <IconButton
                                                    disabled={loading}
                                                    size="small"
                                                    onClick={() => handleDelete(label)}
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                )
                        );
                    })}

                    {editingId === "new" && draft && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{flex: 1}}>
                                <LabelChip label={draft}/>
                            </Box>

                            <Box sx={{flex: 1}}>
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
                            </Box>

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

                            <IconButton
                                disabled={loading || !draft.name.trim()}
                                size="small"
                                color="primary"
                                onClick={confirmEdit}
                            >
                                <CheckIcon fontSize="small"/>
                            </IconButton>
                            <IconButton
                                disabled={loading}
                                size="small"
                                onClick={cancelEdit}
                            >
                                <CloseIcon fontSize="small"/>
                            </IconButton>
                        </Box>
                    )}

                    {editingId !== "new" && (
                        <Button
                            disabled={loading}
                            variant="outlined"
                            onClick={startCreate}
                        >
                            <AddIcon fontSize="small"/>
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
