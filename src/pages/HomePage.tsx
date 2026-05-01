import {useNavigate} from "react-router-dom";
import {Box, Button, Chip, Container, Divider, Stack, Typography} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import PieChartIcon from '@mui/icons-material/PieChart';
import LabelIcon from "@mui/icons-material/Label";
import {useAuth} from "@/features/auth/hooks.ts";

const features = [
    {
        icon: <AccessTimeIcon color="primary" fontSize="large"/>,
        title: "Clock In & Out",
        desc: "Track your work sessions with a single tap. Start and stop your timer whenever you're ready.",
    },
    {
        icon: <TimelineIcon color="primary" fontSize="large"/>,
        title: "Daily Timeline",
        desc: "Review your sessions for the day at a glance with a clear chronological timeline.",
    },
    {
        icon: <PieChartIcon color="primary" fontSize="large"/>,
        title: "Monthly Preview",
        desc: "Get a monthly overview of your total work and break hours at a glance.",
    },
    {
        icon: <LabelIcon color="primary" fontSize="large"/>,
        title: "Session Labels",
        desc: "Categorize your work sessions with custom labels to stay organized.",
    },
];

export default function HomePage() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const isLoggedIn = user !== null;

    return (
        <Container maxWidth="md">
            <Stack spacing={6} alignItems="center" py={8}>
                {/* Hero */}
                <Stack spacing={2} alignItems="center" textAlign="center">
                    <Chip label="Attendance Tracker" color="primary" variant="outlined" size="small"/>
                    <Typography variant="h3" fontWeight="bold">
                        Groundhug Studio
                    </Typography>
                    <Typography variant="h6" color="text.secondary" maxWidth={480}>
                        Simple, no-fuss time tracking. Clock in, log your sessions, and keep an eye on your monthly
                        preview — all in one place.
                    </Typography>
                </Stack>

                {/* CTA */}
                {isLoggedIn ? (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/attendance")}
                        sx={{px: 5, py: 1.5, borderRadius: 3, fontSize: "1rem"}}
                    >
                        Start Your Journey
                    </Button>
                ) : (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/register")}
                            sx={{px: 4, py: 1.5, borderRadius: 3, fontSize: "1rem"}}
                        >
                            Register
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate("/guest")}
                            sx={{px: 4, py: 1.5, borderRadius: 3, fontSize: "1rem"}}
                        >
                            Try as Guest
                        </Button>
                    </Stack>
                )}

                <Divider flexItem/>

                {/* Features */}
                <Box
                    display="grid"
                    gridTemplateColumns={{xs: "1fr", sm: "1fr 1fr"}}
                    gap={4}
                    width="100%"
                >
                    {features.map(({icon, title, desc}) => (
                        <Stack key={title} direction="row" spacing={2} alignItems="flex-start">
                            <Box pt={0.5}>{icon}</Box>
                            <Stack spacing={0.5}>
                                <Typography fontWeight="bold">{title}</Typography>
                                <Typography variant="body2" color="text.secondary">{desc}</Typography>
                            </Stack>
                        </Stack>
                    ))}
                </Box>
            </Stack>
        </Container>
    );
}
