import type {Status} from "@/features/attendance/types.ts";

export const isDraft = (status: Status) => status === "DRAFT";