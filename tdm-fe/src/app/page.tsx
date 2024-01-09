'use client'
import React from 'react';
import { DefaultApiFactory, Request, Traitment } from '@/generated/api';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Enrichment from './components/enrichment';
import { Alert, Button, TextField, LinearProgress } from '@mui/material';
import TraitmentComponent from './components/traitment';


export interface Props {
  searchParams: {
    id: number;
  }
}


const Home: React.FC<Props> = (props: Props) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedWrapper, setWrapper] = React.useState<Request>();
  const [selectedEnrichment, setEnrichment] = React.useState<Request>();
  const [file, setFile] = React.useState<File>();
  const [fileError, setFileError] = React.useState<boolean>(false);
  const [mail, setMail] = React.useState<string>();
  const [startResult, setStartResult] = React.useState<{ success: boolean, message?: string, url?: string }>();
  const [loading, setLoading] = React.useState(false);
  const [isValidEmail, setIsValidEmail] = React.useState(false);

  const handleMailChange = (event: { target: { value: React.SetStateAction<string | undefined>; }; }) => {
    setMail(event.target.value);
    // Regular expression to check for a valid email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(event.target.value ? event.target.value.toString() : '');
    setIsValidEmail(isValid);
  };

  const handleRestart = async () => {
    setActiveStep(0);
    setFileError(false);
    setWrapper(undefined);
    setEnrichment(undefined);
  };

  const handleNext = async () => {
    const api = await DefaultApiFactory();
    switch (activeStep) {
      case 0:
        if (selectedWrapper?.fileType && file && selectedWrapper.fileType.indexOf(file.type) - 1) {
          setFileError(false);
          setLoading(true);
          api.traitmentUploadPost(file).then((res) => {
            setLoading(false);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          });
        } else {
          setFileError(true);
        }
        break;
      case 1:
        const traitment: Traitment = {
          wrapper: selectedWrapper,
          enrichment: selectedEnrichment,
          file: file?.name,
          mail: mail
        };
        setLoading(true);
        api.traitmentStartPost(traitment, { timeout: 600000 }).then((res) => {
          setStartResult({ success: true, message: res.data?.message, url: res.data.url });
          setLoading(false);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }, (error) => {
          setStartResult({ success: false, message: error.response.data });
          setLoading(false);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        });
        break;
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setFileError(false);
      setWrapper(undefined);
      setEnrichment(undefined);
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSelectWrapper = (outputData: Request) => {
    setWrapper(outputData);
  };
  const handleSelectEnrichment = (outputData: Request) => {
    setEnrichment(outputData);
  };
  const handleSelectFile = (outputData: any) => {
    setFile(outputData);
  };
  const steps = ['Configuration', 'Vérification', 'Confirmation'];

  return (
    //If we have queryparams then redirect to traitmentcomponent to handle following
    props.searchParams.id ? <TraitmentComponent id={props.searchParams.id} /> :
      //Else display main page
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Box sx={{ width: '100%' }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {loading ? (
            <LinearProgress sx={{ mt: 2, mb: 2 }} />
          ) :
            activeStep === 0 ? (
              <Enrichment fileError={fileError} selectWrapper={handleSelectWrapper} selectEnrichment={handleSelectEnrichment} selectFile={handleSelectFile} />
            ) : (activeStep === 1 ? (

              <React.Fragment>
                <Alert severity="success" sx={{ display: 'flex', flexDirection: 'row', m: 4 }}>Le document {file?.name} a été chargé avec succès.</Alert>
                <TextField id="email-basic" label="E-mail" variant="outlined" value={mail} onChange={handleMailChange} fullWidth />
              </React.Fragment>
            ) : (
              <Box>
                <Alert severity={startResult?.success ? 'success' : 'error'} sx={{ display: 'flex', flexDirection: 'row', m: 4 }}>{startResult?.message}</Alert>
                {startResult?.url?.split('https://')[0]}<a href={startResult?.url?.split('url ')[1]} target="blank">{startResult?.url?.split('url ')[1]}</a>
              </Box>
            ))}
          {!loading && activeStep !== steps.length - 1 ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Précédent
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext} disabled={activeStep === 0 ? !selectedWrapper || !selectedEnrichment || !file : !isValidEmail}>
                Suivant
              </Button>
            </Box>) : !loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleRestart} disabled={activeStep === 0 ? !selectedWrapper || !selectedEnrichment || !file : !isValidEmail}>
                  Lancer un nouveau traitement
                </Button>
              </Box>) : null}
        </Box>
      </main>
  );
};

export default Home;
