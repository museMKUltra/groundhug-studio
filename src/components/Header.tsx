import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import {useSnackbar} from "@/context/SnackbarContext.ts";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks";
import {useEmployeeRate} from "@/features/attendance/hooks";
import type {AxiosError} from "axios";

export default function Header() {
    const {logout, user, hourlyRate, setMe, updateUser, setHourlyRate} = useAuth();
    const navigate = useNavigate();
    const {showError, showSuccess} = useSnackbar();

    // menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    // dialog state
    const [openDialog, setOpenDialog] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate("/login");
    };

    useEffect(() => {
        setMe();
    }, []);


    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [rate, setRate] = useState<number>(0);

    const {update} = useUsers();
    const {createEmployeeRate} = useEmployeeRate();

    const handleOpenSettings = () => {
        handleMenuClose();
        setName(user?.name || "");
        setEmail(user?.email || "");
        setRate(hourlyRate || 0);
        setOpenDialog(true);
    };

    const handleCloseSettings = () => {
        setOpenDialog(false);
    };

    const handleSaveSettings = async () => {
        try {
            const trimmedName = name.trim();
            const nameChanged = trimmedName && trimmedName !== user?.name;
            const rateChanged = rate !== hourlyRate;

            await Promise.all([
                nameChanged ? update(trimmedName).then(() => updateUser({name: trimmedName})) : Promise.resolve(),
                rateChanged ? createEmployeeRate(rate).then(() => setHourlyRate(rate)) : Promise.resolve(),
            ]);

            if (nameChanged || rateChanged) {
                showSuccess("Settings saved");
            }
            setOpenDialog(false);
        } catch (err: unknown) {
            const error = err as AxiosError<{
                error?: string
                name?: string
            }>;
            console.error(error);
            showError(error?.response?.data?.name
                || error?.response?.data?.error
                || "Something went wrong");
        }
    };

    return (
        <>
            <AppBar position="static" elevation={1}>
                <Toolbar>
                    <Typography variant="h6">Attendance</Typography>

                    <Box sx={{flexGrow: 1}}/>

                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <AccountCircle/>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleOpenSettings}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Settings Dialog */}
            <Dialog open={openDialog} onClose={handleCloseSettings}>
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
                    <Button onClick={handleCloseSettings}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSaveSettings}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}