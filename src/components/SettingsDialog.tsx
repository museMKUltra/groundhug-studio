import {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks";
import {useEmployeeRate} from "@/features/attendance/hooks";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import type {AxiosError} from "axios";

export interface SettingsDialogHandle {
    open: () => void;
}

const SettingsDialog = forwardRef<SettingsDialogHandle>(function SettingsDialog(_, ref) {
    const {user, hourlyRate, updateUser, setHourlyRate} = useAuth();
    const {showError, showSuccess} = useSnackbar();
    const {update} = useUsers();
    const {createEmployeeRate} = useEmployeeRate();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rate, setRate] = useState(0);

    useImperativeHandle(ref, () => ({
        open() {
            setName(user?.name || "");
            setEmail(user?.email || "");
            setRate(hourlyRate || 0);
            setOpen(true);
        },
    }));

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        try {
            const trimmedName = name.trim();
            const nameChanged = trimmedName && trimmedName !== user?.name;
            const rateChanged = rate !== hourlyRate;

            await Promise.all([
                nameChanged ? update(trimmedName).then(() => updateUser({name: trimmedName})) : Promise.resolve(),
                rateChanged ? createEmployeeRate(rate).then(() => setHourlyRate(rate)) : Promise.resolve(),
            ]);

            if (nameChanged || rateChanged) showSuccess("Settings saved");
            setOpen(false);
        } catch (err: unknown) {
            const error = err as AxiosError<{error?: string; name?: string}>;
            console.error(error);
            showError(error?.response?.data?.name || error?.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Settings</DialogTitle>

            <DialogContent sx={{pt: 2}}>
                <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    disabled
                />

                <TextField
                    label="Hourly Rate"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
});

export default SettingsDialog;
