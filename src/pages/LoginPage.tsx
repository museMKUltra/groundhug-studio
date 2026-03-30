import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks.ts";

import {Box, Button, Card, CardContent, Collapse, Stack, Tab, Tabs, TextField, Typography,} from "@mui/material";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {login, loading} = useAuth();
    const {register} = useUsers();

    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const from = location.state?.from?.pathname || "/attendance";

    const isLogin = mode === "login";
    const reset = () => {
        setName("");
        setEmail("");
        setPassword("");
    }
    const handleSubmit = async () => {
        if (isLogin) {
            await login(email, password);
            navigate(from, {replace: true});
        } else {
            await register(name, email, password);
            reset();
            setMode("login");
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
        >
            <Card sx={{width: 400, borderRadius: 3, boxShadow: 3}}>
                <CardContent>
                    <Typography variant="h5" textAlign="center" mb={2}>
                        {isLogin ? "Login" : "Register"}
                    </Typography>

                    <Tabs
                        value={mode}
                        onChange={(_, value) => setMode(value)}
                        centered
                        sx={{mb: 2}}
                    >
                        <Tab label="Login" value="login"/>
                        <Tab label="Register" value="register"/>
                    </Tabs>

                    <Stack spacing={2}>
                        <Collapse in={mode === "register"}>
                            <TextField
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                            />
                        </Collapse>

                        <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            fullWidth
                            size="large"
                        >
                            {isLogin ? "Login" : "Register"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
