import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,} from "@mui/material";
import {useState} from "react";
import type {CreateLabelRequest, Label} from "@/features/attendance/types";
import LabelChip from "./LabelChip";

type Props = {
    open: boolean;
    labels: Label[];
    onClose: () => void;
    onCreate: (data: CreateLabelRequest) => Promise<void>;
    onUpdate: (id: number, label: Label) => void;
    onDelete: (id: number) => void;
    onError: (err: unknown) => void;
};

export default function LabelDialog({open, labels, onClose, onCreate, onUpdate, onDelete, onError}: Props) {
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [draft, setDraft] = useState<Label | null>(null);

    const startEdit = (label: Label) => {
        setEditingId(label.id);
        setDraft(label);
    };

    const startCreate = () => {
        setEditingId("new");
        setDraft({
            id: 0, // temporary
            name: "",
            color: "#1976d2",
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
            if (editingId === "new") {
                await onCreate({
                    name: draft.name,
                    color: draft.color,
                });
            } else {
                onUpdate(draft.id, draft);
                cancelEdit();
            }
        } catch (e) {
            onError(e);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Manage Labels</DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {/* Existing labels */}
                    {labels.map((label) => {
                        const isEditing = editingId === label.id;
                        const current = isEditing && draft ? draft : label;

                        return (
                            <Box key={label.id} display="flex" alignItems="center" gap={1}>
                                <LabelChip label={current}/>

                                <TextField
                                    value={current.name}
                                    size="small"
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                        setDraft((prev) =>
                                            prev ? {...prev, name: e.target.value} : prev
                                        )
                                    }
                                    sx={{flex: 1}}
                                />

                                <input
                                    type="color"
                                    value={current.color}
                                    disabled={!isEditing}
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
                                        cursor: isEditing ? "pointer" : "not-allowed",
                                    }}
                                />

                                {isEditing ? (
                                    <>
                                        <Button size="small" variant="contained" onClick={confirmEdit}>
                                            Save
                                        </Button>
                                        <Button size="small" onClick={cancelEdit}>
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="small" onClick={() => startEdit(label)}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => onDelete(label.id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Box>
                        );
                    })}

                    {/* Inline Create Row */}
                    {editingId === "new" && draft && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <LabelChip label={draft}/>

                            <TextField
                                value={draft.name}
                                size="small"
                                autoFocus
                                placeholder="Label name"
                                onChange={(e) =>
                                    setDraft({...draft, name: e.target.value})
                                }
                                sx={{flex: 1}}
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

                            <Button size="small" variant="contained" onClick={confirmEdit}>
                                Save
                            </Button>
                            <Button size="small" onClick={cancelEdit}>
                                Cancel
                            </Button>
                        </Box>
                    )}

                    {/* Add Button */}
                    {editingId !== "new" && (
                        <Button variant="outlined" onClick={startCreate}>
                            + Add Label
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