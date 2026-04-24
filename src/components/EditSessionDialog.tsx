import {Button, Dialog, DialogActions, DialogTitle, Stack} from "@mui/material";
import dayjs from "dayjs";
import {useMemo, useState} from "react";
import type {AxiosError} from "axios";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Session, UpdateSessionRequest} from "@/features/attendance/types";
import {useSessions} from "@/features/attendance/hooks.ts";
import SessionDialogContent from "@/components/SessionDialogContent";

type Props = {
    session: Session | null;
    onClose: () => void;
    onSave: (session: Session, needRefresh: boolean) => void;
    onDelete: (session: Session) => void;
};

type FormState = {
    clockIn: string;
    clockOut: string;
    labelId: number;
    description: string;
};

export default function EditSessionDialog({session, onClose, onSave, onDelete}: Props) {
    const {updateSession, deleteSession} = useSessions();
    const {showError, showSuccess} = useSnackbar();

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

    const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
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

    const handleDelete = async () => {
        try {
            if (!session?.id) return;
            if (!window.confirm("Delete this session?")) return;

            await deleteSession(session.id);
            onDelete(session);
            showSuccess("Session deleted successfully");
        } catch (error) {
            handleError(error);
        }
    }

    const handleCancelEdit = () => {
        if (hasChanged) {
            if (!window.confirm("Discard changes?")) return;
        }
        setForm(initialForm);
        setIsEditing(false);
    };

    return (
        <Dialog
            open={!!session}
            onClose={isEditing ? undefined : onClose}
        >
            <DialogTitle sx={{pr: 1}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <span>{isEditing ? "Edit Session" : "Session"}</span>

                    <Stack direction="row" spacing={0.5}>
                        {isEditing ? (
                            <>
                                <IconButton onClick={handleCancelEdit} size="small">
                                    <CloseIcon fontSize="small"/>
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton onClick={() => setIsEditing(true)} size="small">
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton onClick={handleDelete} size="small">
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </>
                        )}
                    </Stack>
                </Stack>
            </DialogTitle>

            <SessionDialogContent
                session={session}
                form={form}
                onChange={onChange}
                onClose={onClose}
                isEditing={isEditing}
            />

            <DialogActions>
                {isEditing
                    ? <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!hasChanged || isLoading}
                    >
                        Save
                    </Button>
                    : <Button onClick={onClose}>Close</Button>
                }
            </DialogActions>
        </Dialog>
    );
}