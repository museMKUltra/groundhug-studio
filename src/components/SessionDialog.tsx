import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from "@mui/material";
import dayjs from "dayjs";
import {useMemo, useState} from "react";
import type {AxiosError} from "axios";

import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Label, Session as UpdatedSession, UpdateSessionRequest} from "@/features/attendance/types";
import {useSessions} from "@/features/attendance/hooks.ts";
import {useLabelContext} from "@/features/attendance/LabelContext";

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
    onSave: (session: UpdatedSession, needRefresh: boolean) => void;
};

type FormState = {
    clockIn: string;
    clockOut: string;
    labelId: number;
    description: string;
};

export default function SessionDialog({session, onClose, onSave}: Props) {
    const {labels, createLabel, updateLabel, deleteLabel} = useLabelContext();
    const {updateSession} = useSessions();
    const {showError, showSuccess} = useSnackbar();

    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const initialForm = useMemo<FormState>(() => ({
        clockIn: session?.clockIn
            ? dayjs(session.clockIn).format("YYYY-MM-DDTHH:mm")
            : "",
        clockOut: session?.clockOut
            ? dayjs(session.clockOut).format("YYYY-MM-DDTHH:mm")
            : "",
        labelId: session?.label?.id || 0,
        description: session?.description || "",
    }), [session]);

    // ✅ controlled form
    const [form, setForm] = useState<FormState>(initialForm);

    const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({...prev, [key]: value}));
    };

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const handleSave = async () => {
        if (!session?.id) return;

        const request: UpdateSessionRequest = {};

        // ✅ compute diff here
        if (form.clockIn && form.clockIn !== initialForm.clockIn) {
            request.clockIn = dayjs(form.clockIn).toISOString();
        }

        if (form.clockOut && form.clockOut !== initialForm.clockOut) {
            request.clockOut = dayjs(form.clockOut).toISOString();
        }

        if (form.labelId !== initialForm.labelId) {
            request.labelId = form.labelId;
        }

        if (form.description !== initialForm.description) {
            request.description = form.description;
        }

        const hasChanged = Object.keys(request).length > 0;
        if (!hasChanged) {
            onClose();
            return;
        }

        try {
            const updatedSession = await updateSession(session.id, request);
            const needRefresh = Boolean(request.clockIn || request.clockOut);

            onSave(updatedSession, needRefresh);
            showSuccess("Session updated successfully");
            onClose();
        } catch (error) {
            handleError(error);
        }
    };

    const sessionLabel = session?.label || null;
    const isDeletedLabel =
        sessionLabel && !labels.some(l => l.id === sessionLabel.id);
    const labelsWithDeleted = isDeletedLabel
        ? [...labels, sessionLabel]
        : labels;

    return (
        <Dialog
            open={!!session}
            onClose={onClose}
        >
            <DialogTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>Session</span>
                    {sessionLabel && <LabelChip label={sessionLabel}/>}
                </Stack>
            </DialogTitle>

            <DialogContent sx={{pt: 2}}>
                <TextField
                    label="Clock In"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={form.clockIn}
                    onChange={(e) => handleChange("clockIn", e.target.value)}
                />

                <TextField
                    label="Clock Out"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={form.clockOut}
                    onChange={(e) => handleChange("clockOut", e.target.value)}
                />

                <LabelSelect
                    labels={labelsWithDeleted}
                    value={form.labelId}
                    onChange={(val) => handleChange("labelId", val)}
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
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    multiline
                    minRows={2}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}