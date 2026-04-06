import {Chip} from "@mui/material";

export type Label = {
    id: number;
    name: string;
    color: string;
};

type Props = {
    label: Label;
};

export default function LabelChip({label}: Props) {
    return (
        <Chip
            label={label.name}
            size="small"
            sx={(theme) => ({
                maxWidth: 140,
                bgcolor: label.color,
                color: theme.palette.getContrastText(label.color),
                fontWeight: 500,

                // ellipsis handling
                "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                },
            })}
        />
    );
}