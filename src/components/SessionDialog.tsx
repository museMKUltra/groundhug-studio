import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import type {AxiosError} from "axios";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Label} from "@/features/attendance/types";
import {useLabels} from "@/features/attendance/hooks.ts";
import LabelChip from "@/components/LabelChip.tsx";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";

type Session = {
    id: number;
    clockIn: string;
    clockOut: string;
    description: string | null;
    label: Label | null;
};

type Props = {
    session: Session | null;
    onClose: () => void;
};

export default function SessionDialog({session, onClose}: Props) {
    const sessionLabel = session?.label || null;
    const sessionDescription = session?.description || "";
    const sessionIn = session?.clockIn ? dayjs(session?.clockIn).format("YYYY-MM-DDTHH:mm") : "";
    const sessionOut = session?.clockOut ? dayjs(session?.clockOut).format("YYYY-MM-DDTHH:mm") : "";

    const [editLabel, setEditLabel] = useState<Label | null>(null);
    const [editDescription, setEditDescription] = useState("");
    const [editIn, setEditIn] = useState("");
    const [editOut, setEditOut] = useState("");

    useEffect(() => {
        setEditLabel(sessionLabel);
    }, [sessionLabel]);

    useEffect(() => {
        setEditDescription(sessionDescription);
    }, [sessionDescription]);

    useEffect(() => {
        setEditIn(sessionIn);
    }, [sessionIn]);

    useEffect(() => {
        setEditOut(sessionOut);
    }, [sessionOut]);

    const {
        labels,
        createLabel,
        updateLabel,
        deleteLabel,
    } = useLabels();
    const [labelId, setLabelId] = useState<number | "">("");
    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const isDeletedLabel = !!editLabel && !labels.some(l => l.id === editLabel.id);
    const labelsWithDeleted = isDeletedLabel ? [...labels, editLabel] : labels;

    useEffect(() => {
        setLabelId(sessionLabel?.id || 0);
    }, [sessionLabel]);

    const {showError, showSuccess} = useSnackbar();
    const handleError = (err: unknown) => {
        const error = err as AxiosError<{
            error?: string
        }>;

        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    return (
        <Dialog open={!!session} onClose={onClose}>
            <DialogTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>Session</span>
                    {editLabel && <LabelChip label={editLabel}/>}
                </Stack>
            </DialogTitle>

            <DialogContent sx={{pt: 2}}>
                <TextField
                    label="Clock In"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={editIn}
                    disabled
                />

                <TextField
                    label="Clock Out"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={editOut}
                    disabled
                />

                <LabelSelect
                    labels={labelsWithDeleted}
                    value={labelId}
                    onChange={setLabelId}
                    onManage={() => setOpenLabelDialog(true)}
                />

                <LabelDialog
                    open={openLabelDialog}
                    labels={labels}
                    onClose={() => setOpenLabelDialog(false)}
                    onCreate={createLabel}
                    onUpdate={updateLabel}
                    onDelete={deleteLabel}
                    onError={handleError}
                    onSuccess={showSuccess}
                />

                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    value={editDescription}
                    disabled
                    multiline
                    minRows={2}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}