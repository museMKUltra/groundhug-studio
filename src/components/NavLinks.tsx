import {Box, Button,} from "@mui/material";
import {NavLink} from "react-router-dom";
import type {AppRoute} from "@/routes/config";

interface Props {
    pages: AppRoute[];
}

export default function NavLinks({pages}: Props) {
    return (
        <Box display='flex'>
            {pages.map((page) => (
                <Button
                    key={page.label}
                    component={NavLink}
                    to={page.path}
                    sx={{
                        color: "white",
                        "&.active": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: 1,
                        },
                    }}
                >
                    {page.label}
                </Button>
            ))}
        </Box>
    );
}