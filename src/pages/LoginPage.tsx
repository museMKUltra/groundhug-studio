import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import {useUsers} from "@/features/users/hooks.ts";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import type {AxiosError} from "axios";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {login, loading} = useAuth();
    const {register} = useUsers();

    const [alert, setAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

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
        try {
            if (mode === "login") {
                await login(email, password);

                navigate(from, {replace: true});
            } else {
                await register(name, email, password);

                reset();
                setMode("login");
                setAlert({
                    type: "success",
                    message: "Register successful. Please login.",
                });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{
                error?: string
                email?: string
                password?: string
            }>;

            setAlert({
                type: "error",
                message:
                    error.response?.data?.error
                    || error.response?.data?.email
                    || error.response?.data?.password
                    || "email or password is incorrect"
            });
        }
    };

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        handleSubmit();
    }

    return (
        <>
            {alert && (
                <Snackbar
                    open={true}
                    autoHideDuration={3000}
                    onClose={() => setAlert(null)}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity={alert.type} onClose={() => setAlert(null)}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            )}
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

                        <Box component="form" onSubmit={onSubmit}>
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
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    fullWidth
                                    size="large"
                                >
                                    {isLogin ? "Login" : "Register"}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}
