import {useEffect, useState} from "react";
import type {WorkSummaryResponse} from "@/features/attendance/types.ts";
import {useSummary} from "@/features/attendance/hooks.ts";

export const useWorkSummary = (pageSize: number = 10) => {
    const {getWorkSummaryList} = useSummary()

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [data, setData] = useState<WorkSummaryResponse | null>(null)

    const list = data?.content ?? []
    const totalPages = data?.page.totalPages ?? 0

    useEffect(() => {
        fetchData()
    }, [page])

    const fetchData = async () => {
        try {
            setLoading(true)

            const response = await getWorkSummaryList(page - 1, pageSize)

            setData(response)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        page,
        setPage,
        list,
        totalPages,
    };
};