import '~/app/App.scss';
import { Route, Routes } from 'react-router-dom';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';
import Header from '~/app/layout/Header';
import CreateProcessing from '~/app/pages/CreateProcessing';
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
                    <Route path={RouteCreateProcessing} element={<CreateProcessing />} />
                    <Route path={`${RouteProcessingStatus}/:id`} element={<ProcessingStatus />} />
                </Routes>
            </div>
            <ProcessingFormStepper />
        </>
    );
};

export default App;
