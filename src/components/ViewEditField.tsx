import {Box, TextField, Typography} from "@mui/material";

type ViewEditFieldProps = {
    label: string;
    value: string;
    isEditing: boolean;
    changed?: boolean;
    onChange?: (val: string) => void;
    size?: "small" | "medium";
    type?: string;
    multiline?: boolean;
    minRows?: number;
    renderView?: (value: string) => React.ReactNode;
    renderEdit?: (value: string) => React.ReactNode;
};

export default function ViewEditField({
                                          label,
                                          value,
                                          isEditing,
                                          changed,
                                          onChange,
                                          size,
                                          type = "text",
                                          multiline = false,
                                          minRows,
                                          renderView,
                                          renderEdit,
                                      }: ViewEditFieldProps) {
    const highlight = isEditing && changed
        ? {backgroundColor: "rgba(255,255,0,0.08)", borderRadius: 1}
        : undefined;

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
    />;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                alignItems: "center",
                px: 1,
                py: 1,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            {isEditing ? <Box sx={highlight}>{editElement}</Box> : viewElement}
        </Box>
    );
};