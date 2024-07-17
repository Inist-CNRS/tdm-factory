import FileTable from '~/app/components/file/FileTable';
import { files } from '~/app/services/admin/files';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { SyntheticEvent } from 'react';

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
};

const File = () => {
    const [value, setValue] = useState(0);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['file'],
        queryFn: () => {
            return files();
        },
    });

    const handleChange = (event: SyntheticEvent, newValue: string) => {
        setValue(Number(newValue));
    };

    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Fichier Upload" {...a11yProps(0)} />
                    <Tab label="Fichier Tmp" {...a11yProps(1)} />
                    <Tab label="Fichier Download" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <Box sx={{ padding: '8px' }}>
                {isLoading || isFetching ? (
                    <LinearProgress />
                ) : (
                    <>
                        <FileTable currentTable={value} tableIndex={0} rows={data?.upload ?? []} />
                        <FileTable currentTable={value} tableIndex={1} rows={data?.tmp ?? []} />
                        <FileTable currentTable={value} tableIndex={2} rows={data?.download ?? []} />
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default File;
