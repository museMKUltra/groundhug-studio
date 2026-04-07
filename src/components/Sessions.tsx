import {useMemo} from "react";
import {Box, Typography,} from "@mui/material";
import dayjs from "dayjs";

type Session = {
    id: number;
    clockIn: string;
    clockOut: string;
}

export default function Sessions() {
    // ✅ MOCK sessions (you can replace later with API)
    const mockSessions = [
        {id: 1, clockIn: "2026-04-01T09:00:00", clockOut: "2026-04-01T12:00:00"},
        {id: 2, clockIn: "2026-04-01T13:00:00", clockOut: "2026-04-01T18:00:00"},
        {id: 3, clockIn: "2026-04-02T10:00:00", clockOut: "2026-04-02T15:30:00"},
        {id: 4, clockIn: "2026-04-03T08:30:00", clockOut: "2026-04-03T11:00:00"},
    ];

    const groupedSessions = useMemo(() => {
        const map: Record<string, Session[]> = {};

        mockSessions.forEach((s) => {
            const date = dayjs(s.clockIn).format("YYYY-MM-DD");
            if (!map[date]) map[date] = [];
            map[date].push(s);
        });

        return Object.entries(map)
            .map(([date, sessions]) => ({date, sessions}))
            .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
    }, []);

    return (
        <>
            <Typography variant="h6">Sessions</Typography>

            <Box display="flex" justifyContent="space-between" fontSize={12}>
                <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </Box>

            {groupedSessions.map((day) => (
                <Box key={day.date}>
                    <Typography variant="body2" sx={{mb: 1}}>
                        {dayjs(day.date).format("MM/DD")}
                    </Typography>

                    <Box sx={{
                        position: "relative",
                        height: 32,
                        bgcolor: "grey.100",
                        borderRadius: 1,
                    }}>
                        {day.sessions.map((s: Session) => {
                            const start = dayjs(s.clockIn);
                            const end = dayjs(s.clockOut);

                            const startMin = start.hour() * 60 + start.minute();
                            const endMin = end.hour() * 60 + end.minute();

                            const left = (startMin / 1440) * 100;
                            const width = Math.max(((endMin - startMin) / 1440) * 100, 1);

                            return (
                                <Box
                                    key={s.id}
                                    sx={{
                                        position: "absolute",
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        top: 4,
                                        bottom: 4,
                                        borderRadius: 1,
                                        bgcolor: "primary.main",
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </>
    )
}
