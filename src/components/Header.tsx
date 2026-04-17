import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import AccountMenu from "@/components/AccountMenu";
import NavMenu from "@/components/NavMenu";
import NavLinks from "@/components/NavLinks";

export default function Header() {
    const {logout, setMe} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        setMe();
    }, []);

    const pages = [
        {
            name: 'Attendance',
            path: '/attendance'
        },
        {
            name: 'Summary',
            path: '/summary'
        },
    ];

    return (
        <>
            <AppBar position="static" elevation={1}>
                <Container maxWidth="lg">
                    <Toolbar sx={{display: {xs: 'none', md: 'flex'}}}>
                        <Typography variant="h6" mr={3}>LOGO</Typography>

                        <NavLinks pages={pages}/>

                        <Box sx={{flexGrow: 1}}/>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                    <Toolbar sx={{display: {xs: 'flex', md: 'none'}, justifyContent: 'space-between'}}>
                        <NavMenu pages={pages}/>

                        <Typography variant="h6">LOGO</Typography>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
