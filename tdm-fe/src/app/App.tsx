import '~/app/App.scss';
import Footer from '~/app/components/layout/Footer';
import Header from '~/app/components/layout/Header';
import WebServicesFooter from '~/app/components/layout/WebServicesFooter';
import WebServicesHeader from '~/app/components/layout/WebServicesHeader';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import ProcessingStatus from '~/app/pages/ProcessingStatus';
import ProcessingFormContextProvider from '~/app/provider/ProcessingFormContextProvider';
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
                        element={
                            <ProcessingFormContextProvider>
                                <ProcessingCreationForm />
                            </ProcessingFormContextProvider>
                        }
                    />
                    <Route path={`${RouteProcessingStatus}/:id`} element={<ProcessingStatus />} />
                </Routes>
            </Container>
            <WebServicesFooter />
            <Footer />
        </>
    );
};

export default App;
