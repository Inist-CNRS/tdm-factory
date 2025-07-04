import '~/app/App.scss';
import CookieConsent from './components/CookieConsent';
import PrivacyPolicy from './components/PrivacyPolicy';

import Footer from '~/app/components/layout/Footer';
import Header from '~/app/components/layout/Header';
import ServiceDescription from '~/app/components/layout/ServiceDescription';
import WebServicesFooter from '~/app/components/layout/WebServicesFooter';
import HomePage from '~/app/pages/HomePage';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import { RouteRoot } from '~/app/shared/routes';

import Container from '@mui/material/Container';
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';

const StatusRedirect = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const flowId = searchParams.get('flowId');

    const statusLink = `/process/result?id=${id}&step=5${flowId ? `&flowId=${flowId}` : ''}`;

    return <Navigate to={statusLink} replace />;
};

const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route
                    path={RouteRoot}
                    element={
                        <>
                            <Container id="app-container">
                                <HomePage />
                            </Container>
                            <ServiceDescription />
                        </>
                    }
                />
                <Route path="/status/:id" element={<StatusRedirect />} />
                <Route
                    path="/process/:type"
                    element={
                        <Container id="app-container">
                            <ProcessingCreationForm />
                        </Container>
                    }
                />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
            <WebServicesFooter />
            <Footer />
            <CookieConsent />
        </>
    );
};

export default App;
