import {useEffect, useMemo, useRef, useState} from "react";
import type {OptionsResponse, WorkSummaryResponse} from "../../types";

import {workSummaryRepository} from "../../infrastructure/repositories/workSummaryRepositoryImpl";
import {
    createGetWorkSummaryListUseCase,
    createGetWorkSummaryOptionsUseCase
} from "../../application/usecases/getWorkSummaryList";

export const useWorkSummary = (pageSize: number = 10) => {
    const isFirstFetch = useRef(true);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [projectId, setProjectId] = useState(0);
    const [data, setData] = useState<WorkSummaryResponse | null>(null);
    const [options, setOptions] = useState<OptionsResponse | null>(null);

    // build use case with repository (dependency injection style)
    const getWorkSummaryList = useMemo(
        () => createGetWorkSummaryListUseCase(workSummaryRepository),
        []
    );
    const getWorkSummaryOptions = useMemo(
        () => createGetWorkSummaryOptionsUseCase(workSummaryRepository),
        []
    );

    const list = data?.content ?? [];
    const totalPages = data?.page.totalPages ?? 0;
    const projects = options?.projects ?? [];

    const fetchData = async () => {
        try {
            setLoading(true);

            const [dataResult, optionsResult] = await Promise.allSettled([
                getWorkSummaryList(page - 1, pageSize),
                getWorkSummaryOptions(),
            ]);

            if (dataResult.status === "fulfilled") {
                setData(dataResult.value);
            } else {
                console.error("Failed to fetch work summary list:", dataResult.reason);
            }

            if (optionsResult.status === "fulfilled") {
                setOptions(optionsResult.value);
            } else {
                console.error("Failed to fetch work summary options:", optionsResult.reason);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateList = async () => {
        try {
            setLoading(true);

            const data = projectId
                ? await getWorkSummaryList(
                    page - 1,
                    pageSize,
                    projectId,
                )
                : await getWorkSummaryList(
                    page - 1,
                    pageSize,
                );

            setData(data);
        } catch (error) {
            console.error("Failed to update work summary list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstFetch.current) {
            fetchData();
            isFirstFetch.current = false;
            return;
        }

        updateList();
    }, [page, projectId]);

    return {
        loading,
        page,
        setPage,
        setProjectId,
        list,
        updateList,
        totalPages,
        projects,
    };
};