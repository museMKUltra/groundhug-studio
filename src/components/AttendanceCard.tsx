import {useCallback, useEffect, useMemo, useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography,} from "@mui/material";
import dayjs from "dayjs";
import type {AxiosError} from "axios";

import type {ClockInAndOutRequest, Session, UpdateSessionRequest} from "@/features/attendance/types.ts";

import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useAutoSaveForm} from "@/features/attendance/useAutoSaveForm";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import {formatDuration} from "@/utils/duration";

import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";
import ViewEditField from "@/components/ViewEditField";
import {useClock} from "@/features/clock/useClockContext.ts";

interface Props {
    session: Session | null;
    sessionLoading: boolean;
    clockIn: (data?: ClockInAndOutRequest) => Promise<void>;
    clockOut: (data?: ClockInAndOutRequest) => Promise<void>;
    updateSession: (id: number, data: UpdateSessionRequest) => Promise<Session>;
}

type AutoSaveFormState = {
    labelId: number;
    description: string;
}

export default function AttendanceCard(
    {
        session,
        sessionLoading,
        clockIn,
        clockOut,
        updateSession
    }: Props
) {
    const {goDay} = useSessionContext();
    const {
        labels,
        globalLabels,
        sortableLabels,
        setSortableLabels,
        createLabel,
        updateLabel,
        deleteLabel,
        reorderLabels
    } = useLabelContext();
    const {showError, showSuccess} = useSnackbar();
    const clock = useClock();

    const initialLabelId = useMemo(() => session?.label?.id || 0, [session]);
    const initialDescription = useMemo(() => session?.description || "", [session]);

    const [labelId, setLabelId] = useState<number>(0);
    const [description, setDescription] = useState<string>("");

    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const [localStartTime, setLocalStartTime] = useState<number | null>(null);
    const startTime = useMemo(() => {
        if (localStartTime !== null) {
            return localStartTime;
        }
        if (session) {
            return dayjs(session.clockIn).valueOf();
        }
        return null;
    }, [session, localStartTime]);

    const getLiveDuration = useCallback(() => {
        if (startTime === null) return "";

        const seconds = Math.floor((clock.now() - startTime) / 1000);
        return formatDuration(seconds, true);
    }, [startTime, clock]);

    const [durationText, setDurationText] = useState<string>("");

    useEffect(() => {
        setDurationText(getLiveDuration());

        const timer = setInterval(() => {
            setDurationText(getLiveDuration());
        }, 1000);

        return () => clearInterval(timer);
    }, [getLiveDuration]);

    const isActive = Boolean(session);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string; description?: string }>;
        console.error(error);

        showError(
            error?.response?.data?.description ||
            error?.response?.data?.error ||
            "Something went wrong"
        );
    };

    const {
        scheduleSave,
        syncValue
    } = useAutoSaveForm<AutoSaveFormState>({
        defaultValue: {
            labelId: initialLabelId,
            description: initialDescription
        },
        buildDiff: (current, saved) => {
            const diff: UpdateSessionRequest = {};

            if (current.labelId !== saved.labelId) {
                diff.labelId = current.labelId;
            }

            const curDesc = current.description.trim();
            const savedDesc = saved.description.trim();

            if (curDesc !== savedDesc) {
                diff.description = curDesc;
            }

            return diff;
        },
        onSave: async (data: UpdateSessionRequest) => {
            if (!session) return;
            await updateSession(session.id, data);
        },
        debounceMs: 2000,
        onError: handleError
    });

    // set default label id
    useEffect(() => {
        setLabelId(initialLabelId);
    }, [initialLabelId]);

    // set default description
    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    // sync saved value
    useEffect(() => {
        syncValue({labelId: initialLabelId, description: initialDescription});
    }, [initialLabelId, initialDescription]);

    // trigger auto-save
    useEffect(() => {
        scheduleSave({labelId, description});
    }, [labelId, description]);

    const getClockInAndOutRequest = (): ClockInAndOutRequest => {
        const req: ClockInAndOutRequest = {labelId};

        const trimmed = description.trim();
        if (trimmed) req.description = trimmed;

        return req;
    };

    const handleClockIn = async () => {
        setLocalStartTime(clock.now());

        try {
            await clockIn(getClockInAndOutRequest());
            showSuccess("Clock in successful");
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        setLocalStartTime(null);

        try {
            await clockOut(getClockInAndOutRequest());
            showSuccess("Clock out successful");

            if (session?.workDate) {
                goDay(dayjs(session.workDate));
            }
        } catch (e) {
            handleError(e);
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Start Your Cycle</Typography>
                    </Box>

                    <Stack>

                        <ViewEditField
                            label="Clock In"
                            value=""
                            isEditing
                            renderEdit={() => (
                                <Typography>
                                    {isActive ? dayjs(session!.clockIn).format("HH:mm:ss") : "--"}
                                </Typography>
                            )}
                        />

                        <ViewEditField
                            label="Duration"
                            value=""
                            isEditing
                            renderEdit={() => (
                                <Typography>
                                    {isActive ? durationText : "--"}
                                </Typography>
                            )}
                        />

                        <ViewEditField
                            label="Label"
                            value=""
                            isEditing
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
                                        globalLabels={globalLabels}
                                        sortableLabels={sortableLabels}
                                        setSortableLabels={setSortableLabels}
                                        onClose={() => setOpenLabelDialog(false)}
                                        onCreate={createLabel}
                                        onUpdate={updateLabel}
                                        onDelete={deleteLabel}
                                        onReorder={reorderLabels}
                                        onError={handleError}
                                        onSuccess={showSuccess}
                                    />
                                </>
                            )}
                        />

                        <ViewEditField
                            label="Description"
                            value={description}
                            isEditing
                            onChange={setDescription}
                            multiline
                            minRows={2}
                        />

                    </Stack>

                    <Box mt={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color={isActive ? "secondary" : "primary"}
                            onClick={isActive ? handleClockOut : handleClockIn}
                            disabled={sessionLoading}
                        >
                            {sessionLoading && (
                                <CircularProgress size={20} sx={{mr: 1}}/>
                            )}
                            {isActive ? "Clock Out" : "Clock In"}
                        </Button>
                    </Box>

                </Stack>
            </CardContent>
        </Card>
    );
}