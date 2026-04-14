import {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import {useSessions, useSummary} from "@/features/attendance/hooks.ts";
import {useAuth} from "@/features/auth/hooks.ts";
import Sessions from "@/components/Sessions.tsx";
import AttendanceCard from "@/components/AttendanceCard.tsx";

export default function AttendancePage() {
    const {user, isAdmin, hourlyRate} = useAuth();
    const {
        session,
        todaySummary,
        loading: sessionLoading,
        handleActiveSession,
        clockIn,
        clockOut,
        updateSession,
    } = useSessions();

    const {
        monthSummary,
        loading: summaryLoading,
        previewSummary,
    } = useSummary();

    const {showError} = useSnackbar();

    const [open, setOpen] = useState(false);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
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
                        {
                            isAdmin
                                ? <>
                                    <Typography>
                                        Hours: <Box component="span"
                                                    fontWeight="bold">{displayTodayHours}</Box> / {todayMostHours}h
                                    </Typography>
                                    <Typography>
                                        Salary: <Box component="span"
                                                     fontWeight="bold">{todaySalary}</Box> / {todayMostSalary}
                                    </Typography>
                                </>
                                : <Typography>
                                    Hours: <Box component="span" fontWeight="bold">{displayTodayHours}</Box>
                                </Typography>
                        }
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
                                <Sessions onRefresh={handleActiveSession}/>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* RIGHT */}
                <Box flex={1}>
                    <Stack spacing={3}>
                        {/* Attendance */}
                        <AttendanceCard
                            key={session?.id || 0}
                            session={session}
                            sessionLoading={sessionLoading}
                            clockIn={clockIn}
                            clockOut={clockOut}
                            updateSession={updateSession}
                        />

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
                            {
                                isAdmin && <>
                                    <Typography>Hourly Rate: {formatCurrency(monthSummary.hourlyRate)}</Typography>
                                    <Typography fontWeight="bold">
                                        Total Salary: {formatCurrency(monthSummary.salaryAmount)}
                                    </Typography>
                                </>
                            }
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
