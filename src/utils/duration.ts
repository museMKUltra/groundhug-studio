import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Time = { clockIn: string, clockOut: string };

export function getDuration(time: Time, withSeconds: boolean = false) {
    const {clockIn, clockOut} = time;
    if (!clockIn || !clockOut) return "--";

    const d = dayjs.duration(dayjs(clockOut).diff(dayjs(clockIn)));
    const h = d.days() * 24 + d.hours();
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
