import '~/app/page/css/Setting.scss';

import EnrichmentList from '~/app/components/setting/EnrichmentList';
import WrapperList from '~/app/components/setting/WrapperList';
import { config } from '~/app/services/setting/setting';

import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import { isEqual, cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';

import type { Config, ConfigEnrichment, ConfigWrapper } from '~/app/util/type';

const Setting = () => {
    const [localConfig, setLocalConfig] = useState<Config | undefined>(undefined);
    const [configUpdateIndex, setConfigUpdateIndex] = useState<number>(0);
    const [asChange, setAsChange] = useState<boolean>(false);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['config', configUpdateIndex],
        queryFn: () => {
            return config();
        },
    });

    useEffect(() => {
        setLocalConfig(cloneDeep(data));
        setAsChange(false);
    }, [data, configUpdateIndex]);

    useEffect(() => {
        setAsChange(!isEqual(data, localConfig));
    }, [data, localConfig]);

    const handleCancelClick = () => {
        setConfigUpdateIndex(configUpdateIndex + 1);
    };

    const handleWrapperChange = (wrappers: ConfigWrapper[]) => {
        if (localConfig) {
            const tmpConfig: Config = cloneDeep(localConfig);
            tmpConfig.wrappers = wrappers;
            setLocalConfig(tmpConfig);
        }
    };

    const handleEnrichmentChange = (enrichments: ConfigEnrichment[]) => {
        if (localConfig) {
            const tmpConfig: Config = cloneDeep(localConfig);
            tmpConfig.enrichments = enrichments;
            setLocalConfig(tmpConfig);
        }
    };

    if (isLoading || isFetching) {
        return <LinearProgress />;
    }

    if (!data || !localConfig) {
        return (
            <Box>
                <Alert severity="error">Impossible de récupérais la configuration.</Alert>
            </Box>
        );
    }

    return (
        <Box id="setting-container">
            <Box id="setting-action">
                <Button variant="contained" color="warning" onClick={handleCancelClick}>
                    Annulée
                </Button>
                <Button variant="contained" color="success" disabled={!asChange}>
                    Sauvegardé
                </Button>
            </Box>
            <Divider />
            <Stack
                divider={<Divider orientation="vertical" flexItem />}
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
            >
                <Paper className="setting-block" elevation={0}>
                    <WrapperList wrappers={localConfig.wrappers} onChange={handleWrapperChange} />
                </Paper>
                <Paper className="setting-block" elevation={0}>
                    <EnrichmentList enrichments={localConfig.enrichments} onChange={handleEnrichmentChange} />
                </Paper>
            </Stack>
        </Box>
    );
};

export default Setting;
