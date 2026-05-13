import {describe, it, expect} from "vitest";
import {isDraft} from "@/features/attendance/domain/utils/status.ts";

describe("isDraft", () => {
    it("returns true when status is DRAFT", () => {
        expect(isDraft("DRAFT")).toBe(true);
    });

    it("returns false when status is not DRAFT", () => {
        expect(isDraft("CONFIRMED")).toBe(false);
    });
});