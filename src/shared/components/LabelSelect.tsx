import {MenuItem, TextField} from "@mui/material";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import type {Label} from "./LabelChip.tsx";
import LabelChip from "./LabelChip.tsx";

type Props = {
    labels: Label[];
    value?: number;
    defaultValue?: number;
    onChange: (value: number) => void;
    onManage?: () => void;
    label?: string;
    size?: "small" | "medium";
};

export default function LabelSelect({labels, value, defaultValue = 0, onChange, onManage, label, size}: Props) {
    return (
        <TextField
            select
            size={size}
            label={label}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => {
                const val = e.target.value;

                if (val === "manage") {
                    onManage?.();
                    return;
                }

                onChange(Number(val));
            }}
            fullWidth
        >
            <MenuItem value="0">
                <em>
                    <LabelChip label={{id: 0, name: "None", color: "#ffffff"}}/>
                </em>
            </MenuItem>

            {labels.map((label) => (
                <MenuItem key={label.id} value={label.id}>
                    <LabelChip label={label}/>
                </MenuItem>
            ))}

            {onManage && (
                <MenuItem value="manage">
                    <EditSquareIcon fontSize="small"/>
                </MenuItem>
            )}
        </TextField>
    );
}