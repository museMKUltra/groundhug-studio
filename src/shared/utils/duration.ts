import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Time = {
    clockIn: string;
    clockOut: string;
};

export function getDurationSeconds(time: Time): number {
    const {clockIn, clockOut} = time;
    if (!clockIn || !clockOut) return 0;

    return dayjs(clockOut).diff(dayjs(clockIn), "second");
}

export function formatDuration(seconds: number, withSeconds: boolean = false): string {
    const d = dayjs.duration(seconds, "second");

    const h = Math.floor(d.asHours());
    const m = d.minutes();
    const s = d.seconds();

    if (withSeconds) {
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export function getDuration(time: Time, withSeconds: boolean = false) {
    return formatDuration(getDurationSeconds(time), withSeconds);
}