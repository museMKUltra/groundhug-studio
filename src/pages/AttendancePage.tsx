import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {useLabels, useSessions, useSummary} from "@/features/attendance/hooks.ts";
import LabelSelect from "@/components/LabelSelect.tsx";
import LabelDialog from "@/components/LabelDialog.tsx";
import Sessions from "@/components/Sessions.tsx";
import {useSessionContext} from "@/features/attendance/SessionContext";

import type {AxiosError} from "axios";
import type {ClockInAndOutRequest} from "@/features/attendance/types.ts";
import {useAuth} from "@/features/auth/hooks.ts";

dayjs.extend(duration);

export default function AttendancePage() {
    const {goDay} = useSessionContext();
    const {user, hourlyRate} = useAuth();
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

    const {showError, showSuccess} = useSnackbar();

    const [labelId, setLabelId] = useState<number>(0);
    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const [open, setOpen] = useState(false);
    const [now, setNow] = useState<number>(() => Date.now());

    const [description, setDescription] = useState("");

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{
            error?: string
        }>;

        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
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

    const getClockInAndOutRequest = (): ClockInAndOutRequest => {
        const request = {
            labelId,
        } as ClockInAndOutRequest;

        const trimmedDescription = description.trim();
        if (trimmedDescription) {
            request.description = trimmedDescription;
        }

        return request;
    };

    const handleClockIn = async () => {
        try {
            const request = getClockInAndOutRequest();
            await clockIn(request);
            showSuccess("Clock in successful");
        } catch (e) {
            handleError(e);
        }
    };

    const handleClockOut = async () => {
        try {
            const request = getClockInAndOutRequest();
            await clockOut(request);
            showSuccess("Clock out successful");

            const workDate = session?.workDate;
            if (workDate) {
                goDay(dayjs(workDate));
            }
        } catch (e) {
            handleError(e);
        }
    };

    const handleOpenPreview = async () => {
        try {
            if (todaySummary === null) {
                return;
            }
            const {year, month} = todaySummary;
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

    const todayHours = todaySummary?.totalHours || 0;
    const displayTodayHours = todayHours.toFixed(2);
    const todayMostHours = 4;
    const todaySalary = formatCurrency(todayHours * hourlyRate);
    const todayMostSalary = formatCurrency(todayMostHours * hourlyRate);

    const isActive = !!session;
    const userName = user?.name || "";

    function today() {
        if (todaySummary === null) {
            return "";
        }
        const {year, month, date} = todaySummary;

        return dayjs(`${year}-${month}-${date}`).format("YYYY-MM-DD");
    }

    return (
        <Stack spacing={3} sx={{p: 3, width: "80%", mx: "auto"}}>
            <Typography>
                Hi, <Box component="span" fontWeight="bold">{userName}</Box>. Keep going!
            </Typography>
            {/* Today */}
            <Card>
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant="h6">Today's Process</Typography>
                        <Typography>
                            From: {today()}
                        </Typography>
                        <Typography>
                            Hours: <Box component="span" fontWeight="bold">{displayTodayHours}</Box> / {todayMostHours}h
                        </Typography>
                        <Typography>
                            Salary: <Box component="span" fontWeight="bold">{todaySalary}</Box> / {todayMostSalary}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {/* Main Layout */}
            <Box display="flex" gap={3} alignItems="flex-start">
                {/* LEFT: Timeline */}
                <Box flex={2} sx={{display: {xs: "none", md: "block"}}}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <Sessions/>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* RIGHT */}
                <Box flex={1}>
                    <Stack spacing={3}>
                        {/* Attendance */}
                        <Card>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="h6">Attendance</Typography>

                                    <Typography>
                                        Clock In: {isActive ? dayjs(session.clockIn).format("HH:mm:ss") : "--"}
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
                    </Stack>
                </Box>
            </Box>

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
                            <Typography fontWeight="bold">
                                Total Salary: {formatCurrency(monthSummary.salaryAmount)}
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography>No data</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

        </Stack>
    );
}