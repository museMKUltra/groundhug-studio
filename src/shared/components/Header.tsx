import {AppBar, Box, Container, IconButton, Toolbar} from "@mui/material";
import {useAuth} from "@/features/auth/hooks.ts";
import AccountMenu from "@/shared/components/AccountMenu.tsx";
import NavMenu from "@/shared/components/NavMenu.tsx";
import NavLinks from "@/shared/components/NavLinks.tsx";
import Logo from "@/shared/components/Logo.tsx";
import {getNavPages} from "@/app/routes";
import LoginIcon from "@mui/icons-material/Login";
import {useNavigate} from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const {logout, user} = useAuth();
    const isLoggedIn = user !== null;

    const handleLogout = () => {
        logout();
    };

    const navPages = isLoggedIn ? getNavPages(user?.role) : [];
    const isGuest = user?.isGuest ?? false;

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{display: {xs: 'none', md: 'flex'}, gap: 3}} disableGutters>
                        <Logo/>

                        <NavLinks pages={navPages}/>

                        <Box sx={{flexGrow: 1}}/>


                        {isLoggedIn
                            ? <AccountMenu onLogout={handleLogout} showSettings={isGuest}/>
                            : <IconButton color="inherit" onClick={() => navigate("/login")}><LoginIcon/></IconButton>
                        }
                    </Toolbar>
                    <Toolbar sx={{display: {xs: 'flex', md: 'none'}, justifyContent: 'space-between'}} disableGutters>
                        <NavMenu pages={navPages}/>

                        <Logo/>

                        {isLoggedIn
                            ? <AccountMenu onLogout={handleLogout} showSettings={isGuest}/>
                            : <IconButton color="inherit" onClick={() => navigate("/login")}><LoginIcon/></IconButton>
                        }
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
