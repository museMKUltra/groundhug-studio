import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import dayjs from "dayjs";
import {useEffect, useRef, useState} from "react";
import type {AxiosError} from "axios";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Label, Session as UpdatedSession, UpdateSessionRequest} from "@/features/attendance/types";
import {useLabels, useSessions} from "@/features/attendance/hooks.ts";
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
    onSave: (session: UpdatedSession) => void;
};

export default function SessionDialog({session, onClose, onSave}: Props) {
    const sessionLabel = session?.label || null;
    const sessionDescription = session?.description || "";
    const sessionIn = session?.clockIn ? dayjs(session?.clockIn).format("YYYY-MM-DDTHH:mm") : "";
    const sessionOut = session?.clockOut ? dayjs(session?.clockOut).format("YYYY-MM-DDTHH:mm") : "";

    const [editLabel, setEditLabel] = useState<Label | null>(sessionLabel);

    useEffect(() => {
        setEditLabel(sessionLabel);
    }, [sessionLabel]);

    const editRef = useRef<Partial<{
        clockIn: string;
        clockOut: string;
        labelId: number;
        description: string;
    }>>({});

    const {
        labels,
        createLabel,
        updateLabel,
        deleteLabel,
    } = useLabels();
    const [sessionLabelId, setSessionLabelId] = useState<number>(sessionLabel?.id || 0);
    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const isDeletedLabel = !!editLabel && !labels.some(l => l.id === editLabel.id);
    const labelsWithDeleted = isDeletedLabel ? [...labels, editLabel] : labels;

    const {showError, showSuccess} = useSnackbar();
    const handleError = (err: unknown) => {
        const error = err as AxiosError<{
            error?: string
        }>;

        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const {updateSession} = useSessions();

    const handleSave = async () => {
        const {clockIn, clockOut, labelId, description} = editRef.current;
        const request = {} as UpdateSessionRequest;

        if (clockIn !== undefined) {
            request.clockIn = dayjs(clockIn).toISOString();
        }

        if (clockOut !== undefined) {
            request.clockOut = dayjs(clockOut).toISOString();
        }

        if (labelId !== undefined) {
            request.labelId = labelId;
        }

        if (description !== undefined) {
            request.description = description;
        }

        try {
            const id = session?.id;
            if (!id) {
                return;
            }

            const updatedSession = await updateSession(id, request);

            onSave(updatedSession);
            onClose();
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    }

    return (
        <Dialog key={session?.id ?? 0} open={!!session} onClose={onClose}>
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
                    defaultValue={sessionIn}
                    onChange={(e) => {
                        editRef.current.clockIn = e.target.value;
                    }}
                />

                <TextField
                    label="Clock Out"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    defaultValue={sessionOut}
                    onChange={(e) => {
                        editRef.current.clockOut = e.target.value;
                    }}
                />

                <LabelSelect
                    labels={labelsWithDeleted}
                    value={sessionLabelId}
                    onChange={(val) => {
                        setSessionLabelId(val);
                        editRef.current.labelId = val;
                    }}
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
                    defaultValue={sessionDescription}
                    onChange={(e) => {
                        editRef.current.description = e.target.value;
                    }}
                    multiline
                    minRows={2}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}