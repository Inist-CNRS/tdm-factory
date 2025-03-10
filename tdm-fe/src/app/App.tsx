import '~/app/App.scss';
import Footer from '~/app/components/layout/Footer';
import Header from '~/app/components/layout/Header';
import WebServicesDescription from '~/app/components/layout/WebServicesDescription';
import WebServicesFooter from '~/app/components/layout/WebServicesFooter';
import WebServicesHeader from '~/app/components/layout/WebServicesHeader';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import ProcessingStatus from '~/app/pages/ProcessingStatus';
import { RouteProcessingStatus, RouteRoot } from '~/app/shared/routes';

import Container from '@mui/material/Container';
import { Route, Routes } from 'react-router-dom';

const App = () => {
    return (
        <>
            <Header />
            <WebServicesHeader />
            <Container id="app-container">
                <Routes>
                    <Route
                        path={RouteRoot}
                        element={<ProcessingCreationForm />}
                    />
                    <Route
                        path={`${RouteProcessingStatus}/:id`}
                        element={<ProcessingStatus />}
                    />
                </Routes>
            </Container>
            <WebServicesDescription />
            <WebServicesFooter />
            <Footer />
        </>
    );
};

export default App;
