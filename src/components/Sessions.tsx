import {useMemo, useState} from "react";
import {Box, IconButton, Typography} from "@mui/material";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type Session = {
    id: number;
    clockIn: string;
    clockOut: string;
};

export default function Sessions() {
    const mockSessions: Session[] = [
        {id: 1, clockIn: "2026-04-01T09:00:00", clockOut: "2026-04-01T12:00:00"},
        {id: 2, clockIn: "2026-04-01T13:00:00", clockOut: "2026-04-01T18:00:00"},
        {id: 3, clockIn: "2026-04-02T10:00:00", clockOut: "2026-04-02T15:30:00"},
        {id: 4, clockIn: "2026-04-03T08:30:00", clockOut: "2026-04-03T11:00:00"},
    ];

    const [weekStart, setWeekStart] = useState(() =>
        dayjs().startOf("week").add(1, "day")
    );

    const weekDays = useMemo(() => {
        return Array.from({length: 7}).map((_, i) =>
            weekStart.add(i, "day")
        );
    }, [weekStart]);

    const sessionsByDay = useMemo(() => {
        const map: Record<string, Session[]> = {};
        mockSessions.forEach((s) => {
            const date = dayjs(s.clockIn).format("YYYY-MM-DD");
            if (!map[date]) map[date] = [];
            map[date].push(s);
        });
        return map;
    }, []);

    const prevWeek = () => setWeekStart(prev => prev.subtract(7, "day"));
    const nextWeek = () => setWeekStart(prev => prev.add(7, "day"));

    return (
        <>
            {/* HEADER */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <IconButton onClick={prevWeek}><ChevronLeftIcon/></IconButton>
                <Typography variant="h6">
                    {weekStart.format("MMM DD")} - {weekStart.add(6, "day").format("MMM DD")}
                </Typography>
                <IconButton onClick={nextWeek}><ChevronRightIcon/></IconButton>
            </Box>

            {/* MAIN LAYOUT */}
            <Box display="flex">
                {/* ⬅️ LEFT TIMELINE */}
                <Box
                    sx={{
                        width: 24,
                        height: 390,
                        position: "relative",
                        top: 32,
                        mr: 1,
                    }}
                >
                    {[0, 6, 12, 18, 24].map((h) => (
                        <Box
                            key={h}
                            sx={{
                                position: "absolute",
                                top: `${(h / 24) * 100}%`,
                                transform: "translateY(-50%)",
                                fontSize: 10,
                            }}
                        >
                            {String(h).padStart(2, "0")}
                        </Box>
                    ))}
                </Box>

                {/* RIGHT CONTENT */}
                <Box flex={1}>
                    {/* DAYS HEADER */}
                    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" mb={1}>
                        {weekDays.map((d) => (
                            <Typography key={d.toString()} variant="caption" textAlign="center">
                                {d.format("ddd DD")}
                            </Typography>
                        ))}
                    </Box>

                    {/* GRID */}
                    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
                        {weekDays.map((day) => {
                            const dateKey = day.format("YYYY-MM-DD");
                            const daySessions = sessionsByDay[dateKey] || [];

                            return (
                                <Box
                                    key={dateKey}
                                    sx={{
                                        position: "relative",
                                        height: 400,
                                        bgcolor: "grey.100",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    {daySessions.map((s) => {
                                        const start = dayjs(s.clockIn);
                                        const end = dayjs(s.clockOut);

                                        const startMin = start.hour() * 60 + start.minute();
                                        const endMin = end.hour() * 60 + end.minute();

                                        const top = (startMin / 1440) * 100;
                                        const height = Math.max(((endMin - startMin) / 1440) * 100, 1);

                                        return (
                                            <Box
                                                key={s.id}
                                                sx={{
                                                    position: "absolute",
                                                    left: 4,
                                                    right: 4,
                                                    top: `${top}%`,
                                                    height: `${height}%`,
                                                    bgcolor: "primary.main",
                                                    borderRadius: 1,
                                                    opacity: 0.8,
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </>
    );
}