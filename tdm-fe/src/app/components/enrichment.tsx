'use client';
import { DefaultApiFactory } from '@/generated/api';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import Box from '@mui/material/Box';
import { MuiFileInput } from 'mui-file-input';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Request } from '@/generated/api';

type EnrichmentProps = {
    selectWrapper: any;
    selectEnrichment: any;
    selectFile: any;
    fileError: boolean;
};

const Enrichment: React.FC<EnrichmentProps> = (props: EnrichmentProps) => {
    const [dataWrappers, setDataWrappers] = useState<Request[]>([]);
    const [dataEnrichments, setDataEnrichment] = useState<Request[]>([]);
    const [selectedWrapper, setWrapper] = React.useState<Request | null>(null);
    const [selectedEnrichment, setEnrichment] = React.useState<Request | null>(null);
    const [file, setFile] = React.useState<File>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                //Fetching data from wrappers and enrichments
                const api = await DefaultApiFactory();
                const fetchDataWrappers = await api.dataWrappersListGet();
                setDataWrappers(fetchDataWrappers.data);
                const fetchDataEnrichments = await api.dataEnrichmentsListGet();
                setDataEnrichment(fetchDataEnrichments.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (event: any) => {
        props.selectWrapper(dataWrappers.find((wrapper: Request) => wrapper.label === event.target.textContent) || {});
        setWrapper(dataWrappers.find((wrapper: Request) => wrapper.label === event.target.textContent) || {});
    };

    const handleChangeEnrichment = (event: any) => {
        props.selectEnrichment(
            dataEnrichments.find((enrichment: Request) => enrichment.label === event.target.textContent) || {},
        );
        setEnrichment(dataEnrichments.find((wrapper: Request) => wrapper.label === event.target.textContent) || {});
    };

    const handleFileInput = (newFile: any) => {
        props.selectFile(newFile);
        setFile(newFile);
    };

    const handleInputChange = (event: any) => {
        selectedWrapper?.parameters?.forEach((p) => (p.value = event.target.value));
        props.selectWrapper(selectedWrapper);
        setWrapper(selectedWrapper);
    };
    return (
        <>
            <MuiFileInput
                error={props.fileError}
                content="title"
                label="Déposer un fichier"
                value={file}
                onChange={handleFileInput}
                fullWidth
                sx={{ mb: 2, mt: 2, minWidth: 200 }}
            />
            {props.fileError ? (
                <p className="error">
                    Le fichier n&apos;est pas compatible avec le convertisseur, utilisez le type{' '}
                    {selectedWrapper?.fileType}.
                </p>
            ) : null}
            <FormControl sx={{ mt: 2, width: '100%' }}>
                <Autocomplete
                    disablePortal
                    id="combo-box-wrapper"
                    options={dataWrappers}
                    onChange={handleChange}
                    renderInput={(params) => <TextField {...params} label="Convertisseur" />}
                />
            </FormControl>

            {selectedWrapper ? <ReactMarkdown>{selectedWrapper.description}</ReactMarkdown> : null}
            {selectedWrapper?.parameters !== undefined && selectedWrapper.parameters.length > 0 ? (
                <Box sx={{ p: 2, border: '1px' }}>
                    {selectedWrapper?.parameters?.map((param: any) => (
                        <TextField
                            key={param.label}
                            sx={{ m: 2, minWidth: 200 }}
                            id={param.label}
                            label={param.displayName}
                            variant="outlined"
                            fullWidth
                            onChange={handleInputChange}
                        />
                    ))}
                </Box>
            ) : null}
            <FormControl sx={{ mt: 2, width: '100%' }}>
                <Autocomplete
                    disablePortal
                    id="combo-box-enrichment"
                    options={dataEnrichments}
                    onChange={handleChangeEnrichment}
                    renderInput={(params) => <TextField {...params} label="Traitement" />}
                />
            </FormControl>
            {selectedEnrichment ? <ReactMarkdown>{selectedEnrichment.description}</ReactMarkdown> : null}
        </>
    );
};

export default Enrichment;
