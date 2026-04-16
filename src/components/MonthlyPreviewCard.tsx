import {useState} from "react";
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import type {AxiosError} from "axios";
import {useSummary} from "@/features/attendance/hooks.ts";
import {useAuth} from "@/features/auth/hooks.ts";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {Summary} from "@/features/attendance/types.ts";

interface Props {
    todaySummary: Summary | null;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("zh-TW", {
        style: "currency",
        currency: "TWD",
        maximumFractionDigits: 0,
    }).format(value);

export default function MonthlyPreviewCard({todaySummary}: Props) {
    const {isAdmin} = useAuth();
    const {monthSummary, loading, previewSummary} = useSummary();
    const {showError} = useSnackbar();
    const [open, setOpen] = useState(false);

    const handleOpenPreview = async () => {
        if (todaySummary === null) return;
        try {
            const {year, month} = todaySummary;
            await previewSummary(year, month);
            setOpen(true);
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>;
            showError(error?.response?.data?.error || "Something went wrong");
        }
    };

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

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Monthly Summary</DialogTitle>
                <DialogContent>
                    {monthSummary ? (
                        <Stack spacing={1} sx={{mt: 1}}>
                            <Typography>
                                Time: {monthSummary.year}/{monthSummary.month.toString().padStart(2, '0')}
                            </Typography>
                            <Typography>
                                Total Minutes: {monthSummary.totalMinutes} ({monthSummary.totalHours?.toFixed(2)}h)
                            </Typography>
                            {isAdmin && <>
                                <Typography>Hourly Rate: {formatCurrency(monthSummary.hourlyRate)}</Typography>
                                <Typography fontWeight="bold">
                                    Total Salary: {formatCurrency(monthSummary.salaryAmount)}
                                </Typography>
                            </>}
                        </Stack>
                    ) : (
                        <Typography>No data</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
