import {
    Box,
    CircularProgress,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import type {Status} from "@/features/attendance/types.ts";
import MonthlyPreviewButton from "@/shared/components/MonthlyPreviewButton.tsx";
import {useAuth} from "@/features/auth/hooks.ts";
import {formatMinutes} from "@/features/attendance/utils.ts";
import {formatCurrency} from "@/shared/utils/currency.ts";
import {useWorkSummary} from "@/features/attendance/presentation/hooks/useWorkSummary"

export default function SummaryPage() {
    const pageSize = 6;

    const {isAdmin} = useAuth();
    const {loading, page, setPage, list, totalPages} = useWorkSummary(pageSize)

    const listLength = list.length || 0;
    const isEmptyList = listLength === 0;
    const emptyRows = loading ? (pageSize - 1) : (pageSize - listLength)
    const isDraft = (status: Status) => (status === 'DRAFT')

    return (
        <Stack gap={3} width={'100%'}>
            <Typography variant="h4">
                Monthly Summary
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Year</TableCell>
                            <TableCell>Month</TableCell>
                            <TableCell>Total Time</TableCell>
                            {
                                isAdmin && (<>
                                    <TableCell>Hourly Rate</TableCell>
                                    <TableCell>Total Salary</TableCell>
                                </>)
                            }
                            <TableCell>Status</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            (loading || isEmptyList)
                                ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            align="center"
                                        >
                                            {
                                                loading ? <CircularProgress size={24}/> : 'No Data'
                                            }
                                        </TableCell>
                                    </TableRow>
                                )
                                : list.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.year}</TableCell>

                                        <TableCell>{item.month}</TableCell>

                                        <TableCell>
                                            {isDraft(item.status) ? '--' : formatMinutes(item.totalMinutes)}
                                        </TableCell>

                                        {
                                            isAdmin && (<>
                                                <TableCell>
                                                    {isDraft(item.status) ? '--' : formatCurrency(item.hourlyRate)}
                                                </TableCell>
                                                <TableCell>
                                                    {isDraft(item.status) ? '--' : formatCurrency(item.salaryAmount)}
                                                </TableCell>
                                            </>)
                                        }

                                        <TableCell>
                                            {item.status}
                                        </TableCell>

                                        <TableCell>
                                            <MonthlyPreviewButton
                                                year={item.year}
                                                month={item.month}
                                                textContent="Preview"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}


                        {/* keep table height fixed */}
                        {Array.from({length: emptyRows}).map((_, index) => (
                            <TableRow
                                key={`empty-${index}`}
                                sx={{
                                    height: 63
                                }}
                            >
                                <TableCell colSpan={7}/>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                mt={3}
                display="flex"
                justifyContent="center"
            >
                <Pagination
                    page={page}
                    count={totalPages || 0}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Stack>
    )
}