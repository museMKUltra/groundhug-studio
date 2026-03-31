import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";

export default function Header() {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <AppBar position="static" elevation={1}>
            <Toolbar>
                <Typography variant="h6">Attendance</Typography>

                <Box sx={{flexGrow: 1}}/>

                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}