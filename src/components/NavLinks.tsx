import {Box, Button,} from "@mui/material";
import {NavLink} from "react-router-dom";
import type {AppRoute} from "@/routes/config";

interface Props {
    pages: AppRoute[];
}

export default function NavLinks({pages}: Props) {
    return (
        <Box display='flex' gap={1}>
            {pages.map((page) => (
                <Button
                    key={page.label}
                    component={NavLink}
                    to={page.path}
                    color="inherit"
                    sx={{
                        "&.active": {
                            backgroundColor: "action.hover",
                        },
                    }}
                >
                    {page.label}
                </Button>
            ))}
        </Box>
    );
}