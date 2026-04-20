import {NavLink} from "react-router-dom";
import {Typography} from "@mui/material";

export default function Logo() {
    return <Typography
        variant="h6"
        component={NavLink}
        to="/"
        sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
        }}
    >
        LOGO
    </Typography>;
}