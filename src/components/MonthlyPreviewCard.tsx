import {Card, CardContent, Stack, Typography,} from "@mui/material";
import MonthlyPreviewButton from "@/components/MonthlyPreviewButton.tsx";

interface Props {
    year: number;
    month: number;
}

export default function MonthlyPreviewCard({year, month}: Props) {
    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">Monthly</Typography>
                    <MonthlyPreviewButton year={year} month={month} textContent="Preview Month"/>
                </Stack>
            </CardContent>
        </Card>
    );
}
