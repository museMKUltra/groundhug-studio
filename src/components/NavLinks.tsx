import {Box, Button,} from "@mui/material";
import {NavLink} from "react-router-dom";

interface Page {
    name: string;
    path: string;
}

interface Props {
    pages: Page[];
}

export default function NavMenu({pages}: Props) {
    return (
        <Box display='flex'>
            {pages.map((page) => (
                <Button
                    key={page.name}
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
                    {page.name}
                </Button>
            ))}
        </Box>
    );
}