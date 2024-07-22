import { ProcessingStatus } from '~/app/util/type';
import { getDatabaseStatus } from '~/app/util/utils';

import Chip from '@mui/material/Chip';
import { useMemo } from 'react';

type StatusCellProps = {
    value: ProcessingStatus;
};

const StatusCell = ({ value }: StatusCellProps) => {
    const status = useMemo(() => {
        return getDatabaseStatus(value);
    }, [value]);

    switch (value) {
        case ProcessingStatus.UNKNOWN:
            return <Chip label={status} size="small" />;

        case ProcessingStatus.WRAPPER_ERROR:
        case ProcessingStatus.ENRICHMENT_ERROR:
        case ProcessingStatus.FINISHED_ERROR:
            return <Chip label={status} color="warning" size="small" />;

        case ProcessingStatus.FINISHED:
            return <Chip label={status} color="success" size="small" />;

        default:
            return <Chip label={status} color="primary" size="small" />;
    }
};

export default StatusCell;
