import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Time = { clockIn: string, clockOut: string };

export function getDuration(time: Time) {
    const {clockIn, clockOut} = time;
    if (!clockIn || !clockOut) {
        return "--";
    }

    const start = dayjs(clockIn);
    const diff = dayjs(clockOut).diff(start);
    const duration = dayjs.duration(diff);
    const hours = duration.days() * 24 + duration.hours();
    const minutes = duration.minutes();
    const hourText = `${hours}h`;
    const minutesText = `${minutes}m`;

    if (hours === 0) {
        return `${minutesText}`;
    }
    return `${hourText} ${minutesText}`;
}
