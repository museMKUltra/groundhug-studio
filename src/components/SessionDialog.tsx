import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from "@mui/material";
import dayjs from "dayjs";
import {useMemo, useState} from "react";
import type {AxiosError} from "axios";

import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Session, UpdateSessionRequest} from "@/features/attendance/types";
import {useSessions} from "@/features/attendance/hooks.ts";
import {useLabelContext} from "@/features/attendance/LabelContext";

import LabelChip from "@/components/LabelChip.tsx";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";
import ViewEditField from "@/components/ViewEditField.tsx";

type Props = {
    session: Session | null;
    onClose: () => void;
    onSave: (session: Session, needRefresh: boolean) => void;
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
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const [form, setForm] = useState<FormState>(initialForm);

    const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({...prev, [key]: value}));
    };

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const changed = {
        clockIn: form.clockIn !== initialForm.clockIn,
        clockOut: form.clockOut !== initialForm.clockOut,
        labelId: form.labelId !== initialForm.labelId,
        description: form.description !== initialForm.description,
    };
    const hasChanged = Object.values(changed).some(Boolean);

    const isSameMonth = (a: string, b: string) => {
        return dayjs(a).isSame(dayjs(b), "month");
    };

    const isClockOutValid = (clockIn: string, clockOut: string) => {
        return dayjs(clockOut).isAfter(dayjs(clockIn));
    };

    const handleSave = async () => {
        if (!session?.id) return;

        if (changed.clockIn && form.clockIn && session.clockIn) {
            if (!isSameMonth(form.clockIn, session.clockIn)) {
                showError("Clock In must stay within the same month");
                return;
            }
        }

        if (form.clockIn && form.clockOut) {
            if (!isClockOutValid(form.clockIn, form.clockOut)) {
                showError("Clock Out must be after Clock In");
                return;
            }
        }

        const request: UpdateSessionRequest = {};

        if (changed.clockIn && form.clockIn) {
            request.clockIn = dayjs(form.clockIn).toISOString();
        }

        if (changed.clockOut && form.clockOut) {
            request.clockOut = dayjs(form.clockOut).toISOString();
        }

        if (changed.labelId) {
            request.labelId = form.labelId;
        }

        if (changed.description) {
            request.description = form.description;
        }

        if (!hasChanged) {
            setIsEditing(false);
            return;
        }

        try {
            setIsLoading(true);
            const updatedSession = await updateSession(session.id, request);
            const needRefresh = Boolean(changed.clockIn || changed.clockOut || changed.labelId);

            onSave(updatedSession, needRefresh);
            showSuccess("Session updated successfully");
            setIsEditing(false);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setForm(initialForm);
        setIsEditing(false);
    };

    const sessionLabel = session?.label || null;
    const isDeletedLabel =
        sessionLabel && !labels.some(l => l.id === sessionLabel.id);
    const labelsWithDeleted = isDeletedLabel
        ? [...labels, sessionLabel]
        : labels;
    const chipLabel = isDeletedLabel ? sessionLabel : labels.find(l => l.id === sessionLabel?.id);

    return (
        <Dialog
            open={!!session}
            onClose={onClose}
        >
            <DialogTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>Session</span>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{pt: 2}}>
                <ViewEditField
                    label="Clock In"
                    value={form.clockIn}
                    isEditing={isEditing}
                    size="small"
                    type="datetime-local"
                    slotProps={{
                        htmlInput: {
                            min: dayjs(session?.clockIn).startOf("month").format("YYYY-MM-DDTHH:mm"),
                            max: dayjs(session?.clockIn).endOf("month").format("YYYY-MM-DDTHH:mm"),
                        }
                    }}
                    onChange={(val) => handleChange("clockIn", val)}
                    renderView={(val) => (
                        <Typography sx={{lineHeight: "40px"}}>
                            {val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "-"}
                        </Typography>
                    )}
                />

                <ViewEditField
                    label="Clock Out"
                    value={form.clockOut}
                    isEditing={isEditing}
                    size="small"
                    type="datetime-local"
                    slotProps={{
                        htmlInput: {
                            min: form.clockIn || undefined,
                        }
                    }}
                    onChange={(val) => handleChange("clockOut", val)}
                    renderView={(val) => (
                        <Typography sx={{lineHeight: "40px"}}>
                            {val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "-"}
                        </Typography>
                    )}
                />

                <ViewEditField
                    label="Label"
                    value={String(form.labelId)}
                    isEditing={isEditing}
                    size="small"
                    onChange={(val) => handleChange("labelId", Number(val))}
                    renderView={() =>
                        chipLabel ? <div><LabelChip label={chipLabel}/></div> : "--"
                    }
                    renderEdit={() =>
                        <LabelSelect
                            size="small"
                            labels={labelsWithDeleted}
                            value={form.labelId}
                            onChange={(val) => handleChange("labelId", val)}
                            onManage={() => setOpenLabelDialog(true)}
                        />
                    }
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

                <ViewEditField
                    label="Description"
                    value={form.description}
                    isEditing={isEditing}
                    size="small"
                    multiline
                    minRows={2}
                    onChange={(val) => handleChange("description", val)}
                />
            </DialogContent>

            <DialogActions>
                {isEditing ? (
                    <>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={!hasChanged || isLoading}
                        >
                            Save
                        </Button>
                        <Button onClick={handleCancelEdit}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button variant="contained" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                        <Button onClick={onClose}>Close</Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}