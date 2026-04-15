import type {TextFieldProps} from "@mui/material";
import {Box, TextField, Typography} from "@mui/material";

type ViewEditFieldProps = {
    label: string;
    value: string;
    isEditing: boolean;
    onChange?: (val: string) => void;
    size?: "small" | "medium";
    type?: string;
    multiline?: boolean;
    minRows?: number;
    renderView?: (value: string) => React.ReactNode;
    renderEdit?: (value: string) => React.ReactNode;
    slotProps?: TextFieldProps["slotProps"];
};

export default function ViewEditField({
                                          label,
                                          value,
                                          isEditing,
                                          onChange,
                                          size,
                                          type = "text",
                                          multiline = false,
                                          minRows,
                                          renderView,
                                          renderEdit,
                                          slotProps,
                                      }: ViewEditFieldProps) {
    const viewElement = renderView
        ? (renderView(value))
        : (<Typography
            variant="body1"
            color="text.primary"
            sx={{
                minHeight: 40,
                display: "flex",
                alignItems: "center",
                whiteSpace: "normal",
                wordBreak: "break-word",
            }}
        >
            {value || "--"}
        </Typography>);

    const editElement = renderEdit ? renderEdit(value) : <TextField
        size={size}
        type={type}
        fullWidth
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        multiline={multiline}
        minRows={minRows}
        slotProps={slotProps}
    />;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
                maxWidth: 360,
                alignItems: "center",
                px: 1,
                py: 1,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            {isEditing ? editElement : viewElement}
        </Box>
    );
};