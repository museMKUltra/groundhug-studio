import {AppBar, Box, Container, IconButton, Toolbar} from "@mui/material";
import {useAuth} from "@/features/auth/hooks";
import AccountMenu from "@/components/AccountMenu";
import NavMenu from "@/components/NavMenu";
import NavLinks from "@/components/NavLinks";
import Logo from "@/components/Logo";
import {getNavPages} from "@/routes/config";
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
            <AppBar position="static" elevation={1}>
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
