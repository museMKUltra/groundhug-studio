import type {Clock} from "@/features/clock/types.ts";

export class SystemClock implements Clock {
    now() {
        return Date.now();
    }
}
