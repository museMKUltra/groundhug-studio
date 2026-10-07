import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

export default function ErrorPage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 3,
                bgcolor: '#FAF9FC',
            }}
        >
            <Stack
                spacing={3}
                alignItems="center"
                textAlign="center"
                sx={{ maxWidth: 480 }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 88,
                        height: 88,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(29, 25, 43, 0.06)',
                        color: '#1D192B',
                    }}
                >
                    <AccessTimeRoundedIcon sx={{ fontSize: 48 }} />
                </Box>

                {/* Error code */}
                <Typography
                    component="h1"
                    sx={{
                        fontSize: { xs: '5rem', sm: '6rem' },
                        lineHeight: 1,
                        fontWeight: 800,
                        color: '#1D192B',
                    }}
                >
                    404
                </Typography>

                {/* Message */}
                <Stack spacing={1}>
                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                        }}
                    >
                        Looks like this page took a break.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        We couldn't find the page you're looking for.
                        <br />
                        Let's get you back on track.
                    </Typography>
                </Stack>

                {/* Action */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                >
                    Back to TickBun
                </Button>
            </Stack>
        </Box>
    );
}