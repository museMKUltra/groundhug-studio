import React, { type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Error Info:', errorInfo);
    }

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
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
                            <ErrorOutlineRoundedIcon sx={{ fontSize: 48 }} />
                        </Box>

                        <Stack spacing={1}>
                            <Typography
                                variant="h5"
                                component="h1"
                                sx={{ fontWeight: 700 }}
                            >
                                Something went wrong
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {this.state.error?.message ||
                                    'An unexpected error occurred'}
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={this.handleGoHome}
                        >
                            Go Home
                        </Button>
                    </Stack>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;