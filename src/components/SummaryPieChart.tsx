import {PieChart} from "@mui/x-charts/PieChart";
import {Box} from "@mui/material";

import type {SummaryLabel} from "@/features/attendance/types";
import {getPieSeries} from "@/features/attendance/utils";

interface Props {
    summaryLabels: SummaryLabel[];
}

export default function LabelPieChart({summaryLabels}: Props) {
    const series = getPieSeries(summaryLabels);

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