import {useNavigate} from "react-router-dom";
import {Box, Button} from "@mui/material";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <Box p={3}>
            <h1>Welcome to the Home Page</h1>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/attendance')}
            >
                Start
            </Button>
        </Box>
    );
}