import {ListItemIcon, ListItemText, MenuItem, TextField} from "@mui/material";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import type {Label} from "./LabelChip";
import LabelChip from "./LabelChip";

type Props = {
    labels: Label[];
    value: number | "";
    onChange: (value: number) => void;
    onManage?: () => void;
};

export default function LabelSelect({labels, value, onChange, onManage}: Props) {
    return (
        <TextField
            select
            label="Label"
            value={value}
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
            <MenuItem value="">
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
                    <ListItemIcon>
                        <BorderColorIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>
                        Manage Labels
                    </ListItemText>
                </MenuItem>
            )}
        </TextField>
    );
}