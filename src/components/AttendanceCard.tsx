import {useEffect, useMemo, useState} from "react";
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import type {ClockInAndOutRequest, Session} from "@/features/attendance/types.ts";
import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import {getDuration} from "@/utils/duration";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";

interface Props {
    session: Session | null;
    sessionLoading: boolean;
    clockIn: (data?: ClockInAndOutRequest) => Promise<void>;
    clockOut: (data?: ClockInAndOutRequest) => Promise<void>;
}

export default function AttendanceCard({session, sessionLoading, clockIn, clockOut}: Props) {
    const {goDay} = useSessionContext();
    const {labels, createLabel, updateLabel, deleteLabel} = useLabelContext();
    const {showError, showSuccess} = useSnackbar();

    const [labelId, setLabelId] = useState<number>(0);
    const [openLabelDialog, setOpenLabelDialog] = useState(false);
    const [description, setDescription] = useState("");
    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = !!session;

    const durationText = useMemo(() => {
        return getDuration({clockIn: session?.clockIn || "", clockOut: new Date(now).toISOString()}, true);
    }, [session, now]);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const getClockInAndOutRequest = (): ClockInAndOutRequest => {
        const request = {labelId} as ClockInAndOutRequest;
        const trimmedDescription = description.trim();
        if (trimmedDescription) {
            request.description = trimmedDescription;
        }
        return request;
    };

    const handleClockIn = async () => {
        try {
            await clockIn(getClockInAndOutRequest());
            showSuccess("Clock in successful");
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        try {
            const workDate = session?.workDate;
            await clockOut(getClockInAndOutRequest());
            showSuccess("Clock out successful");
            if (workDate) {
                goDay(dayjs(workDate));
            }
        } catch (e) {
            handleError(e);
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">Attendance</Typography>

                    <Typography>
                        Clock In: {isActive ? dayjs(session!.clockIn).format("HH:mm:ss") : "--"}
                    </Typography>

                    <Typography>
                        Duration: {isActive ? durationText : "--"}
                    </Typography>

                    <LabelSelect
                        labels={labels}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                    />

                    <Button
                        variant="contained"
                        color={isActive ? "secondary" : "primary"}
                        onClick={isActive ? handleClockOut : handleClockIn}
                        disabled={sessionLoading}
                    >
                        {sessionLoading && <CircularProgress size={20} sx={{mr: 1}}/>}
                        {isActive ? "Clock Out" : "Clock In"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
