import {useEffect, useMemo, useRef, useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography,} from "@mui/material";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import type {ClockInAndOutRequest, Session, UpdateSessionRequest} from "@/features/attendance/types.ts";
import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import {getDuration} from "@/utils/duration";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";
import ViewEditField from "@/components/ViewEditField";

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

    const initialLabelId = useMemo(() => session?.label?.id || 0, [session]);
    const initialDescription = useMemo(() => session?.description || "", [session]);

    const [labelId, setLabelId] = useState<number>(initialLabelId);
    const [description, setDescription] = useState<string>(initialDescription);

    const [openLabelDialog, setOpenLabelDialog] = useState(false);
    const [now, setNow] = useState<number>(() => Date.now());
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    const savedLabelId = useRef(0);
    const savedDescription = useRef("");
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = !!session;

    useEffect(() => {
        setLabelId(initialLabelId);
        setDescription(initialDescription);

        savedLabelId.current = initialLabelId;
        savedDescription.current = initialDescription;
    }, [initialLabelId, initialDescription]);

    const durationText = useMemo(() => {
        return getDuration({clockIn: session?.clockIn || "", clockOut: new Date(now).toISOString()}, true);
    }, [session, now]);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{
            error?: string
            description?: string
        }>;
        console.error(error);
        showError(
            error?.response?.data?.description
            || error?.response?.data?.error
            || "Something went wrong"
        );
    };

    useEffect(() => {
        if (!session) return;

        const nextLabelId = labelId;
        const nextDescription = description.trim();

        const changedLabel = nextLabelId !== savedLabelId.current;
        const changedDescription = nextDescription !== savedDescription.current;

        if (!changedLabel && !changedDescription) return;

        const data: UpdateSessionRequest = {};
        if (changedLabel) data.labelId = nextLabelId;
        if (changedDescription) data.description = nextDescription;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setIsAutoSaving(true);

                await updateSession(session.id, data);

                if (data.labelId !== undefined) {
                    savedLabelId.current = nextLabelId;
                }
                if (data.description !== undefined) {
                    savedDescription.current = nextDescription;
                }

            } catch (e) {
                handleError(e);
            } finally {
                setIsAutoSaving(false);
            }
        }, 2000);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [labelId, description, session]);

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

            savedLabelId.current = labelId;
            savedDescription.current = description.trim();
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut(getClockInAndOutRequest());
            showSuccess("Clock out successful");

            savedLabelId.current = labelId;
            savedDescription.current = description.trim();

            const workDate = session?.workDate;
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
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Attendance</Typography>
                        {isAutoSaving && <Typography variant="caption">Saving...</Typography>}
                    </Box>

                    <Stack>
                        <ViewEditField
                            label="Clock In"
                            value=""
                            isEditing={true}
                            renderEdit={() => (
                                <Typography>
                                    {isActive ? dayjs(session!.clockIn).format("HH:mm:ss") : "--"}
                                </Typography>
                            )}
                            renderView={() => null}
                        />

                        <ViewEditField
                            label="Duration"
                            value=""
                            isEditing={true}
                            renderEdit={() => (
                                <Typography>
                                    {isActive ? durationText : "--"}
                                </Typography>
                            )}
                            renderView={() => null}
                        />

                        <ViewEditField
                            label="Label"
                            value=""
                            isEditing={true}
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
                            isEditing={true}
                            onChange={setDescription}
                            multiline
                            minRows={2}
                        />
                    </Stack>

                    <Box mt={2}>
                        <Button
                            variant="contained"
                            color={isActive ? "secondary" : "primary"}
                            fullWidth
                            onClick={isActive ? handleClockOut : handleClockIn}
                            disabled={sessionLoading}
                        >
                            {sessionLoading && <CircularProgress size={20} sx={{mr: 1}}/>}
                            {isActive ? "Clock Out" : "Clock In"}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
