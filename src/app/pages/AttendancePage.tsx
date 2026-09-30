import {useEffect} from "react";
import {Box, Card, CardContent, Divider, Stack, Typography,} from "@mui/material";
import {useSnackbar} from "@/shared/providers/SnackbarContext.ts";
import dayjs from "dayjs";
import type {AxiosError} from "axios";
import {useSessions} from "@/features/attendance/hooks.ts";
import {useMe, usePermissions} from "@/features/auth/hooks.ts";
import Sessions from "@/shared/components/Sessions.tsx";
import AttendanceCard from "@/shared/components/AttendanceCard.tsx";
import MonthlyPreviewCard from "@/shared/components/MonthlyPreviewCard.tsx";
import {formatCurrency} from "@/shared/utils/currency.ts";
import {useProjectContext} from "@/features/projects/ProjectContext.tsx";

export default function AttendancePage() {
    const {hourlyRate} = useMe();
    const {canManageOwnHourlyRate} = usePermissions();
    const {
        session,
        todaySummary,
        loading: sessionLoading,
        handleActiveSession,
        clockIn,
        clockOut,
        updateSession,
    } = useSessions();

    const {project} = useProjectContext();
    const {showError} = useSnackbar();

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    // ProjectProvider only mounts this page once the project is confirmed, and remounts it on project change
    useEffect(() => {
        handleActiveSession().catch(handleError);
    }, []);

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
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                        divider={<Divider orientation="vertical" flexItem/>}
                    >
                        <Typography variant="h6" fontWeight="bold">{project.name}</Typography>
                        <Typography color="text.secondary">{today()}</Typography>
                        <Typography>
                            Hours: <Box component="span" fontWeight="bold">{displayTodayHours}</Box>
                            {canManageOwnHourlyRate && <> / {todayMostHours}h</>}
                        </Typography>
                        {canManageOwnHourlyRate && (
                            <Typography>
                                Salary: <Box component="span"
                                             fontWeight="bold">{todaySalary}</Box> / {todayMostSalary}
                            </Typography>
                        )}
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
