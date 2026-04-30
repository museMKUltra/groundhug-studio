import {useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography,} from "@mui/material";
import dayjs from "dayjs";
import type {AxiosError} from "axios";

import type {ClockInAndOutRequest, Session, UpdateSessionRequest} from "@/features/attendance/types.ts";

import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import {useSessionForm} from "@/features/attendance/useSessionForm.ts";
import {useLiveDuration} from "@/features/attendance/useLiveDuration.ts";
import {useSnackbar} from "@/context/SnackbarContext.ts";

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
    const [openLabelDialog, setOpenLabelDialog] = useState(false);
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
        labelId,
        setLabelId,
        description,
        setDescription
    } = useSessionForm(session, updateSession, handleError);

    const {
        durationText,
        startLocalTime,
        resetLocalTime
    } = useLiveDuration(session);

    const getClockInAndOutRequest = (): ClockInAndOutRequest => {
        const req: ClockInAndOutRequest = {labelId};

        const trimmed = description.trim();
        if (trimmed) req.description = trimmed;

        return req;
    };

    const handleClockIn = async () => {
        startLocalTime();

        try {
            await clockIn(getClockInAndOutRequest());
            showSuccess("Clock in successful");
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        resetLocalTime();

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