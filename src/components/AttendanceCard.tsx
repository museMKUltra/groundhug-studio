import {useEffect, useMemo, useRef, useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, IconButton, Stack, Typography,} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import type {ClockInAndOutRequest, Session, UpdateSessionRequest} from "@/features/attendance/types.ts";
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
    updateSession: (id: number, data: UpdateSessionRequest) => Promise<Session>;
}

export default function AttendanceCard({session, sessionLoading, clockIn, clockOut, updateSession}: Props) {
    const {goDay} = useSessionContext();
    const {labels, createLabel, updateLabel, deleteLabel} = useLabelContext();
    const {showError, showSuccess} = useSnackbar();

    const initialLabelId = useMemo<number>(
        () => (session?.label?.id || 0),
        [session]
    );
    const initialDescription = useMemo<string>(
        () => (session?.description || ""),
        [session]
    );
    const [labelId, setLabelId] = useState<number>(initialLabelId);
    const [description, setDescription] = useState<string>(initialDescription);

    const [openLabelDialog, setOpenLabelDialog] = useState(false);
    const [now, setNow] = useState<number>(() => Date.now());
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const savedLabelId = useRef(0);
    const savedDescription = useRef("");

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = !!session;
    const showEditMode = !isActive || isEditing;

    useEffect(() => {
        if (isActive) setIsEditing(false);
    }, [isActive]);

    const durationText = useMemo(() => {
        return getDuration({clockIn: session?.clockIn || "", clockOut: new Date(now).toISOString()}, true);
    }, [session, now]);

    const isLabelChanged = labelId !== savedLabelId.current;
    const isDescriptionChanged = description.trim() !== savedDescription.current.trim();
    const hasChanged = isLabelChanged || isDescriptionChanged;

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const enterEditMode = () => {
        savedLabelId.current = labelId;
        savedDescription.current = description;
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (hasChanged) {
            if (!window.confirm("Discard changes?")) return;
            setLabelId(savedLabelId.current);
            setDescription(savedDescription.current);
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!session) return;
        try {
            setIsSaving(true);

            const data: UpdateSessionRequest = {};
            if (isLabelChanged) data.labelId = labelId;
            if (isDescriptionChanged) data.description = description.trim();

            await updateSession(session.id, data);
            showSuccess("Changes saved");
            setIsEditing(false);
        } catch (e) {
            handleError(e);
        } finally {
            setIsSaving(false);
        }
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
                                ? <IconButton size="small" onClick={handleCancelEdit}><CloseIcon
                                    fontSize="small"/></IconButton>
                                : <IconButton size="small" onClick={enterEditMode}><EditIcon
                                    fontSize="small"/></IconButton>
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

                    {isActive && isEditing ? (
                        <Box display="flex" justifyContent="right">
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={isSaving || !hasChanged}
                            >
                                {isSaving && <CircularProgress size={20} sx={{mr: 1}}/>}
                                Save
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            variant="contained"
                            color={isActive ? "secondary" : "primary"}
                            onClick={isActive ? handleClockOut : handleClockIn}
                            disabled={sessionLoading}
                        >
                            {sessionLoading && <CircularProgress size={20} sx={{mr: 1}}/>}
                            {isActive ? "Clock Out" : "Clock In"}
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
