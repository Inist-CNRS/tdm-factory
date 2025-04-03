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
            <Container id="app-container">
                <Routes>
                    <Route path={RouteRoot} element={<HomePage />} />
                    <Route path="/process/:type" element={<ProcessingCreationForm />} />
                    <Route path={`${RouteProcessingStatus}/:id`} element={<ProcessingStatus />} />
                </Routes>
            </Container>
            <ServiceDescription />
            <WebServicesFooter />
            <Footer />
        </>
    );
};

export default App;
