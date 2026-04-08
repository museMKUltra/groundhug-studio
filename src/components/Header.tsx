import {
    Alert,
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
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

    // menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    // dialog state
    const [openDialog, setOpenDialog] = useState(false);

    // snackbar state
    const [error, setError] = useState<string>("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

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

    const handleOpenProfile = () => {
        handleMenuClose();
        setName(user?.name || "");
        setEmail(user?.email || "");
        setRate(hourlyRate || 0);
        setOpenDialog(true);
    };

    const handleCloseProfile = () => {
        setOpenDialog(false);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleSaveProfile = async () => {
        try {
            if (name !== user?.name) {
                await update(name);
                updateUser({name});
            }

            if (rate !== hourlyRate) {
                await createEmployeeRate(rate);
                setHourlyRate(rate);
            }

            setOpenDialog(false);
        } catch (err: unknown) {
            const error = err as AxiosError<{
                error?: string
                name?: string
            }>;
            console.error(error);
            setError(error?.response?.data?.name
                || error?.response?.data?.error
                || "Something went wrong");
            setOpenSnackbar(true);
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
                        <MenuItem onClick={handleOpenProfile}>
                            Profile
                        </MenuItem>

                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon fontSize="small"/>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Profile Dialog */}
            <Dialog open={openDialog} onClose={handleCloseProfile}>
                <DialogTitle>Profile</DialogTitle>

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
                    <Button onClick={handleCloseProfile}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSaveProfile}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    variant="filled"
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}