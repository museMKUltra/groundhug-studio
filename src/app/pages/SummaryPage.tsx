import {useState} from "react";
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import MonthlyPreviewButton from "@/shared/components/MonthlyPreviewButton.tsx";
import {usePermissions} from "@/features/auth/hooks.ts";
import {formatMinutes} from "@/features/attendance/utils.ts";
import {formatCurrency} from "@/shared/utils/currency.ts";
import {useWorkSummary} from "@/features/attendance/presentation/hooks/useWorkSummary";
import {isDraft} from "@/features/attendance/domain/utils/status.ts";

export default function SummaryPage() {
    const pageSize = 6;

    const {canManageOwnHourlyRate} = usePermissions();

    const {
        loading,
        page,
        setPage,
        setProjectId,
        list,
        totalPages,
        projects
    } = useWorkSummary(pageSize);

    const [selectedProjectId, setSelectedProjectId] = useState(0);

    const handleProjectChange = (projectId: number) => {
        setSelectedProjectId(projectId);
        setPage(1);
        setProjectId(projectId);
    };

    const listLength = list.length || 0;
    const isEmptyList = listLength === 0;
    const emptyRows = loading
        ? (pageSize - 1)
        : (pageSize - listLength);

    const columnCount = canManageOwnHourlyRate ? 8 : 6;

    return (
        <Stack gap={3} width="100%">
            <Stack
                direction={{xs: "column", sm: "row"}}
                justifyContent="space-between"
                alignItems={{xs: "stretch", sm: "center"}}
                gap={2}
            >
                <Typography variant="h4">
                    Monthly Summary
                </Typography>

                <FormControl size="small" sx={{minWidth: 200}}>
                    <InputLabel id="project-filter-label">
                        Project
                    </InputLabel>

                    <Select
                        labelId="project-filter-label"
                        value={selectedProjectId}
                        label="Project"
                        onChange={(event) => {
                            handleProjectChange(Number(event.target.value));
                        }}
                    >
                        <MenuItem value={0}>
                            All Projects
                        </MenuItem>

                        {projects.map((project) => (
                            <MenuItem
                                key={project.id}
                                value={project.id}
                            >
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Year</TableCell>
                            <TableCell>Month</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Total Time</TableCell>

                            {canManageOwnHourlyRate && (
                                <>
                                    <TableCell>Hourly Rate</TableCell>
                                    <TableCell>Total Salary</TableCell>
                                </>
                            )}

                            <TableCell>Status</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {(loading || isEmptyList) ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    align="center"
                                >
                                    {loading
                                        ? <CircularProgress size={24}/>
                                        : "No Data"
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            list.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        {item.year}
                                    </TableCell>

                                    <TableCell>
                                        {item.month}
                                    </TableCell>

                                    <TableCell>
                                        {item.project.name}
                                    </TableCell>

                                    <TableCell>
                                        {isDraft(item.status)
                                            ? "--"
                                            : formatMinutes(item.totalMinutes)
                                        }
                                    </TableCell>

                                    {canManageOwnHourlyRate && (
                                        <>
                                            <TableCell>
                                                {isDraft(item.status)
                                                    ? "--"
                                                    : formatCurrency(item.hourlyRate)
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {isDraft(item.status)
                                                    ? "--"
                                                    : formatCurrency(item.salaryAmount)
                                                }
                                            </TableCell>
                                        </>
                                    )}

                                    <TableCell>
                                        {item.status}
                                    </TableCell>

                                    <TableCell>
                                        <MonthlyPreviewButton
                                            projectId={item.project.id}
                                            year={item.year}
                                            month={item.month}
                                            textContent="Preview"
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}

                        {/* keep table height fixed */}
                        {Array.from({length: emptyRows}).map((_, index) => (
                            <TableRow
                                key={`empty-${index}`}
                                sx={{
                                    height: 63
                                }}
                            >
                                <TableCell colSpan={columnCount}/>
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
    );
}