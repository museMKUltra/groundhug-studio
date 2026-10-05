import {beforeEach, describe, expect, it, vi} from "vitest";
import {act, renderHook, waitFor} from "@testing-library/react";

import {useWorkSummary} from "@/features/attendance/presentation/hooks/useWorkSummary";
import * as repo from "@/features/attendance/infrastructure/repositories/workSummaryRepositoryImpl";

vi.mock(
    "@/features/attendance/infrastructure/repositories/workSummaryRepositoryImpl"
);

describe("useWorkSummary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads data on mount", async () => {
        const mockedGetList = vi.mocked(
            repo.workSummaryRepository.getList
        );

        mockedGetList.mockResolvedValue({
            content: [{
                id: 1,
                year: 2026,
                month: 5,
                totalMinutes: 10,
                status: "DRAFT",
                hourlyRate: 100,
                salaryAmount: 1000,
                project: {
                    id: 1,
                    name: "Default",
                    description: null,
                    status: "ACTIVE",
                    createdAt: "2026-09-18T13:24:47Z"
                }
            }],
            page: {
                size: 10,
                number: 2,
                totalElements: 26,
                totalPages: 3
            },
        });

        const {result} = renderHook(() =>
            useWorkSummary(10)
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.list).toEqual([{
            id: 1,
            year: 2026,
            month: 5,
            totalMinutes: 10,
            status: "DRAFT",
            hourlyRate: 100,
            salaryAmount: 1000,
            project: {
                id: 1,
                name: "Default",
                description: null,
                status: "ACTIVE",
                createdAt: "2026-09-18T13:24:47Z"
            }
        }]);
        expect(result.current.totalPages).toBe(3);
    });

    it("changes page triggers reload", async () => {
        const mockedGetList = vi.mocked(
            repo.workSummaryRepository.getList
        );

        mockedGetList.mockResolvedValue({
            content: [{
                id: 1,
                year: 2026,
                month: 5,
                totalMinutes: 10,
                status: "DRAFT",
                hourlyRate: 100,
                salaryAmount: 1000,
                project: {
                    id: 1,
                    name: "Default",
                    description: null,
                    status: "ACTIVE",
                    createdAt: "2026-09-18T13:24:47Z"
                }
            }],
            page: {
                size: 10,
                number: 2,
                totalElements: 26,
                totalPages: 3
            },
        });

        const {result} = renderHook(() =>
            useWorkSummary(10)
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            result.current.setPage(2);
        });

        // initial
        expect(mockedGetList).toHaveBeenNthCalledWith(1, 0, 10, 0);
        // page 2
        expect(mockedGetList).toHaveBeenNthCalledWith(2, 1, 10, 0);
    });

    it("changes project triggers reload", async () => {
        const mockedGetList = vi.mocked(
            repo.workSummaryRepository.getList
        );

        mockedGetList.mockResolvedValue({
            content: [],
            page: {
                size: 10,
                number: 0,
                totalElements: 0,
                totalPages: 0
            },
        });

        const {result} = renderHook(() =>
            useWorkSummary(10)
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            result.current.setProjectId(9);
        });

        await waitFor(() => {
            expect(mockedGetList).toHaveBeenCalledWith(0, 10, 9);
        });
    });
});