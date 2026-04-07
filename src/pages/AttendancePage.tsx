import {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {useLabels, useSessions, useSummary} from "@/features/attendance/hooks.ts";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";

import type {AxiosError} from "axios";
import type {ClockInAndOutRequest} from "@/features/attendance/types.ts";

dayjs.extend(duration);

export default function AttendancePage() {
    const {
        session,
        todaySummary,
        loading: sessionLoading,
        handleActiveSession,
        clockIn,
        clockOut,
    } = useSessions();

    const {
        monthSummary,
        loading: summaryLoading,
        previewSummary,
    } = useSummary();

    const {
        labels,
        createLabel,
        updateLabel,
        deleteLabel,
    } = useLabels();

    const [labelId, setLabelId] = useState<number | "">("");
    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const [open, setOpen] = useState(false);
    const [now, setNow] = useState<number>(() => Date.now());

    const [description, setDescription] = useState("");

    // error handling
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const year = dayjs().year();
    const month = dayjs().month() + 1;

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{
            error?: string
            name?: string
            email?: string
            password?: string
        }>;

        console.error(error);
        setError(error?.response?.data?.error || "Something went wrong");
    };

    useEffect(() => {
        const init = async () => {
            try {
                await handleActiveSession();
            } catch (e) {
                handleError(e);
            }
        };

        init();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getClockInAndOutRequest = (): ClockInAndOutRequest | null => {
        const request = {} as ClockInAndOutRequest;
        if (labelId) {
            request['labelId'] = labelId;
        }
        if (description.trim()) {
            request['description'] = description;
        }
        return Object.keys(request).length > 0 ? request : null;
    }

    const handleClockIn = async () => {
        try {
            const request = getClockInAndOutRequest();
            await (request ? clockIn(request) : clockIn());
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        try {
            const request = getClockInAndOutRequest();
            await (request ? clockOut(request) : clockOut());
        } catch (e) {
            handleError(e);
        }
    };

    const handleOpenPreview = async () => {
        try {
            await previewSummary(year, month);
            setOpen(true);
        } catch (e) {
            handleError(e);
        }
    };

    const durationText = useMemo(() => {
        if (!session?.clockIn) return "-";
        const start = dayjs(session.clockIn);
        const diff = dayjs(now).diff(start);
        const d = dayjs.duration(diff);
        const hours = d.days() * 24 + d.hours();
        return `${hours}h ${d.minutes()}m ${d.seconds()}s`;
    }, [session, now]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("zh-TW", {
            style: "currency",
            currency: "TWD",
            maximumFractionDigits: 0,
        }).format(value);

    const todayHours = (todaySummary?.totalHours || 0).toFixed(2);
    const todayMostHours = 4;
    const hourlyRate = (todaySummary?.hourlyRate || 0);
    const todaySalary = formatCurrency(todaySummary?.salaryAmount || 0);
    const todayMostSalary = formatCurrency(todayMostHours * hourlyRate);

    const isActive = !!session;

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
        >
            <Stack spacing={3} sx={{p: 3, maxWidth: 600, mx: "auto"}}>
                {/* Clock Section */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Attendance</Typography>

                            <Typography>
                                Clock In:{" "}
                                {isActive
                                    ? dayjs(session.clockIn).format("HH:mm:ss")
                                    : "--"}
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
                            />

                            {/* Description */}
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

                {/* Today Progress */}
                <Card>
                    <CardContent>
                        <Stack spacing={1}>
                            <Typography variant="h6">Today</Typography>
                            <Typography>
                                Hours: <Box component="span" fontWeight="bold">{todayHours}</Box> / {todayMostHours}h
                            </Typography>
                            <Typography>
                                Salary: <Box component="span" fontWeight="bold">{todaySalary}</Box> / {todayMostSalary}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Monthly Preview */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Monthly</Typography>
                            <Button
                                variant="outlined"
                                onClick={handleOpenPreview}
                                disabled={summaryLoading}
                            >
                                Preview Month
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                    <DialogTitle>Monthly Summary</DialogTitle>
                    <DialogContent>
                        {monthSummary ? (
                            <Stack spacing={1} sx={{mt: 1}}>
                                <Typography>
                                    Time: {monthSummary.year}/{monthSummary.month.toString().padStart(2, '0')}
                                </Typography>
                                <Typography>
                                    Total Minutes: {monthSummary.totalMinutes} ({monthSummary.totalHours?.toFixed(2)}h)
                                </Typography>
                                <Typography>Hourly Rate: {formatCurrency(monthSummary.hourlyRate)}</Typography>
                                <Typography fontWeight="bold">Total
                                    Salary: {formatCurrency(monthSummary.salaryAmount)}</Typography>
                            </Stack>
                        ) : (
                            <Typography>No data</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Error Snackbar */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={4000}
                    onClose={() => setError(null)}
                >
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Snackbar>

                {/* Success Snackbar */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess(null)}
                >
                    <Alert severity="success" onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                </Snackbar>
            </Stack>
        </Box>
    );
}
