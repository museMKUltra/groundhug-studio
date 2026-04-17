import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import AccountMenu from "@/components/AccountMenu";
import NavMenu from "@/components/NavMenu";
import NavLinks from "@/components/NavLinks";
import {navPages} from "@/routes/config";

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

    return (
        <>
            <AppBar position="static" elevation={1}>
                <Container maxWidth="lg">
                    <Toolbar sx={{display: {xs: 'none', md: 'flex'}}}>
                        <Typography variant="h6" mr={3}>LOGO</Typography>

                        <NavLinks pages={navPages}/>

                        <Box sx={{flexGrow: 1}}/>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                    <Toolbar sx={{display: {xs: 'flex', md: 'none'}, justifyContent: 'space-between'}}>
                        <NavMenu pages={navPages}/>

                        <Typography variant="h6">LOGO</Typography>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
