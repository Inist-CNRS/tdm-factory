import '~/app/page/css/Setting.scss';

import EnrichmentList from '~/app/components/setting/EnrichmentList';
import WrapperList from '~/app/components/setting/WrapperList';
import { config, configPost } from '~/app/services/setting/setting';

import { Button, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import { isEqual, cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';

import type { Config, ConfigEnrichment, ConfigWrapper } from '~/app/util/type';

const SettingSkeleton = () => {
    return (
        <Box id="setting-container">
            <Skeleton id="setting-action" height={36.5} animation="wave" variant="rounded" />
            <Divider />
            <Stack
                divider={<Divider orientation="vertical" flexItem />}
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
            >
                <Paper className="setting-block" elevation={0}>
                    <Skeleton animation="wave" variant="rounded" height={500} />
                </Paper>
                <Paper className="setting-block" elevation={0}>
                    <Skeleton animation="wave" variant="rounded" height={500} />
                </Paper>
            </Stack>
        </Box>
    );
};

const Setting = () => {
    const [localConfig, setLocalConfig] = useState<Config | undefined>(undefined);
    const [configUpdateIndex, setConfigUpdateIndex] = useState<number>(0);
    const [asChange, setAsChange] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

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

    const handleSnackBarClose = () => {
        setSnackbar({ open: false, message: '' });
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

    const handleCancelClick = () => {
        setConfigUpdateIndex(configUpdateIndex + 1);
    };

    const handleSaveClick = () => {
        if (localConfig) {
            configPost(localConfig).then((res) => {
                if (res.ok) {
                    setSnackbar({
                        open: true,
                        message: 'La configuration a été sauvegardée',
                    });
                    setConfigUpdateIndex(configUpdateIndex + 1);
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Une erreur durant la sauvegarde a été rencontrée',
                    });
                }
            });
        }
    };

    if (isLoading || isFetching) {
        return <SettingSkeleton />;
    }

    if (!data || !localConfig) {
        return (
            <Box>
                <Alert severity="error">Impossible de récupérer la configuration.</Alert>
            </Box>
        );
    }

    return (
        <>
            <Snackbar
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                open={snackbar.open}
                onClose={handleSnackBarClose}
                autoHideDuration={5000}
                message={snackbar.message}
            />
            <Box id="setting-container">
                <Box id="setting-action">
                    <Button variant="contained" color="warning" onClick={handleCancelClick}>
                        Annulée
                    </Button>
                    <Button variant="contained" color="success" disabled={!asChange} onClick={handleSaveClick}>
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
        </>
    );
};

export default Setting;
