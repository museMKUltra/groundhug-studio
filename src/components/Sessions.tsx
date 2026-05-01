import {useEffect, useMemo, useState} from "react";
import {Box, Button, IconButton, Tooltip, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {useSessionContext} from "@/features/attendance/SessionContext";
import {useLabelContext} from "@/features/attendance/LabelContext";
import type {Session} from "@/features/attendance/types";
import {getDuration} from "@/utils/duration";
import EditSessionDialog from "@/components/EditSessionDialog.tsx";
import AddSessionDialog from "@/components/AddSessionDialog.tsx";

type Props = {
    onRefresh: () => void;
};

type InteractionState = {
    day: dayjs.Dayjs;
    startY: number;
    currentY: number;
    startTime: number;
    moved: boolean;
} | null;

const MINUTES_IN_DAY = 1440;

export default function Sessions({onRefresh}: Props) {
    const {
        periodSessions,
        updatePeriodSessions,
        updateSession,
        deleteSession,
        addSession,
        weekStart,
        setStartTime,
        setEndTime,
        prevWeek,
        nextWeek,
        goToday
    } = useSessionContext();

    const {labels} = useLabelContext();

    const endDate = useMemo(() => weekStart.add(7, "day"), [weekStart]);
    const weekEnd = useMemo(() => weekStart.add(6, "day"), [weekStart]);

    const weekDays = useMemo(() => {
        return Array.from({length: 7}).map((_, i) => weekStart.add(i, "day"));
    }, [weekStart]);

    useEffect(() => {
        setStartTime(weekStart);
        setEndTime(endDate);
        updatePeriodSessions();
    }, [weekStart]);

    const [selected, setSelected] = useState<Session | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [interaction, setInteraction] = useState<InteractionState>(null);

    const today = dayjs();

    const getMinutesFromY = (y: number, height: number) => {
        const ratio = Math.max(0, Math.min(1, y / height));
        return Math.round(ratio * MINUTES_IN_DAY);
    };

    const snapTo15 = (min: number) => Math.round(min / 15) * 15;

    const createSession = (interaction: InteractionState, rect: DOMRect) => {
        if (!interaction) return;

        const startMin = snapTo15(getMinutesFromY(interaction.startY, rect.height));
        const endMin = snapTo15(getMinutesFromY(interaction.currentY, rect.height));

        const [minStart, minEndRaw] = [startMin, endMin].sort((a, b) => a - b);
        const minEnd = minStart === minEndRaw ? minEndRaw + 60 : minEndRaw;

        openAdd(minStart, minEnd, interaction.day);
    };

    function createNowSession() {
        const day = today;
        const now = dayjs();
        const startMin = now.hour() * 60 + now.minute();
        const snappedStart = Math.floor(startMin / 15) * 15;
        const endMin = snappedStart + 60;
        const safeEnd = Math.min(endMin, 1440);

        openAdd(snappedStart, safeEnd, day);
    }

    const openAdd = (startMin: number, endMin: number, day: dayjs.Dayjs) => {
        const start = day.startOf("day").add(startMin, "minute");
        const end = day.startOf("day").add(endMin, "minute");

        setSelected({
            clockIn: start.format("YYYY-MM-DDTHH:mm"),
            clockOut: end.format("YYYY-MM-DDTHH:mm"),
            label: null,
            description: "",
        } as Session);

        setOpenAddDialog(true);
    };

    const isTouch = useMemo(
        () => window.matchMedia("(pointer: coarse)").matches,
        []
    );

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

                <Box display="flex" gap={1}>
                    {
                        isTouch &&
                        <IconButton onClick={createNowSession}>
                            <AddIcon/>
                        </IconButton>
                    }
                    <Button size="small" variant="outlined" onClick={goToday}>
                        Today
                    </Button>
                </Box>
            </Box>

            {/* MAIN */}
            <Box display="flex">
                {/* TIMELINE */}
                <Box sx={{width: 32, height: 390, position: "relative", top: 32, mr: 1}}>
                    {[
                        {hour: 0, display: 0, section: 'AM'},
                        {hour: 6, display: 6, section: 'AM'},
                        {hour: 12, display: 12, section: 'PM'},
                        {hour: 18, display: 6, section: 'PM'},
                    ].map((time) => (
                        <Box
                            key={time.hour}
                            sx={{
                                position: "absolute",
                                top: `${(time.hour / 24) * 100}%`,
                                transform: "translateY(-50%)",
                                fontSize: 10,
                            }}
                        >
                            {`${String(time.display).padStart(2, "0")} ${time.section}`}
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
                                    color: d.isSame(today, "day") ? "primary.main" : "text.secondary",
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

                                    return {...s, renderStart, renderEnd};
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
                                        cursor: interaction ? "grabbing" : "crosshair",
                                        userSelect: "none",
                                        WebkitUserSelect: "none",
                                    }}
                                    onPointerDown={(e) => {
                                        if (isTouch) return;

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const startY = e.clientY - rect.top;

                                        setInteraction({
                                            day,
                                            startY,
                                            currentY: startY,
                                            startTime: Date.now(),
                                            moved: false,
                                        });
                                    }}
                                    onPointerMove={(e) => {
                                        if (isTouch) return;
                                        if (!interaction) return;

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const currentY = e.clientY - rect.top;
                                        const moved = Math.abs(currentY - interaction.startY) > 5;

                                        setInteraction(prev =>
                                                prev && {
                                                    ...prev,
                                                    currentY,
                                                    moved: prev.moved || moved,
                                                }
                                        );
                                    }}
                                    onPointerUp={(e) => {
                                        if (isTouch) return;
                                        if (!interaction) return;

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const duration = Date.now() - interaction.startTime;

                                        if (interaction.moved && duration > 200) {
                                            createSession(interaction, rect);
                                        }

                                        setInteraction(null);
                                    }}
                                    onPointerLeave={() => setInteraction(null)}
                                >
                                    {/* sessions */}
                                    {daySessions.map((s) => {
                                        const start = s.renderStart;
                                        const end = s.renderEnd;

                                        const startMin = start.hour() * 60 + start.minute();
                                        const endMin = end.hour() * 60 + end.minute();

                                        const top = (startMin / 1440) * 100;
                                        const height = Math.max(((endMin - startMin) / 1440) * 100, 1);

                                        const label = labels.find(l => l.id === s.label?.id);
                                        const color = label ? label.color : 'white';

                                        return (
                                            <Tooltip
                                                key={`${s.id}-${start.toISOString()}`}
                                                placement="left"
                                                arrow
                                                enterDelay={300}
                                                disableHoverListener={Boolean(interaction)}
                                                title={
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={600}>
                                                            {start.format("hh:mm A")} - {end.format("hh:mm A")} ({getDuration({
                                                            clockIn: s.clockIn,
                                                            clockOut: s.clockOut || ""
                                                        })})
                                                        </Typography>

                                                        {s.label && (
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                sx={{opacity: 0.8}}
                                                            >
                                                                {s.label.name}
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
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={() => {
                                                        setSelected(s);
                                                        setOpenEditDialog(true);
                                                    }}
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
                                                            opacity: interaction ? 0.85 : 1,
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}

                                    {/* preview */}
                                    {interaction && interaction.day.isSame(day, "day") && (() => {
                                        const start = Math.min(interaction.startY, interaction.currentY);
                                        const end = Math.max(interaction.startY, interaction.currentY);

                                        const top = (start / 400) * 100;
                                        const height = ((end - start) / 400) * 100;

                                        return (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: 4,
                                                    right: 4,
                                                    top: `${top}%`,
                                                    height: `${height}%`,
                                                    bgcolor: "primary.main",
                                                    opacity: 0.3,
                                                    borderRadius: 1,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                        );
                                    })()}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* EDIT DIALOG */}
            <EditSessionDialog
                key={selected?.id ?? 0}
                session={selected}
                open={openEditDialog}
                onClose={() => {
                    setSelected(null);
                    setOpenEditDialog(false);
                }}
                onSave={(session, needRefresh) => {
                    updateSession(session);
                    setSelected(session);
                    if (needRefresh) onRefresh();
                }}
                onDelete={(session) => {
                    deleteSession(session);
                    setSelected(null);
                    setOpenEditDialog(false);
                    onRefresh();
                }}
            />

            <AddSessionDialog
                key={openAddDialog ? 'new' : 'none'}
                session={selected}
                open={openAddDialog}
                onClose={() => {
                    setSelected(null);
                    setOpenAddDialog(false);
                }}
                onSave={(session, needRefresh) => {
                    addSession(session);
                    setSelected(null);
                    setOpenAddDialog(false);
                    if (needRefresh) onRefresh();
                }}
            />
        </>
    );
}