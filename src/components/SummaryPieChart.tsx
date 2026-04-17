import {PieChart} from "@mui/x-charts/PieChart";

import type {SummaryLabel} from "@/features/attendance/types";
import {Box} from "@mui/material";

interface Props {
    summaryLabels: SummaryLabel[];
}

export default function LabelPieChart({summaryLabels}: Props) {
    const total = summaryLabels.reduce((sum, l) => sum + l.workMinutes, 0);

    const pieData = summaryLabels.map((l) => ({
        id: l.id,
        value: l.workMinutes,
        label: l.name || "None",
        color: l.color || "#ffffff",
    }));

    return (
        <Box sx={{backgroundColor: "grey.100"}}>
            <PieChart
                series={[
                    {
                        data: pieData,
                        arcLabel: (item) =>
                            `${((item.value / total) * 100).toFixed(1)}%`,
                        arcLabelMinAngle: 30,
                        innerRadius: 40,
                        outerRadius: 100,
                        valueFormatter: (item) =>
                            `${(item.value / 60).toFixed(1)}h`,
                    },
                ]}
                width={400}
                height={300}
            />
        </Box>
    );
}