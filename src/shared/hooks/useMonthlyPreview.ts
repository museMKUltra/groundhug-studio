import {useState} from "react";
import type {AxiosError} from "axios";
import {useSummary} from "@/features/attendance/hooks.ts";
import {useSnackbar} from "@/shared/providers/SnackbarContext.ts";

export function useMonthlyPreview(year: number, month: number) {
    const {monthSummary, loading, previewSummary} = useSummary();
    const {showError} = useSnackbar();
    const [open, setOpen] = useState(false);

    const handleOpenPreview = async () => {
        if (year === 0 || month === 0) return;
        try {
            await previewSummary(year, month);
            setOpen(true);
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>;
            showError(error?.response?.data?.error || "Something went wrong");
        }
    };

    return {monthSummary, loading, open, setOpen, handleOpenPreview};
}
