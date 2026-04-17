import type {PieSeries} from "@mui/x-charts/PieChart";
import type {SummaryLabel} from "@/features/attendance/types";

// helper
function hexToRgba(hex: string, alpha: number) {
    if (!hex.startsWith("#") || hex.length !== 7) return hex;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatMinutes(value: number) {
    const h = Math.floor(value / 60);
    const m = value % 60;

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function getFilteredTotal(labels: SummaryLabel[], predicate: (label: SummaryLabel) => boolean) {
    return labels
        .filter(predicate)
        .reduce(
            (sum, label) =>
                sum + label.workMinutes, 0
        );
}

function formatValue(value: number, total: number) {
    const percentage = (value / total) * 100;
    const displayPercentage = `(${percentage.toFixed(1)}%)`;

    return `${formatMinutes(value)} ${displayPercentage}`;
}

export const getPieSeries = (labels: SummaryLabel[], withSalaryScope: boolean = false): PieSeries[] => {
    const total = getFilteredTotal(labels, () => true);
    const includedTotal = getFilteredTotal(labels, (l) => !l.isGlobal);
    const excludedTotal = getFilteredTotal(labels, (l) => l.isGlobal);

    const salaryScopeData = [
        {
            id: "included",
            label: "Counts toward salary",
            value: includedTotal,
            color: hexToRgba("#1976d2", 0.6)
        },
        {
            id: "excluded",
            label: "Not counted toward salary",
            value: excludedTotal,
            color: hexToRgba("#9e9e9e", 0.6),
        },
    ];

    const labelData = labels
        .map((l) => ({
            id: l.id,
            label: l.name || "None",
            value: l.workMinutes,
            color: l.color || "#ffffff",
            isGlobal: l.isGlobal,
        }))
        .sort((a, b) => Number(a.isGlobal) - Number(b.isGlobal));

    const innerRadius = 20;
    const outerRadius = innerRadius + 100;
    const gap = 5;

    const scopeInnerRadius = outerRadius + gap;
    const scopeOuterRadius = scopeInnerRadius + 20;

    const series: PieSeries[] = [
        {
            innerRadius,
            outerRadius,
            data: labelData,
            arcLabel: ({label}) => `${label}`,
            valueFormatter: ({value}) => formatValue(value, total),
            arcLabelMinAngle: 30,
            highlightScope: {fade: "global", highlight: "item"},
        },
    ];

    if (withSalaryScope) {
        series.push({
            innerRadius: scopeInnerRadius,
            outerRadius: scopeOuterRadius,
            data: salaryScopeData,
            valueFormatter: ({value}) => formatValue(value, total),
            highlightScope: {fade: "global", highlight: "item"},
        });
    }

    return series;
}

