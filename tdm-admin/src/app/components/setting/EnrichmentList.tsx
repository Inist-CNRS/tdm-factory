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
import type { ConfigEnrichment } from '~/app/util/type';

type EnrichmentListProps = {
    enrichments: ConfigEnrichment[];
    onChange: (enrichments: ConfigEnrichment[]) => void;
};

const text = {
    title: {
        main: 'Paramétrage des Enrichment',
        retrieveSubTitle: 'Retrieve',
        tagSubTitle: 'Tag',
        excludedSubTitle: 'Elément exclus',
    },
    label: {
        url: 'Url du enrichment',
        tagName: 'Nom du tag',
        excludedPath: 'Chemin exclue',
        retrieveUrl: 'Url de retrieve',
        retrieveFile: 'Extension de fichier',
    },
    tooltip: {
        addEnrichment: 'Ajouté un enrichment',
        deleteEnrichment: 'Supprimé le enrichment',
        addExcluded: 'Ajouté une route a exclure',
        deleteExcluded: 'Supprimé la route exclue',
    },
};

const EnrichmentList = ({ enrichments, onChange }: EnrichmentListProps) => {
    const [modifiableEnrichments, setModifiableEnrichments] = useState<ConfigEnrichment[]>(enrichments);
    const [urlError, setUrlError] = useState<boolean>(false);

    useEffect(() => {
        onChange(modifiableEnrichments);
    }, [modifiableEnrichments, onChange]);

    const handleUrlChange =
        (enrichmentIndex: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localEnrichments = cloneDeep(modifiableEnrichments);
            const enrichment = localEnrichments[enrichmentIndex];

            enrichment.url = event.target.value;
            localEnrichments[enrichmentIndex] = enrichment;

            setModifiableEnrichments(localEnrichments);
            setUrlError(isValidHttpUrl(event.target.value));
        };

    const handleUrlRetrieveChange =
        (enrichmentIndex: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localEnrichments = cloneDeep(modifiableEnrichments);
            const enrichment = localEnrichments[enrichmentIndex];

            enrichment.retrieveUrl.url = event.target.value;
            localEnrichments[enrichmentIndex] = enrichment;

            setModifiableEnrichments(localEnrichments);
            setUrlError(isValidHttpUrl(event.target.value));
        };

    const handleRetrieveFileExtensionChange =
        (enrichmentIndex: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localEnrichments = cloneDeep(modifiableEnrichments);
            const enrichment = localEnrichments[enrichmentIndex];

            enrichment.retrieveUrl.fileExtension = event.target.value;
            localEnrichments[enrichmentIndex] = enrichment;

            setModifiableEnrichments(localEnrichments);
            setUrlError(!isValidHttpUrl(event.target.value));
        };

    const handleTagNameChange =
        (enrichmentIndex: number, tagIndex: number) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localEnrichments = cloneDeep(modifiableEnrichments);
            const enrichment = localEnrichments[enrichmentIndex];
            const tag = enrichment.tags[tagIndex];

            tag.name = event.target.value;
            enrichment.tags[tagIndex] = tag;
            localEnrichments[enrichmentIndex] = enrichment;

            setModifiableEnrichments(localEnrichments);
        };

    const handleExcludedChange =
        (enrichmentIndex: number, tagIndex: number, excludedIndex: number) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const localEnrichments = cloneDeep(modifiableEnrichments);
            const enrichment = localEnrichments[enrichmentIndex];
            const tag = enrichment.tags[tagIndex];

            tag.excluded[excludedIndex] = event.target.value;
            enrichment.tags[tagIndex] = tag;
            localEnrichments[enrichmentIndex] = enrichment;

            setModifiableEnrichments(localEnrichments);
        };

    const handleExcludedDeleteClick = (enrichmentIndex: number, tagIndex: number, excludedIndex: number) => () => {
        const localEnrichments = cloneDeep(modifiableEnrichments);
        const enrichment = localEnrichments[enrichmentIndex];
        const tag = enrichment.tags[tagIndex];
        const excluded: Array<string | null> = tag.excluded;

        excluded[excludedIndex] = null;

        tag.excluded = excluded.filter((datum) => datum !== null) as string[];

        enrichment.tags[tagIndex] = tag;
        localEnrichments[enrichmentIndex] = enrichment;

        setModifiableEnrichments(localEnrichments);
    };

    const handleExcludedAddClick = (enrichmentIndex: number, tagIndex: number) => () => {
        const localEnrichments = cloneDeep(modifiableEnrichments);
        const enrichment = localEnrichments[enrichmentIndex];
        const tag = enrichment.tags[tagIndex];

        tag.excluded.push('');

        enrichment.tags[tagIndex] = tag;
        localEnrichments[enrichmentIndex] = enrichment;

        setModifiableEnrichments(localEnrichments);
    };

    const handleEnrichmentDeleteClick = (enrichmentIndex: number) => () => {
        const localEnrichments: Array<ConfigEnrichment | null> = cloneDeep(modifiableEnrichments);

        localEnrichments[enrichmentIndex] = null;

        setModifiableEnrichments(localEnrichments.filter((datum) => datum !== null) as ConfigEnrichment[]);
    };

    const handleEnrichmentAddClick = () => () => {
        const localEnrichments = cloneDeep(modifiableEnrichments);

        localEnrichments.push({
            url: '',
            retrieveUrl: {
                url: '',
                fileExtension: '',
            },
            tags: [
                {
                    name: '',
                    excluded: [],
                },
            ],
        });

        setModifiableEnrichments(localEnrichments);
    };

    /* eslint-disable react/no-array-index-key */
    return (
        <Stack>
            <Typography id="enrichment-setting" variant="h5">
                {text.title.main}
            </Typography>
            {modifiableEnrichments.map((enrichment, enrichmentIndex) => (
                <Box key={`enrichment_${enrichmentIndex}`} className="processing-box">
                    <Paper className="processing-card" elevation={2}>
                        <TextField
                            label={text.label.url}
                            size="small"
                            value={enrichment.url}
                            onChange={handleUrlChange(enrichmentIndex)}
                            error={urlError}
                            fullWidth
                        />
                        <Box className="processing-params">
                            <Box className="processing-card-divider">
                                <Typography variant="caption">{text.title.retrieveSubTitle}</Typography>
                                <Divider />
                            </Box>
                            <Box className="processing-card-input-box">
                                <TextField
                                    size="small"
                                    label={text.label.retrieveUrl}
                                    value={enrichment.retrieveUrl.url}
                                    onChange={handleUrlRetrieveChange(enrichmentIndex)}
                                    fullWidth
                                />
                                <TextField
                                    size="small"
                                    label={text.label.retrieveFile}
                                    value={enrichment.retrieveUrl.fileExtension}
                                    onChange={handleRetrieveFileExtensionChange(enrichmentIndex)}
                                    fullWidth
                                />
                            </Box>
                            {enrichment.tags.map((tag, tagIndex) => (
                                <Fragment key={`enrichment_${enrichmentIndex}_tag_${tagIndex}`}>
                                    <Box className="processing-card-divider">
                                        <Typography variant="caption">{text.title.tagSubTitle}</Typography>
                                        <Divider />
                                    </Box>
                                    <TextField
                                        size="small"
                                        label={text.label.tagName}
                                        value={tag.name}
                                        onChange={handleTagNameChange(enrichmentIndex, tagIndex)}
                                        fullWidth
                                    />
                                    <fieldset className="processing-card-tags">
                                        <legend>
                                            <Typography variant="caption">{text.title.excludedSubTitle}</Typography>
                                        </legend>
                                        {tag.excluded.map((excluded, excludedIndex) => (
                                            <Box
                                                key={`enrichment_${enrichmentIndex}_tag_${tagIndex}_excluded_${excludedIndex}`}
                                                className="processing-card-input-box"
                                            >
                                                <TextField
                                                    className="processing-card-tag-excluded-input"
                                                    size="small"
                                                    label={text.label.excludedPath}
                                                    value={excluded}
                                                    onChange={handleExcludedChange(
                                                        enrichmentIndex,
                                                        tagIndex,
                                                        excludedIndex,
                                                    )}
                                                    fullWidth
                                                />
                                                <Tooltip title={text.tooltip.deleteExcluded}>
                                                    <IconButton
                                                        onClick={handleExcludedDeleteClick(
                                                            enrichmentIndex,
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
                                                onClick={handleExcludedAddClick(enrichmentIndex, tagIndex)}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </fieldset>
                                </Fragment>
                            ))}
                        </Box>
                    </Paper>
                    <Tooltip title={text.tooltip.deleteEnrichment}>
                        <IconButton onClick={handleEnrichmentDeleteClick(enrichmentIndex)}>
                            <RemoveIcon color="error" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ))}
            <Tooltip title={text.tooltip.addEnrichment}>
                <Button
                    className="processing-add"
                    variant="contained"
                    size="small"
                    onClick={handleEnrichmentAddClick()}
                    fullWidth
                >
                    <AddIcon />
                </Button>
            </Tooltip>
        </Stack>
    );
};

export default EnrichmentList;
