import {Button, Card, CardContent, Stack, Typography,} from "@mui/material";
import MonthlySummaryDialog from "@/components/MonthlySummaryDialog";
import {useMonthlyPreview} from "@/components/useMonthlyPreview.ts";

interface Props {
    year: number;
    month: number;
}

export default function MonthlyPreviewCard({year, month}: Props) {
    const {monthSummary, loading, open, setOpen, handleOpenPreview} = useMonthlyPreview(year, month);

    return (
        <>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Monthly</Typography>
                        <Button
                            variant="outlined"
                            onClick={handleOpenPreview}
                            disabled={loading}
                        >
                            Preview Month
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <MonthlySummaryDialog
                open={open}
                onClose={() => setOpen(false)}
                monthSummary={monthSummary}
            />
        </>
    );
}
