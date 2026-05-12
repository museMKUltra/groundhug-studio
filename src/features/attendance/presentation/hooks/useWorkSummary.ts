import {useEffect, useMemo, useState} from "react";
import type {WorkSummaryResponse} from "../../types";

import {workSummaryRepository} from "../../infrastructure/repositories/workSummaryRepositoryImpl";
import {createGetWorkSummaryListUseCase} from "../../application/usecases/getWorkSummaryList";

export const useWorkSummary = (pageSize: number = 10) => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [data, setData] = useState<WorkSummaryResponse | null>(null);

    // build use case with repository (dependency injection style)
    const getWorkSummaryList = useMemo(
        () => createGetWorkSummaryListUseCase(workSummaryRepository),
        []
    );

    const list = data?.content ?? [];
    const totalPages = data?.page.totalPages ?? 0;

    const fetchData = async () => {
        try {
            setLoading(true);

            const response = await getWorkSummaryList(
                page - 1,
                pageSize,
            );

            setData(response);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    return {
        loading,
        page,
        setPage,
        list,
        totalPages,
    };
};