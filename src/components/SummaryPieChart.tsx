import {PieChart} from "@mui/x-charts/PieChart";
import {Box} from "@mui/material";

import type {SummaryLabel} from "@/features/attendance/types";

// helper
function hexToRgba(hex: string, alpha: number) {
    if (!hex.startsWith("#") || hex.length !== 7) return hex;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatMinutes(value: number) {
    const h = Math.floor(value / 60);
    const m = value % 60;

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

interface Props {
    summaryLabels: SummaryLabel[];
}

export default function LabelPieChart({summaryLabels}: Props) {
    const total = summaryLabels.reduce((sum, l) => sum + l.workMinutes, 0);

    const localTotal = summaryLabels
        .filter((l) => !l.isGlobal)
        .reduce((s, l) => s + l.workMinutes, 0);

    const globalTotal = summaryLabels
        .filter((l) => l.isGlobal)
        .reduce((s, l) => s + l.workMinutes, 0);

    const globalData = [
        {
            id: "local",
            label: "Counts toward salary",
            value: localTotal,
            color: hexToRgba("#1976d2", 0.6)
        },
        {
            id: "global",
            label: "Not counted toward salary",
            value: globalTotal,
            color: hexToRgba("#9e9e9e", 0.6),
        },
    ];

    const labelData = summaryLabels
        .map((l) => ({
            id: l.id,
            label: l.name || "None",
            value: l.workMinutes,
            color: l.color || "#ffffff",
            isGlobal: l.isGlobal,
        }))
        .sort((a, b) => Number(a.isGlobal) - Number(b.isGlobal));

    const innerRadius = 20;
    const outerRadius = innerRadius + 60;
    const gap = 5;

    const labelInnerRadius = outerRadius + gap;
    const labelOuterRadius = labelInnerRadius + 40;

    return (
        <Box sx={{backgroundColor: "grey.100", p: 2}}>
            <PieChart
                series={[
                    {
                        innerRadius,
                        outerRadius,
                        data: globalData,
                        valueFormatter: ({value}) => `${formatMinutes(value)} (${((value / total) * 100).toFixed(0)}%)`,
                        highlightScope: {fade: "global", highlight: "item"},
                    },

                    {
                        innerRadius: labelInnerRadius,
                        outerRadius: labelOuterRadius,
                        data: labelData,
                        arcLabel: (item) => `${item.label}`,
                        valueFormatter: ({value}) => `${formatMinutes(value)} (${((value / total) * 100).toFixed(0)}%)`,
                        arcLabelMinAngle: 30,
                        highlightScope: {fade: "global", highlight: "item"},
                    },
                ]}
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