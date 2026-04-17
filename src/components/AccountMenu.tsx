import {useRef, useState} from "react";
import {Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import SettingsDialog, {type SettingsDialogHandle,} from "@/components/SettingsDialog";

interface Props {
    onLogout: () => void;
}

export default function AccountMenu({onLogout}: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const settingsRef = useRef<SettingsDialogHandle>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        handleClose();
        onLogout();
    };

    const handleSettingsClick = () => {
        handleClose();
        settingsRef.current?.open();
    };

    return (
        <>
            <Box>
                <IconButton color="inherit" onClick={handleOpen}>
                    <AccountCircle/>
                </IconButton>

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleSettingsClick}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleLogoutClick}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>

            <SettingsDialog ref={settingsRef}/>
        </>
    );
}