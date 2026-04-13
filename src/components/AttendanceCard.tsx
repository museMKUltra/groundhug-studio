import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import type {ClockInAndOutRequest, Session} from "@/features/attendance/types.ts";
import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import {getDuration} from "@/utils/duration";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";
import LabelChip from "@/components/LabelChip.tsx";
import ViewEditField from "@/components/ViewEditField.tsx";

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
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = !!session;
    const showEditMode = !isActive || isEditing;

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

    const selectedLabel = labels.find(l => l.id === labelId);

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Attendance</Typography>
                        {isActive && (
                            showEditMode
                                ? <IconButton size="small" onClick={() => setIsEditing(false)}><CloseIcon fontSize="small"/></IconButton>
                                : <IconButton size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="small"/></IconButton>
                        )}
                    </Box>

                    <Typography>
                        Clock In: {isActive ? dayjs(session!.clockIn).format("HH:mm:ss") : "--"}
                    </Typography>

                    <Typography>
                        Duration: {isActive ? durationText : "--"}
                    </Typography>

                    <ViewEditField
                        label="Label"
                        value=""
                        isEditing={showEditMode}
                        renderView={() => selectedLabel ? <div><LabelChip label={selectedLabel}/></div> : undefined}
                        renderEdit={() => (
                            <>
                                <LabelSelect
                                    labels={labels}
                                    size="small"
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
                            </>
                        )}
                    />

                    <ViewEditField
                        label="Description"
                        value={description}
                        size="small"
                        isEditing={showEditMode}
                        onChange={setDescription}
                        multiline
                        minRows={2}
                    />

                    <Button
                        variant="contained"
                        color={isActive ? "secondary" : "primary"}
                        onClick={isActive ? handleClockOut : handleClockIn}
                        disabled={sessionLoading || (isActive && isEditing)}
                    >
                        {sessionLoading && <CircularProgress size={20} sx={{mr: 1}}/>}
                        {isActive ? "Clock Out" : "Clock In"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
