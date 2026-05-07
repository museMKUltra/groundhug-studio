import {useEffect} from "react";
import {Box, Card, CardContent, Stack, Typography,} from "@mui/material";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import {useSessions} from "@/features/attendance/hooks.ts";
import {useAuth} from "@/features/auth/hooks.ts";
import Sessions from "@/components/Sessions.tsx";
import AttendanceCard from "@/components/AttendanceCard.tsx";
import MonthlyPreviewCard from "@/components/MonthlyPreviewCard.tsx";

export default function AttendancePage() {
    const {isAdmin, hourlyRate} = useAuth();
    const {
        session,
        todaySummary,
        loading: sessionLoading,
        handleActiveSession,
        clockIn,
        clockOut,
        updateSession,
    } = useSessions();

    const {showError} = useSnackbar();

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

    function today() {
        if (todaySummary === null) {
            return "";
        }
        const {year, month, date} = todaySummary;
        return dayjs(`${year}-${month}-${date}`).format("YYYY-MM-DD");
    }

    return (
        <Stack spacing={3}>
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
                            session={session}
                            sessionLoading={sessionLoading}
                            clockIn={clockIn}
                            clockOut={clockOut}
                            updateSession={updateSession}
                        />

                        <MonthlyPreviewCard year={todaySummary?.year || 0} month={todaySummary?.month || 0}/>
                    </Stack>
                </Box>
            </Box>
        </Stack>
    );
}
