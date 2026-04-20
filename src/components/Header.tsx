import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import {useEffect} from "react";
import {useAuth} from "@/features/auth/hooks";
import AccountMenu from "@/components/AccountMenu";
import NavMenu from "@/components/NavMenu";
import NavLinks from "@/components/NavLinks";
import {getNavPages} from "@/routes/config";

export default function Header() {
    const {logout, setMe, user} = useAuth();

    const handleLogout = () => {
        logout();
    };

    useEffect(() => {
        setMe();
    }, []);

    const navPages = getNavPages(user?.role);

    return (
        <>
            <AppBar position="static" elevation={1}>
                <Container maxWidth="lg">
                    <Toolbar sx={{display: {xs: 'none', md: 'flex'}}} disableGutters>
                        <Typography variant="h6" mr={3}>LOGO</Typography>

                        <NavLinks pages={navPages}/>

                        <Box sx={{flexGrow: 1}}/>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                    <Toolbar sx={{display: {xs: 'flex', md: 'none'}, justifyContent: 'space-between'}} disableGutters>
                        <NavMenu pages={navPages}/>

                        <Typography variant="h6">LOGO</Typography>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
