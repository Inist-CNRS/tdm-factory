import '~/app/components/setting/ProcessingList.scss';

import { isValidHttpUrl } from '~/app/util/utils';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { cloneDeep } from 'lodash';
import { Fragment, useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';
import type { ConfigWrapper } from '~/app/util/type';

type WrapperListProps = {
    wrappers: ConfigWrapper[];
    onChange: (wrappers: ConfigWrapper[]) => void;
};

const text = {
    title: {
        main: 'Paramétrage des Wrappers',
        tagSubTitle: 'Tag',
        excludedSubTitle: 'Éléments exclus',
    },
    label: {
        url: 'Url du wrapper',
        tagName: 'Nom du tag',
        excludedPath: 'Chemin exclu',
    },
    tooltip: {
        addWrapper: 'Ajouter un wrapper',
        deleteWrapper: 'Supprimer le wrapper',
        addExcluded: 'Ajouter une route à exclure',
        deleteExcluded: 'Supprimer la route exclue',
    },
};

const WrapperList = ({ wrappers, onChange }: WrapperListProps) => {
    const [modifiableWrappers, setModifiableWrappers] = useState<ConfigWrapper[]>(wrappers);
    const [urlError, setUrlError] = useState<boolean>(false);

    useEffect(() => {
        onChange(modifiableWrappers);
    }, [modifiableWrappers, onChange]);

    const handleUrlChange = (index: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const localWrappers = cloneDeep(modifiableWrappers);
        const wrapper = localWrappers[index];

        wrapper.url = event.target.value;
        localWrappers[index] = wrapper;

        setModifiableWrappers(localWrappers);
        setUrlError(!isValidHttpUrl(event.target.value));
    };

    const handleTagNameChange =
        (wrapperIndex: number, tagIndex: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localWrappers = cloneDeep(modifiableWrappers);
            const wrapper = localWrappers[wrapperIndex];
            const tag = wrapper.tags[tagIndex];

            tag.name = event.target.value;
            wrapper.tags[tagIndex] = tag;
            localWrappers[wrapperIndex] = wrapper;

            setModifiableWrappers(localWrappers);
        };

    const handleExcludedChange =
        (wrapperIndex: number, tagIndex: number, excludedIndex: number) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localWrappers = cloneDeep(modifiableWrappers);
            const wrapper = localWrappers[wrapperIndex];
            const tag = wrapper.tags[tagIndex];

            tag.excluded[excludedIndex] = event.target.value;
            wrapper.tags[tagIndex] = tag;
            localWrappers[wrapperIndex] = wrapper;

            setModifiableWrappers(localWrappers);
        };

    const handleExcludedDeleteClick = (wrapperIndex: number, tagIndex: number, excludedIndex: number) => () => {
        const localWrappers = cloneDeep(modifiableWrappers);
        const wrapper = localWrappers[wrapperIndex];
        const tag = wrapper.tags[tagIndex];
        const excluded: Array<string | null> = tag.excluded;

        excluded[excludedIndex] = null;

        tag.excluded = excluded.filter((datum) => datum !== null);

        wrapper.tags[tagIndex] = tag;
        localWrappers[wrapperIndex] = wrapper;

        setModifiableWrappers(localWrappers);
    };

    const handleExcludedAddClick = (wrapperIndex: number, tagIndex: number) => () => {
        const localWrappers = cloneDeep(modifiableWrappers);
        const wrapper = localWrappers[wrapperIndex];
        const tag = wrapper.tags[tagIndex];

        tag.excluded.push('');

        wrapper.tags[tagIndex] = tag;
        localWrappers[wrapperIndex] = wrapper;

        setModifiableWrappers(localWrappers);
    };

    const handleWrapperDeleteClick = (wrapperIndex: number) => () => {
        const localWrappers: Array<ConfigWrapper | null> = cloneDeep(modifiableWrappers);

        localWrappers[wrapperIndex] = null;

        setModifiableWrappers(localWrappers.filter((datum) => datum !== null));
    };

    const handleWrapperAddClick = () => () => {
        const localWrappers = cloneDeep(modifiableWrappers);

        localWrappers.push({
            tags: [
                {
                    name: '',
                    excluded: [],
                },
            ],
            url: '',
        });

        setModifiableWrappers(localWrappers);
    };

    /* eslint-disable react/no-array-index-key */
    return (
        <Stack>
            <Typography id="wrapper-setting" variant="h5">
                {text.title.main}
            </Typography>
            {modifiableWrappers.map((wrapper, wrapperIndex) => (
                <Box key={`wrapper_${wrapperIndex}`} className="processing-box">
                    <Paper className="processing-card" elevation={2}>
                        <TextField
                            label={text.label.url}
                            size="small"
                            value={wrapper.url}
                            onChange={handleUrlChange(wrapperIndex)}
                            error={urlError}
                            fullWidth
                        />
                        <Box className="processing-params">
                            {wrapper.tags.map((tag, tagIndex) => (
                                <Fragment key={`wrapper_${wrapperIndex}_tag_${tagIndex}`}>
                                    <Box className="processing-card-divider">
                                        <Typography variant="caption">{text.title.tagSubTitle}</Typography>
                                        <Divider />
                                    </Box>
                                    <TextField
                                        size="small"
                                        label={text.label.tagName}
                                        value={tag.name}
                                        onChange={handleTagNameChange(wrapperIndex, tagIndex)}
                                        fullWidth
                                    />
                                    <fieldset className="processing-card-tags">
                                        <legend>
                                            <Typography variant="caption">{text.title.excludedSubTitle}</Typography>
                                        </legend>
                                        {tag.excluded.map((excluded, excludedIndex) => (
                                            <Box
                                                key={`wrapper_${wrapperIndex}_tag_${tagIndex}_excluded_${excludedIndex}`}
                                                className="processing-card-input-box"
                                            >
                                                <TextField
                                                    className="processing-card-tag-excluded-input"
                                                    size="small"
                                                    label={text.label.excludedPath}
                                                    value={excluded}
                                                    onChange={handleExcludedChange(
                                                        wrapperIndex,
                                                        tagIndex,
                                                        excludedIndex,
                                                    )}
                                                    fullWidth
                                                />
                                                <Tooltip title={text.tooltip.deleteExcluded}>
                                                    <IconButton
                                                        onClick={handleExcludedDeleteClick(
                                                            wrapperIndex,
                                                            tagIndex,
                                                            excludedIndex,
                                                        )}
                                                    >
                                                        <RemoveIcon color="error" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ))}
                                        <Tooltip title={text.tooltip.addExcluded}>
                                            <IconButton
                                                className="processing-card-tag-delete"
                                                size="small"
                                                color="success"
                                                onClick={handleExcludedAddClick(wrapperIndex, tagIndex)}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </fieldset>
                                </Fragment>
                            ))}
                        </Box>
                    </Paper>
                    <Tooltip title={text.tooltip.deleteWrapper}>
                        <IconButton onClick={handleWrapperDeleteClick(wrapperIndex)}>
                            <RemoveIcon color="error" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ))}
            <Tooltip title={text.tooltip.addWrapper}>
                <Button
                    className="processing-add"
                    variant="contained"
                    size="small"
                    onClick={handleWrapperAddClick()}
                    fullWidth
                >
                    <AddIcon />
                </Button>
            </Tooltip>
        </Stack>
    );
};

export default WrapperList;
