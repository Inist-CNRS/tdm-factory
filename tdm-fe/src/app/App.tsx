import '~/app/App.scss';
import Footer from '~/app/components/layout/Footer';
import Header from '~/app/components/layout/Header';
import ServiceDescription from '~/app/components/layout/ServiceDescription';
import WebServicesFooter from '~/app/components/layout/WebServicesFooter';
import HomePage from '~/app/pages/HomePage';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import ProcessingStatus from '~/app/pages/ProcessingStatus';
import { RouteProcessingStatus, RouteRoot } from '~/app/shared/routes';

import Container from '@mui/material/Container';
import { Route, Routes } from 'react-router-dom';

const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path={RouteRoot} element={
                    <>
                        <Container id="app-container">
                            <HomePage />
                        </Container>
                        <ServiceDescription />
                    </>
                } />
                <Route path="/process/:type" element={
                    <Container id="app-container">
                        <ProcessingCreationForm />
                    </Container>
                } />
                <Route path={`${RouteProcessingStatus}/:id`} element={
                    <Container id="app-container">
                        <ProcessingStatus />
                    </Container>
                } />
            </Routes>
            <WebServicesFooter />
            <Footer />
        </>
    );
};

export default App;
