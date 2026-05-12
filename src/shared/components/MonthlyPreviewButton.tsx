import {Button} from "@mui/material";
import MonthlySummaryDialog from "@/shared/components/MonthlySummaryDialog.tsx";
import {useMonthlyPreview} from "@/shared/hooks/useMonthlyPreview.ts";

interface Props {
    year: number;
    month: number;
    textContent: string;
    size?: "small" | "medium" | "large";
}

export default function MonthlyPreviewButton({year, month, textContent, size = "medium"}: Props) {
    const {monthSummary, loading, open, setOpen, handleOpenPreview} = useMonthlyPreview(year, month);

    return <>
        <Button
            variant="outlined"
            onClick={handleOpenPreview}
            disabled={loading}
            size={size}
        >
            {textContent}
        </Button>

        <MonthlySummaryDialog
            open={open}
            onClose={() => setOpen(false)}
            monthSummary={monthSummary}
        />
    </>
}