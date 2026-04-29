import type {Clock} from "@/features/clock/types.ts";

export class DemoClock implements Clock {
    private offsetMs = 0;

    now(): number {
        return Date.now() + this.offsetMs;
    }

    addHours(hours: number) {
        this.offsetMs += hours * 60 * 60 * 1000;
    }

    addMinutes(minutes: number) {
        this.offsetMs += minutes * 60 * 1000;
    }

    reset() {
        this.offsetMs = 0;
    }

    getOffset() {
        return this.offsetMs;
    }
}
