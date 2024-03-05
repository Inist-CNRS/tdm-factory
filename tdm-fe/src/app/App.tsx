import '~/app/App.scss';
import { Route, Routes } from 'react-router-dom';
import Header from '~/app/components/layout/Header';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import ProcessingStatus from '~/app/pages/ProcessingStatus';
import Root from '~/app/pages/Root';
import { RouteCreateProcessing, RouteProcessingStatus, RouteRoot } from '~/app/shared/routes';

const App = () => {
    return (
        <>
            <Header />
            <div id="app-container">
                <Routes>
                    <Route path={RouteRoot} element={<Root />} />
                    <Route path={RouteCreateProcessing} element={<ProcessingCreationForm />} />
                    <Route path={`${RouteProcessingStatus}/:id`} element={<ProcessingStatus />} />
                </Routes>
            </div>
        </>
    );
};

export default App;
