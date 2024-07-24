import { formatBytes } from '@draconides/format';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { File } from '~/app/util/type';

type FileTableProps = {
    currentTable: number;
    tableIndex: number;
    rows: File[];
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'medium',
});

const FileTable = ({ currentTable, tableIndex, rows }: FileTableProps) => {
    return (
        <div
            role="tabpanel"
            hidden={currentTable !== tableIndex}
            id={`simple-tab-panel-${tableIndex}`}
            aria-labelledby={`simple-tab-${tableIndex}`}
        >
            {currentTable === tableIndex ? (
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom du fichier</TableCell>
                                <TableCell align="right">Taille</TableCell>
                                <TableCell align="right">Date&nbsp;de&nbsp;creation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.file}>
                                    <TableCell component="th" scope="row">
                                        {row.file}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatBytes(row.stats.size, {
                                            style: 'octet',
                                        })}
                                    </TableCell>
                                    <TableCell align="right">
                                        {dateFormatter.format(new Date(row.stats.ctime))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
        </div>
    );
};

export default FileTable;
