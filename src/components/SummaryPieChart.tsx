import {PieChart} from "@mui/x-charts/PieChart";
import {useLabelContext} from "@/features/attendance/LabelContext";

import type {SummaryLabel} from "@/features/attendance/types";
import {Box} from "@mui/material";

interface Props {
    summaryLabels: SummaryLabel[];
}

export default function LabelPieChart({summaryLabels}: Props) {
    const {labels} = useLabelContext();
    const labelMeta = labels.reduce((meta, label) => {
        meta[label.id] = {name: label.name, color: label.color};
        return meta;
    }, {} as Record<number, { name: string; color: string }>);

    const total = summaryLabels.reduce((sum, l) => sum + l.workMinutes, 0);

    const pieData = summaryLabels.map((l) => ({
        id: l.id,
        value: l.workMinutes,
        label: labelMeta[l.id]?.name || "no label",
        color: labelMeta[l.id]?.color || "#ffffff",
    }));

    return (
        <Box sx={{backgroundColor: "main.background"}}>
            <PieChart
                series={[
                    {
                        data: pieData,
                        arcLabel: (item) =>
                            `${((item.value / total) * 100).toFixed(1)}%`,
                    },
                ]}
                width={400}
                height={300}
            />
        </Box>
    );
}