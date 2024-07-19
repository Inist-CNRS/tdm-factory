import { DatabaseStatus } from '~/app/util/type';
import { getDatabaseStatus } from '~/app/util/utils';

import Chip from '@mui/material/Chip';
import { useMemo } from 'react';

type StatusCellProps = {
    value: DatabaseStatus;
};

const StatusCell = ({ value }: StatusCellProps) => {
    const status = useMemo(() => {
        return getDatabaseStatus(value);
    }, [value]);

    switch (value) {
        case DatabaseStatus.UNKNOWN:
            return <Chip label={status} size="small" />;

        case DatabaseStatus.WRAPPER_ERROR:
        case DatabaseStatus.ENRICHMENT_ERROR:
        case DatabaseStatus.FINISHED_ERROR:
            return <Chip label={status} color="warning" size="small" />;

        case DatabaseStatus.FINISHED:
            return <Chip label={status} color="success" size="small" />;

        default:
            return <Chip label={status} color="primary" size="small" />;
    }
};

export default StatusCell;
