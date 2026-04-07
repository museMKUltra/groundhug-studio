import {
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
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from '@mui/icons-material/Logout';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";

export default function Header() {
    const {logout, user, hourlyRate, setMe} = useAuth();
    const navigate = useNavigate();

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

    const handleOpenProfile = () => {
        handleMenuClose();
        setOpenDialog(true);
    };

    const handleCloseProfile = () => {
        setOpenDialog(false);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate("/login");
    };

    useEffect(() => {
        setMe();
    }, []);

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
                        value={user?.name || ""}
                        disabled
                    />

                    <TextField
                        label="Hourly Rate"
                        fullWidth
                        margin="normal"
                        value={hourlyRate}
                        disabled
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseProfile}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}