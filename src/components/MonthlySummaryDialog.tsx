import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import type {Summary} from "@/features/attendance/types.ts";
import SummaryPieChart from "@/components/SummaryPieChart";
import {formatMinutes} from "@/features/attendance/utils";
import {useAuth} from "@/features/auth/hooks.ts";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("zh-TW", {
        style: "currency",
        currency: "TWD",
        maximumFractionDigits: 0,
    }).format(value);

interface Props {
    open: boolean;
    onClose: () => void;
    monthSummary: Summary | null;
}

export default function MonthlySummaryDialog({open, onClose, monthSummary}: Props) {
    const {isAdmin} = useAuth();

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Monthly Summary</DialogTitle>
            <DialogContent>
                {monthSummary ? (
                    <Stack spacing={1} sx={{mt: 1}}>
                        <Typography>
                            Month: {monthSummary.year}/{monthSummary.month.toString().padStart(2, '0')}
                        </Typography>
                        <Typography>
                            Total Time: {formatMinutes(monthSummary.totalMinutes)}
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
                <SummaryPieChart summaryLabels={monthSummary?.labels || []}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
