import {NavLink} from "react-router-dom";
import {Box, Typography} from "@mui/material";
import logo from "@/assets/logo_TickBun.png";

export default function Logo() {
    return (
        <Typography
            component={NavLink}
            to="/"
            sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
            }}
        >
            <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                    height: {
                        xs: 56,
                        md: 64,
                    },
                    marginY: 1,
                    width: "auto",
                }}
            />
        </Typography>
    );
}