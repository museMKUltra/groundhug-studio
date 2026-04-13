import {
    AppBar,
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from "@mui/material";
import SettingsDialog from "@/components/SettingsDialog";
import type {SettingsDialogHandle} from "@/components/SettingsDialog";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";

export default function Header() {
    const {logout, setMe} = useAuth();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const settingsRef = useRef<SettingsDialogHandle>(null);

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

    const handleOpenSettings = () => {
        handleMenuClose();
        settingsRef.current?.open();
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

            <SettingsDialog ref={settingsRef}/>
        </>
    );
}
