import {useEffect, useMemo, useState} from "react";
import {Box, Button, IconButton, Tooltip, Typography} from "@mui/material";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {useSessionContext} from "@/features/attendance/SessionContext";
import SessionDialog from "@/components/SessionDialog";
import type {Label} from "@/features/attendance/types";

type Session = {
    id: number;
    clockIn: string;
    clockOut: string;
    description: string | null;
    label: Label | null;
};

type Props = {
    onRefresh: () => void;
};

export default function Sessions({onRefresh}: Props) {
    const {
        periodSessions,
        updatePeriodSessions,
        updateSession,
        weekStart,
        setStartTime,
        setEndTime,
        prevWeek,
        nextWeek,
        goToday
    } = useSessionContext();

    const endDate = useMemo(
        () => weekStart.add(7, "day"),
        [weekStart]
    );

    const weekEnd = useMemo(
        () => weekStart.add(6, "day"),
        [weekStart]
    );

    const weekDays = useMemo(() => {
        return Array.from({length: 7}).map((_, i) =>
            weekStart.add(i, "day")
        );
    }, [weekStart]);

    useEffect(() => {
        setStartTime(weekStart);
        setEndTime(endDate);
        updatePeriodSessions();
    }, [weekStart]);

    const [selected, setSelected] = useState<Session | null>(null);

    const handleOpenDialog = (s: Session) => {
        setSelected(s);
    };

    const today = dayjs();

    return (
        <>
            {/* HEADER */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                    <IconButton onClick={prevWeek}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <IconButton onClick={nextWeek}>
                        <ChevronRightIcon/>
                    </IconButton>
                </Box>

                <Typography variant="h6">
                    {weekStart.format("MMM DD")} - {weekEnd.format("MMM DD")}
                </Typography>

                <Button size="small" variant="outlined" onClick={goToday}>
                    Today
                </Button>
            </Box>

            {/* MAIN */}
            <Box display="flex">
                {/* TIMELINE */}
                <Box sx={{width: 24, height: 390, position: "relative", top: 32, mr: 1}}>
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

                {/* RIGHT */}
                <Box flex={1}>
                    {/* DAYS HEADER */}
                    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" mb={1}>
                        {weekDays.map((d) => (
                            <Typography
                                key={d.toString()}
                                variant="caption"
                                textAlign="center"
                                sx={{
                                    color: d.isSame(today, "day")
                                        ? "primary.main"
                                        : "text.secondary",
                                    fontWeight: d.isSame(today, "day") ? 600 : 400,
                                }}
                            >
                                {d.format("ddd DD")}
                            </Typography>
                        ))}
                    </Box>

                    {/* GRID */}
                    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
                        {weekDays.map((day) => {
                            const dayStart = day.startOf("day");
                            const dayEnd = day.endOf("day");

                            const daySessions = periodSessions
                                .map((s) => {
                                    const start = dayjs(s.clockIn);
                                    const end = dayjs(s.clockOut);

                                    if (end.isBefore(dayStart) || start.isAfter(dayEnd)) return null;

                                    const renderStart = start.isBefore(dayStart) ? dayStart : start;
                                    const renderEnd = end.isAfter(dayEnd) ? dayEnd : end;

                                    return {
                                        ...s,
                                        renderStart,
                                        renderEnd,
                                    };
                                })
                                .filter(Boolean) as (Session & {
                                renderStart: dayjs.Dayjs;
                                renderEnd: dayjs.Dayjs;
                            })[];

                            return (
                                <Box
                                    key={day.toString()}
                                    sx={{
                                        position: "relative",
                                        height: 400,
                                        bgcolor: "grey.100",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    {daySessions.map((s) => {
                                        const start = s.renderStart;
                                        const end = s.renderEnd;

                                        const startMin = start.hour() * 60 + start.minute();
                                        const endMin = end.hour() * 60 + end.minute();

                                        const top = (startMin / 1440) * 100;
                                        const height = Math.max(((endMin - startMin) / 1440) * 100, 1);
                                        const color = s?.label?.color || 'white';

                                        return (
                                            <Tooltip
                                                key={`${s.id}-${start.toISOString()}`}
                                                placement="top"
                                                arrow
                                                enterDelay={300}
                                                title={
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={600}>
                                                            {start.format("HH:mm")} - {end.format("HH:mm")}
                                                        </Typography>

                                                        {s.label && (
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                sx={{opacity: 0.8}}
                                                            >
                                                                Label: {s.label.name}
                                                            </Typography>
                                                        )}

                                                        {s.description && (
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                sx={{
                                                                    maxWidth: 200,
                                                                    display: "-webkit-box",
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: "vertical",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    opacity: 0.7
                                                                }}
                                                            >
                                                                {s.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            >
                                                <Box
                                                    onClick={() => handleOpenDialog(s)}
                                                    sx={{
                                                        position: "absolute",
                                                        left: 4,
                                                        right: 4,
                                                        top: `${top}%`,
                                                        height: `${height}%`,
                                                        bgcolor: color,
                                                        borderRadius: 1,
                                                        opacity: 0.85,
                                                        cursor: "pointer",
                                                        transition: "0.2s",
                                                        '&:hover': {
                                                            opacity: 1,
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* EDIT DIALOG */}
            <SessionDialog
                key={selected?.id ?? 0}
                session={selected}
                onClose={() => setSelected(null)}
                onSave={(session, needRefresh) => {
                    updateSession(session);
                    if (needRefresh) {
                        onRefresh();
                    }
                }}
            />
        </>
    );
}