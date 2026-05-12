import {PieChart} from "@mui/x-charts/PieChart";
import {Box} from "@mui/material";

import type {SummaryLabel} from "@/features/attendance/types.ts";
import {getPieSeries} from "@/features/attendance/utils.ts";
import {useAuth} from "@/features/auth/hooks.ts";

interface Props {
    summaryLabels: SummaryLabel[];
}

export default function LabelPieChart({summaryLabels}: Props) {
    const {isAdmin} = useAuth();
    const series = getPieSeries(summaryLabels, isAdmin);

    return (
        <Box sx={{
            display: {xs: "none", md: "block"},
            backgroundColor: "grey.100",
            p: 2
        }}>
            <PieChart
                series={series}
                width={420}
                height={320}
                slotProps={{
                    pieArc: {
                        strokeWidth: 0,
                    },
                }}
            />
        </Box>
    );
}