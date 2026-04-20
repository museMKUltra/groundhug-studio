import {AppBar, Box, Container, Toolbar} from "@mui/material";
import {useEffect} from "react";
import {useAuth} from "@/features/auth/hooks";
import AccountMenu from "@/components/AccountMenu";
import NavMenu from "@/components/NavMenu";
import NavLinks from "@/components/NavLinks";
import Logo from "@/components/Logo";
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
                    <Toolbar sx={{display: {xs: 'none', md: 'flex'}, gap: 3}} disableGutters>
                        <Logo/>

                        <NavLinks pages={navPages}/>

                        <Box sx={{flexGrow: 1}}/>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                    <Toolbar sx={{display: {xs: 'flex', md: 'none'}, justifyContent: 'space-between'}} disableGutters>
                        <NavMenu pages={navPages}/>

                        <Logo/>

                        <AccountMenu onLogout={handleLogout}/>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
