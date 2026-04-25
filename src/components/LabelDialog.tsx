import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

import {useMemo, useState} from "react";
import type {CreateLabelRequest, Label} from "@/features/attendance/types";
import LabelChip from "./LabelChip";

/** dnd-kit */
import {closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

type Props = {
    open: boolean;
    globalLabels: Label[];
    sortableLabels: Label[];
    setSortableLabels: (labels: Label[]) => void;
    onClose: () => void;
    onCreate: (data: CreateLabelRequest) => Promise<void>;
    onUpdate: (id: number, label: Label) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onReorder: (ids: number[]) => Promise<void>;
    onError: (err: unknown) => void;
    onSuccess: (message: string) => void;
};

/** draggable row */
function SortableRow({
                         label,
                         children
                     }: {
    label: Label;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: label.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        minHeight: 40,
        cursor: isDragging ? "grabbing" : "grab",
        scale: isDragging ? "1.03" : "1",
        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                WebkitUserSelect: "none", // Prevent text selection / highlight (iOS issue)
            }}
            {...attributes}
            {...listeners}
        >
            {children}
        </Box>
    );
}

export default function LabelDialog({
                                        open,
                                        globalLabels,
                                        sortableLabels,
                                        setSortableLabels,
                                        onClose,
                                        onCreate,
                                        onUpdate,
                                        onDelete,
                                        onReorder,
                                        onError,
                                        onSuccess
                                    }: Props) {

    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [draft, setDraft] = useState<Label | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 200,      // long-press time
                tolerance: 8,    // allowed finger movement
            },
        })
    );

    /** reorder handler */
    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortableLabels.findIndex(i => i.id === active.id);
        const newIndex = sortableLabels.findIndex(i => i.id === over.id);

        let sortedLabels = arrayMove(sortableLabels, oldIndex, newIndex);
        setSortableLabels(sortedLabels);

        try {
            setLoading(true);
            await onReorder(sortedLabels.map(i => i.id));
            onSuccess("Order updated");
        } catch (e) {
            onError(e);

            // revert back to old order
            sortedLabels = arrayMove(sortedLabels, newIndex, oldIndex);
            setSortableLabels(sortedLabels);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (label: Label) => {
        setEditingId(label.id);
        setDraft({...label});
    };

    const handleDelete = async (label: Label) => {
        if (!window.confirm(`Delete "${label.name}"?`)) return;
        try {
            setLoading(true);
            await onDelete(label.id);
            onSuccess("Label deleted successfully");
        } catch (e) {
            onError(e);
        } finally {
            setLoading(false);
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
        if (!draft || !draft.name.trim()) return;

        try {
            setLoading(true);

            if (editingId === "new") {
                await onCreate({
                    name: draft.name,
                    color: draft.color
                });
                onSuccess("Label created");
            } else {
                await onUpdate(draft.id, draft);
                onSuccess("Label updated");
            }

            cancelEdit();
        } catch (e) {
            onError(e);
        } finally {
            setLoading(false);
        }
    };

    const hasChanged = useMemo(() => {
        if (!draft) return false;

        if (editingId === "new") {
            return draft.name.trim() !== "";
        }

        const original = sortableLabels.find((l) => l.id === editingId);
        if (!original) return false;

        return (
            draft.name.trim() !== original.name.trim() ||
            draft.color !== original.color
        );
    }, [draft, editingId, sortableLabels]);

    const handleClose = () => {
        if (hasChanged) {
            if (!window.confirm("Discard changes?")) return;
        }
        cancelEdit();
        onClose();
    }

    const heightSx = {
        display: "flex",
        flex: 1,
        alignItems: "center",
        minHeight: "40px"
    }
    const labelSx = {
        ...heightSx,
        "&:hover": {
            backgroundColor: "action.hover",
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Manage Labels</DialogTitle>

            <DialogContent sx={{
                userSelect: "none",
                touchAction: "none"
            }}>
                <Stack>

                    {/* GLOBAL (fixed) */}
                    {globalLabels.map(label => (
                        <Box key={label.id} sx={heightSx}>
                            <LabelChip label={label}/>
                        </Box>
                    ))}

                    {/* USER LABELS (DRAGGABLE) */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sortableLabels.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {sortableLabels.map(label => {
                                const isEditing = editingId === label.id;
                                const current = (isEditing && draft) ? draft : label;

                                return (
                                    <SortableRow key={label.id} label={label}>
                                        <Box key={label.id} sx={labelSx} gap={1}>
                                            <Box sx={{flex: 1}}>
                                                <LabelChip label={current}/>
                                            </Box>

                                            {isEditing ? (
                                                <>
                                                    <TextField
                                                        size="small"
                                                        value={current.name}
                                                        onChange={(e) =>
                                                            setDraft(prev =>
                                                                prev ? {...prev, name: e.target.value} : prev
                                                            )
                                                        }
                                                    />

                                                    <input
                                                        type="color"
                                                        value={current.color}
                                                        onChange={(e) =>
                                                            setDraft(prev =>
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
                                    </SortableRow>
                                );
                            })}
                        </SortableContext>
                    </DndContext>

                    {editingId === "new" && draft && (
                        <Box sx={labelSx} gap={1}>
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
                        <Box sx={heightSx}>
                            <Button
                                disabled={loading}
                                variant="outlined"
                                fullWidth
                                onClick={startCreate}
                            >
                                <AddIcon fontSize="small"/>
                            </Button>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}