import { dashboard } from '~/app/services/admin/dashboard';
import { getDatabaseStatus } from '~/app/util/utils';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
    Area,
    AreaChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type { StorageDashboard } from '~/app/util/type';

const Dashboard = () => {
    const { data, isFetching, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => {
            return dashboard();
        },
    });

    const statusData = useMemo(() => {
        if (!data) {
            return [];
        }
        const output = [];
        for (const datum of Object.entries(data.status)) {
            output.push({
                name: getDatabaseStatus(Number(datum[0])).toLowerCase().replace('_', ' '),
                count: datum[1],
            });
        }
        return output;
    }, [data]);

    if (isFetching || isLoading) {
        return <p>Is Loading</p>;
    }

    if (!data) {
        return <Alert color="error">No database found.</Alert>;
    }

    return (
        <Box>
            <Paper sx={{ width: '500px', height: '300px', padding: '12px' }}>
                <Typography sx={{ textAlign: 'center' }} variant="h5">
                    Résumé des Status
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={statusData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Tooltip />
                        <Radar dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
};

export default Dashboard;
