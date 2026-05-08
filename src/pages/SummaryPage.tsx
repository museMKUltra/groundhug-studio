import {useEffect, useState} from "react";
import {
    Box,
    CircularProgress,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useSummary} from "@/features/attendance/hooks.ts";
import type {Status, WorkSummaryResponse} from "@/features/attendance/types.ts";
import MonthlyPreviewButton from "@/components/MonthlyPreviewButton.tsx";
import {useAuth} from "@/features/auth/hooks.ts";
import {formatMinutes} from "@/features/attendance/utils";
import {formatCurrency} from "@/utils/currency.ts";

export default function SummaryPage() {
    const {isAdmin} = useAuth();
    const {getWorkSummaryList} = useSummary()

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [data, setData] = useState<WorkSummaryResponse | null>(null)

    const pageSize = 6

    useEffect(() => {
        fetchData()
    }, [page])

    const fetchData = async () => {
        try {
            setLoading(true)

            const response = await getWorkSummaryList(page - 1, pageSize)

            setData(response)
        } finally {
            setLoading(false)
        }
    }

    const emptyRows = pageSize - (data?.content.length || 0)
    const isDraft = (status: Status) => (status === 'DRAFT')

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3}>
                Monthly Summary
            </Typography>

            {loading ? (
                <CircularProgress/>
            ) : (
                <>
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
                                {data?.content.map((item) => (
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
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                ))}

                                {data?.content.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                        >
                                            No Data
                                        </TableCell>
                                    </TableRow>
                                )}
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
                            count={data?.page.totalPages || 0}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Box>
    )
}