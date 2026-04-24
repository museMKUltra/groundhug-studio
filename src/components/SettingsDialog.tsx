import {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks";
import {useEmployeeRate} from "@/features/attendance/hooks";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {AxiosError} from "axios";
import ViewEditField from "@/components/ViewEditField.tsx";

export interface SettingsDialogHandle {
    open: () => void;
}

const SettingsDialog = forwardRef<SettingsDialogHandle>(function SettingsDialog(_, ref) {
    const {user, isAdmin, hourlyRate, updateUser, setHourlyRate} = useAuth();
    const {showError, showSuccess} = useSnackbar();
    const {update} = useUsers();
    const {createEmployeeRate} = useEmployeeRate();

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [rate, setRate] = useState(0);

    const initialName = user?.name || "";
    const initialRate = hourlyRate || 0;

    const hasChanged = name !== initialName || rate !== initialRate;

    useImperativeHandle(ref, () => ({
        open() {
            setName(user?.name || "");
            setRate(hourlyRate || 0);
            setIsEditing(false);
            setOpen(true);
        },
    }));

    const handleClose = () => {
        setIsEditing(false);
        setOpen(false);
    };

    const handleCancelEdit = () => {
        if (hasChanged) {
            if (!window.confirm("Discard changes?")) return;
        }
        setName(user?.name || "");
        setRate(hourlyRate || 0);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const trimmedName = name.trim();
            const nameChanged = trimmedName && trimmedName !== user?.name;
            const rateChanged = rate !== hourlyRate;

            if (!nameChanged && !rateChanged) {
                setIsEditing(false);
                return;
            }

            setIsLoading(true);
            await Promise.all([
                nameChanged ? update(trimmedName).then(() => updateUser({name: trimmedName})) : Promise.resolve(),
                rateChanged ? createEmployeeRate(rate).then(() => setHourlyRate(rate)) : Promise.resolve(),
            ]);

            showSuccess("Settings saved");
            setIsEditing(false);
        } catch (err: unknown) {
            const error = err as AxiosError<{ error?: string; name?: string }>;
            console.error(error);
            showError(error?.response?.data?.name || error?.response?.data?.error || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={isEditing ? undefined : handleClose}>
            <DialogTitle sx={{pr: 1}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <span>{isEditing ? "Edit Settings" : "Settings"}</span>

                    <Stack direction="row" spacing={0.5}>
                        {isEditing ? (
                            <IconButton onClick={handleCancelEdit} size="small">
                                <CloseIcon fontSize="small"/>
                            </IconButton>
                        ) : (
                            <IconButton onClick={() => setIsEditing(true)} size="small">
                                <EditIcon fontSize="small"/>
                            </IconButton>
                        )}
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{pt: 2}}>
                <ViewEditField
                    label="Name"
                    value={name}
                    isEditing={isEditing}
                    size="small"
                    onChange={setName}
                />

                <ViewEditField
                    label="Email"
                    value={user?.email || ""}
                    isEditing={false}
                    size="small"
                    renderView={(val) => (
                        <Typography sx={{lineHeight: "40px"}}>
                            {val || "--"}
                        </Typography>
                    )}
                />

                {
                    isAdmin && <ViewEditField
                        label="Hourly Rate"
                        value={String(rate)}
                        isEditing={isEditing}
                        size="small"
                        type="number"
                        onChange={(val) => setRate(Number(val))}
                        renderView={(val) => (
                            <Typography sx={{lineHeight: "40px"}}>
                                {val ? `${Number(val).toLocaleString()} TWD` : "--"}
                            </Typography>
                        )}
                    />
                }
            </DialogContent>

            <DialogActions>
                {isEditing
                    ? <Button variant="contained" onClick={handleSave} disabled={!hasChanged || isLoading}>Save</Button>
                    : <Button onClick={handleClose}>Close</Button>
                }
            </DialogActions>
        </Dialog>
    );
});

export default SettingsDialog;
