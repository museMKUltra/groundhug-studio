import {Button, Dialog, DialogActions, DialogTitle, Stack} from "@mui/material";
import dayjs from "dayjs";
import {useMemo, useState} from "react";
import type {AxiosError} from "axios";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {CreateSessionRequest, Session} from "@/features/attendance/types";
import {useSessions} from "@/features/attendance/hooks.ts";
import SessionDialogContent from "@/components/SessionDialogContent";

type Props = {
    session: Session | null;
    open: boolean;
    onClose: () => void;
    onSave: (session: Session, needRefresh: boolean) => void;
};

type FormState = {
    clockIn: string;
    clockOut: string;
    labelId: number;
    description: string;
};

export default function AddSessionDialog({session, open, onClose, onSave}: Props) {
    const {createSession} = useSessions();
    const {showError, showSuccess} = useSnackbar();

    const [isLoading, setIsLoading] = useState(false);

    const initialForm = useMemo<FormState>(() => {
        return {
            clockIn: session?.clockIn
                ? dayjs(session.clockIn).format("YYYY-MM-DDTHH:mm")
                : "",
            clockOut: session?.clockOut
                ? dayjs(session.clockOut).format("YYYY-MM-DDTHH:mm")
                : "",
            labelId: session?.label?.id || 0,
            description: session?.description || "",
        };
    }, [session]);

    const [form, setForm] = useState<FormState>(initialForm);

    const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({...prev, [key]: value}));
    };

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const isSameMonth = (a: string, b: string) => {
        return dayjs(a).isSame(dayjs(b), "month");
    };

    const isClockOutValid = (clockIn: string, clockOut: string) => {
        return dayjs(clockOut).isAfter(dayjs(clockIn));
    };

    const handleSave = async () => {
        if (!session) return;

        if (!isSameMonth(form.clockIn, session.clockIn)) {
            showError("Clock In must stay within the same month");
            return;
        }

        if (form.clockIn && form.clockOut) {
            if (!isClockOutValid(form.clockIn, form.clockOut)) {
                showError("Clock Out must be after Clock In");
                return;
            }
        }

        const request: CreateSessionRequest = {
            clockIn: dayjs(form.clockIn).toISOString(),
            clockOut: dayjs(form.clockOut).toISOString(),
        };
        if (form.labelId) {
            request.labelId = form.labelId;
        }
        if (form.description.trim()) {
            request.description = form.description.trim();
        }

        try {
            setIsLoading(true);
            const newSession = await createSession(request);

            onSave(newSession, true);
            showSuccess("Session added successfully");
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogTitle sx={{pr: 1}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <span>Add Session</span>

                    <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <SessionDialogContent
                session={session}
                form={form}
                onChange={onChange}
                isEditing
            />

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}