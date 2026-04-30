import {useCallback, useEffect, useMemo, useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography,} from "@mui/material";
import dayjs from "dayjs";
import type {AxiosError} from "axios";

import type {ClockInAndOutRequest, Session, UpdateSessionRequest} from "@/features/attendance/types.ts";

import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useAutoSaveForm} from "@/features/attendance/useAutoSaveForm";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import {getDuration} from "@/utils/duration";

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

    const [labelId, setLabelId] = useState<number>(initialLabelId);
    const [description, setDescription] = useState<string>(initialDescription);

    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const getDurationText = useCallback(() => {
        return getDuration(
            {
                clockIn: session?.clockIn || "",
                clockOut: new Date(clock.now()).toISOString()
            },
            true
        );
    }, [session, clock])
    const [durationText, setDurationText] = useState<string>(getDurationText());

    useEffect(() => {
        const timer = setInterval(() => {
            setDurationText(getDurationText());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    // sync initial value by session
    useEffect(() => {
        syncValue({labelId: initialLabelId, description: initialDescription});
    }, [initialLabelId, initialDescription]);

    // trigger auto-save
    useEffect(() => {
        if (!isActive) return;

        scheduleSave({labelId, description});
    }, [labelId, description, session]);

    const getClockInAndOutRequest = (): ClockInAndOutRequest => {
        const req: ClockInAndOutRequest = {labelId};

        const trimmed = description.trim();
        if (trimmed) req.description = trimmed;

        return req;
    };

    const commitSnapshot = () => {
        syncValue({labelId, description});
    };

    const handleClockIn = async () => {
        try {
            await clockIn(getClockInAndOutRequest());
            commitSnapshot();
            showSuccess("Clock in successful");
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut(getClockInAndOutRequest());
            commitSnapshot();
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