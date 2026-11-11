import {useMemo, useState} from "react";
import {createPortal} from "react-dom";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {
    Box,
    Button,
    CssBaseline,
    IconButton,
    LinearProgress,
    Slider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import dayjs from "dayjs";

import {
    MAX_DURATION_MINUTES,
    MIN_DURATION_MINUTES,
    STEP_MINUTES,
} from "@/features/attendance/useBreakReminder.ts";

const QUICK_DURATIONS = [30, 60, 90];

interface Props {
    pipWindow: Window;
    isActive: boolean;
    isTimeUp: boolean;
    withReminder: boolean;
    durationMinutes: number;
    startedAt: number | null;
    deadline: number | null;
    now: number;
    onDurationChange: (minutes: number) => void;
    onDismiss: () => void;
}

function formatClock(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");

    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Floating break-reminder timer rendered into a Document PiP window.
 * The window stays on top of other apps, so it doubles as the time-up alert.
 */
export default function BreakReminderPip({pipWindow, ...props}: Props) {
    // MUI (Emotion) must inject its styles into the PiP document, not the opener.
    const cache = useMemo(
        () => createCache({key: "pip", container: pipWindow.document.head}),
        [pipWindow]
    );

    return createPortal(
        <CacheProvider value={cache}>
            <CssBaseline/>
            <PipContent {...props}/>
        </CacheProvider>,
        pipWindow.document.body
    );
}

function PipContent(
    {
        isActive,
        isTimeUp,
        withReminder,
        durationMinutes,
        startedAt,
        deadline,
        now,
        onDurationChange,
        onDismiss,
    }: Omit<Props, "pipWindow">
) {
    const isRunning = isActive && startedAt !== null && deadline !== null;
    const remaining = isRunning ? deadline - now : 0;
    const isDue = isRunning && remaining <= 0;
    const total = isRunning ? deadline - startedAt : 0;
    const progress = isRunning
        ? Math.min(100, Math.max(0, ((now - startedAt) / (total || 1)) * 100))
        : 0;

    const headline = !isActive
        ? "--:--"
        : isDue
            ? "Due"
            : formatClock(remaining);

    return (
        <Box
            sx={{
                p: 2,
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: isTimeUp ? "#fdecea" : "background.paper",
                transition: "background-color 0.3s",
            }}
        >
            {isTimeUp ? (
                <Stack spacing={1} alignItems="center" textAlign="center" sx={{flex: 1, justifyContent: "center"}}>
                    <Typography variant="h6" fontWeight={700}>
                        Time's up! 🎉
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You've been focusing for {durationMinutes} minutes.
                        It's time to take a break.
                    </Typography>
                    <Button variant="contained" onClick={onDismiss} sx={{mt: 1}}>
                        Take a Break
                    </Button>
                </Stack>
            ) : (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            {!isActive
                                ? "No active cycle"
                                : withReminder
                                    ? "Remaining"
                                    : "Reminder off"}
                        </Typography>
                        {isRunning && (
                            <Typography variant="caption" color="text.secondary">
                                Remind at {dayjs(deadline).format("HH:mm")}
                            </Typography>
                        )}
                    </Box>

                    <Typography
                        variant="h3"
                        fontWeight={700}
                        textAlign="center"
                        color={isDue ? "error" : "text.primary"}
                        sx={{fontVariantNumeric: "tabular-nums"}}
                    >
                        {headline}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={isDue ? "error" : "primary"}
                        aria-label="Cycle progress"
                        sx={{height: 6, borderRadius: 999}}
                    />

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        Elapsed {isRunning ? formatClock(now - startedAt) : "--:--"}
                    </Typography>
                </>
            )}

            <DurationSetting
                durationMinutes={durationMinutes}
                onDurationChange={onDurationChange}
            />
        </Box>
    );
}

function DurationSetting(
    {
        durationMinutes,
        onDurationChange,
    }: Pick<Props, "durationMinutes" | "onDurationChange">
) {
    // Preview while dragging; save only on release, so intermediate values
    // do not move the deadline (and possibly fire time-up).
    const [draft, setDraft] = useState<number | null>(null);
    const value = draft ?? durationMinutes;

    const quickValue = QUICK_DURATIONS.includes(value) ? value : null;

    return (
        <Stack spacing={1} sx={{pt: 1, borderTop: 1, borderColor: "divider"}}>
            <Box display="flex" justifyContent="space-between" alignItems="baseline">
                <Typography variant="caption" color="text.secondary">
                    Focus duration
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{fontVariantNumeric: "tabular-nums"}}>
                    {value} min
                </Typography>
            </Box>

            <Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                        size="small"
                        aria-label="Decrease duration"
                        disabled={value <= MIN_DURATION_MINUTES}
                        onClick={() => onDurationChange(value - STEP_MINUTES)}
                    >
                        <RemoveIcon fontSize="small"/>
                    </IconButton>

                    {/* valueLabelDisplay stays "off": its Popper would render in the opener document. */}
                    <Slider
                        size="small"
                        min={MIN_DURATION_MINUTES}
                        max={MAX_DURATION_MINUTES}
                        step={STEP_MINUTES}
                        value={value}
                        onChange={(_, next) => setDraft(next as number)}
                        onChangeCommitted={(_, next) => {
                            setDraft(null);
                            onDurationChange(next as number);
                        }}
                        aria-label="Focus duration"
                    />

                    <IconButton
                        size="small"
                        aria-label="Increase duration"
                        disabled={value >= MAX_DURATION_MINUTES}
                        onClick={() => onDurationChange(value + STEP_MINUTES)}
                    >
                        <AddIcon fontSize="small"/>
                    </IconButton>
                </Box>

                <Box display="flex" justifyContent="space-between" sx={{px: 5}}>
                    <Typography variant="caption" color="text.secondary">
                        {MIN_DURATION_MINUTES} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {MAX_DURATION_MINUTES} min
                    </Typography>
                </Box>
            </Box>

            <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                color="primary"
                value={quickValue}
                onChange={(_, next: number | null) => {
                    if (next !== null) onDurationChange(next);
                }}
                aria-label="Quick select duration"
            >
                {QUICK_DURATIONS.map((minutes) => (
                    <ToggleButton key={minutes} value={minutes}>
                        {minutes}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Stack>
    );
}
