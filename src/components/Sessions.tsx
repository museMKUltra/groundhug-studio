import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {useSessionContext} from "@/features/attendance/SessionContext";
import LabelChip from "@/components/LabelChip.tsx";
import type {Label} from "@/features/attendance/types";

type Session = {
    id: number;
    clockIn: string;
    clockOut: string;
    description: string | null;
    label: Label | null;
};

export default function Sessions() {
    const {periodSessions, fetchPeriodSessions} = useSessionContext();

    const getMonday = (d = dayjs()) => d.startOf("week").add(1, "day");
    const formatDate = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");

    const [weekStart, setWeekStart] = useState(() => getMonday());

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
        fetchPeriodSessions(
            formatDate(weekStart),
            formatDate(endDate)
        );
    }, [weekStart]);

    const prevWeek = () => setWeekStart(prev => prev.subtract(7, "day"));
    const nextWeek = () => setWeekStart(prev => prev.add(7, "day"));
    const goToday = () => setWeekStart(getMonday());

    // dialog
    const [selected, setSelected] = useState<Session | null>(null);
    const [editLabel, setEditLabel] = useState<Label | null>(null);
    const [editDescription, setEditDescription] = useState<string>("");
    const [editIn, setEditIn] = useState("");
    const [editOut, setEditOut] = useState("");

    const handleOpenDialog = (s: Session) => {
        setSelected(s);
        setEditLabel(s.label || null);
        setEditDescription(s.description || "");
        setEditIn(dayjs(s.clockIn).format("YYYY-MM-DDTHH:mm"));
        setEditOut(dayjs(s.clockOut).format("YYYY-MM-DDTHH:mm"));
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

                                        return (
                                            <Box
                                                key={`${s.id}-${start.toISOString()}`}
                                                onClick={() => handleOpenDialog(s)}
                                                sx={{
                                                    position: "absolute",
                                                    left: 4,
                                                    right: 4,
                                                    top: `${top}%`,
                                                    height: `${height}%`,
                                                    bgcolor: s?.label?.color || "primary.main",
                                                    borderRadius: 1,
                                                    opacity: 0.8,
                                                    cursor: "pointer",
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

            {/* EDIT DIALOG */}
            <Dialog open={!!selected} onClose={() => setSelected(null)}>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <span>Session</span>
                        {editLabel && <LabelChip label={editLabel}/>}
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{pt: 2}}>
                    <TextField
                        label="Clock In"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={editIn}
                        onChange={(e) => setEditIn(e.target.value)}
                        disabled
                    />

                    <TextField
                        label="Clock Out"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={editOut}
                        onChange={(e) => setEditOut(e.target.value)}
                        disabled
                    />

                    {
                        editDescription &&
                        <TextField
                            label="Description"
                            fullWidth
                            margin="normal"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled
                            multiline
                            minRows={2}
                        />
                    }
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSelected(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}