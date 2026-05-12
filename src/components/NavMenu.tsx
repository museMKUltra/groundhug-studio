import {useState} from "react";
import {Box, IconButton, Menu, MenuItem, Typography,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {NavLink} from "react-router-dom";
import type {AppRoute} from "@/app/routes/config";

interface Props {
    pages: AppRoute[];
}

export default function NavMenu({pages}: Props) {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <Box>
            <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
            >
                <MenuIcon/>
            </IconButton>

            <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
            >
                {pages.map((page) => (
                    <MenuItem
                        key={page.label}
                        component={NavLink}
                        to={page.path}
                        onClick={handleCloseNavMenu}
                        sx={{
                            "&.active": {
                                backgroundColor: "rgba(0,0,0,0.1)",
                            },
                        }}
                    >
                        <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}