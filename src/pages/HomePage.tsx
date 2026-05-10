import {useNavigate} from "react-router-dom";
import {Box, Button, Divider, Stack, Typography} from "@mui/material";
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import HorizontalSplitRoundedIcon from '@mui/icons-material/HorizontalSplitRounded';
import PieChartIcon from '@mui/icons-material/PieChart';
import LabelIcon from "@mui/icons-material/Label";
import {useAuth} from "@/features/auth/hooks.ts";

const features = [
    {
        icon: <WatchLaterIcon color="primary" fontSize="large"/>,
        title: "Focus & Balance",
        desc: "Track time for focus and breaks with a single tap. Seamlessly switch between sessions to maintain your rhythm.",
    },
    {
        icon: <HorizontalSplitRoundedIcon color="primary" fontSize="large"/>,
        title: "The Daily Stack",
        desc: "Review your daily progress at a glance. See how your focus and rest sessions layer up for a balanced day.",
    },
    {
        icon: <PieChartIcon color="primary" fontSize="large"/>,
        title: "Monthly Insights",
        desc: "Get a monthly overview of your time distribution across all tasks. Visualize your work-life balance and project ratios through intuitive pie charts.",
    },
    {
        icon: <LabelIcon color="primary" fontSize="large"/>,
        title: "Custom Labels",
        desc: "Organize your sessions with custom labels. Categorize your work and rest to build your ideal routine.",
    },
];

export default function HomePage() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const isLoggedIn = user !== null;

    return (
        <Stack spacing={6} alignItems="center">
            {/* Hero */}
            <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography variant="h3" fontWeight="bold">
                    The Time Tracker for a
                    <br/>

                    <Box
                        component="span"
                        sx={{
                            background: 'linear-gradient(90deg, #FF6F00 14.69%, #90D96C 73.83%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Balanced
                    </Box>{' '}

                    <Box component="span">
                        Stack.
                    </Box>
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Allocate goals, track progress, and find the perfect balance between
                    <br/>
                    work and rest. Get the insights you need for a better-layered life.
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
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/guest")}
                    sx={{px: 3, py: 2, borderRadius: 4, fontSize: "1rem"}}
                >
                    Try as Guest
                </Button>
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
    );
}
