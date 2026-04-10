import {IconButton, MenuItem, Stack, TextField} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import type {Label} from "./LabelChip";
import LabelChip from "./LabelChip";

type Props = {
    labels: Label[];
    value?: number;
    defaultValue?: number;
    onChange: (value: number) => void;
    onManage?: () => void;
};

export default function LabelSelect({labels, value, defaultValue = 0, onChange, onManage}: Props) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <TextField
                select
                label="Label"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange(Number(e.target.value))}
                fullWidth
            >
                <MenuItem value={0}>
                    <em>
                        <LabelChip label={{id: 0, name: "None", color: "#ffffff"}}/>
                    </em>
                </MenuItem>

                {labels.map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                        <LabelChip label={label}/>
                    </MenuItem>
                ))}
            </TextField>

            {onManage && (
                <IconButton size="small" onClick={onManage}>
                    <EditIcon fontSize="small"/>
                </IconButton>
            )}
        </Stack>
    );
}