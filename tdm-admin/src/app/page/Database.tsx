import IDCell from '~/app/components/database/IDCell';
import StatusCell from '~/app/components/database/StatusCell';
import TextCell from '~/app/components/database/TextCell';
import { database } from '~/app/services/admin/database';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import type { ChangeEvent } from 'react';

const DatabaseSkeleton = () => {
    return (
        <Paper>
            <Box sx={{ padding: '12px' }}>
                <Skeleton component="div" sx={{ width: '100%' }} animation="wave" variant="rounded" height={600} />
                <Skeleton
                    sx={{
                        marginLeft: 'auto',
                        marginTop: '12px',
                        position: 'relative',
                    }}
                    animation="wave"
                    variant="rounded"
                    height={32}
                    width={230}
                />
            </Box>
        </Paper>
    );
};

const Database = () => {
    const [page, setPage] = useState(1);

    const { data, isFetching } = useQuery({
        queryKey: ['database', page],
        queryFn: () => {
            return database(page);
        },
    });

    const numberOfPage = useMemo(() => {
        if (data) {
            return Math.round(data.total / 10);
        }
        return 0;
    }, [data]);

    const handlePageChange = (_: ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    if (isFetching) {
        return <DatabaseSkeleton />;
    }

    if (!data) {
        return <Alert color="error">Nous n&apos;avons pas pu récupérer les données.</Alert>;
    }

    return (
        <Paper>
            <Box sx={{ padding: '12px' }}>
                <div role="tabpanel" id={`simple-tab-panel`} aria-labelledby={`simple-tab`}>
                    <TableContainer>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                    <TableCell align="right">Email</TableCell>
                                    <TableCell align="right">Wrapper</TableCell>
                                    <TableCell align="right">Wrapper&nbsp;param</TableCell>
                                    <TableCell align="right">Enrichment</TableCell>
                                    <TableCell align="right">Enrichment&nbsp;hook</TableCell>
                                    <TableCell align="right">Original&nbsp;name</TableCell>
                                    <TableCell align="right">Upload&nbsp;file</TableCell>
                                    <TableCell align="right">Tmp&nbsp;file</TableCell>
                                    <TableCell align="right">Result&nbsp;file</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.results.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell component="th" scope="row">
                                            <IDCell value={row.id} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <StatusCell value={row.status} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.email} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.wrapper} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.wrapperParam} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.enrichment} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.enrichmentHook} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.originalName} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.uploadFile} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.tmpFile} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextCell value={row.resultFile} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <Pagination
                    sx={{
                        marginLeft: 'auto',
                        marginTop: '12px',
                        position: 'relative',
                        width: 'fit-content',
                    }}
                    page={page}
                    onChange={handlePageChange}
                    count={numberOfPage}
                />
            </Box>
        </Paper>
    );
};

export default Database;
