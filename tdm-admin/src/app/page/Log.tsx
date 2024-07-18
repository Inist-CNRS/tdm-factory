import { logList, logs } from '~/app/services/admin/log';

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { ChangeEvent } from 'react';

const Log = () => {
    const [type, setType] = useState('default');
    const [level, setLevel] = useState('combined');

    const {
        data: list,
        isLoading: isListLoading,
        isFetching: isListFetching,
    } = useQuery({
        queryKey: ['logs'],
        queryFn: () => {
            return logList();
        },
        staleTime: 3600000, // 1 hour of cache
        gcTime: 3600000, // 1000 * 60 * 60
    });

    const {
        data: logData,
        isLoading: isLogDataLoading,
        isFetching: isLogDataFetching,
    } = useQuery({
        queryKey: ['logs', type, level],
        queryFn: () => {
            return logs(type, level);
        },
    });

    const handleTypeChange = (_: ChangeEvent<HTMLInputElement>, newType: string) => {
        setType(newType);
    };

    const handleLevelChange = (_: ChangeEvent<HTMLInputElement>, newLevel: string) => {
        setLevel(newLevel);
    };

    if (isListFetching || isListLoading) {
        return <LinearProgress />;
    }

    if (!list) {
        return null;
    }

    return (
        <Box sx={{ padding: '24px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <Paper sx={{ padding: '12px', paddingLeft: '24px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="subtitle1">Type de log</Typography>
                    <RadioGroup row value={type} onChange={handleTypeChange}>
                        {list.map((name) => (
                            <FormControlLabel key={name} value={name} control={<Radio />} label={name} />
                        ))}
                    </RadioGroup>
                </Box>
                <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="subtitle1">Niveau de log</Typography>
                    <RadioGroup row value={level} onChange={handleLevelChange}>
                        <FormControlLabel value="combined" control={<Radio />} label="info" />
                        <FormControlLabel value="debug" control={<Radio />} label="debug" />
                    </RadioGroup>
                </Box>
            </Paper>
            <Paper sx={{ padding: '12px' }} elevation={0}>
                {isLogDataFetching || isLogDataLoading ? (
                    <LinearProgress />
                ) : (
                    <TextField value={logData} disabled fullWidth multiline size="small" />
                )}
            </Paper>
        </Box>
    );
};

export default Log;
