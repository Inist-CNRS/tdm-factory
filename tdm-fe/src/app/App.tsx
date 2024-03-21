import '~/app/App.scss';
import { Route, Routes } from 'react-router-dom';
import Header from '~/app/components/layout/Header';
import ProcessingCreationForm from '~/app/pages/ProcessingCreationForm';
import ProcessingStatus from '~/app/pages/ProcessingStatus';
import ProcessingFormContextProvider from '~/app/provider/ProcessingFormContextProvider';
import { RouteProcessingStatus, RouteRoot } from '~/app/shared/routes';

const App = () => {
    return (
        <>
            <Header />
            <div id="app-container">
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
            </div>
        </>
    );
};

export default App;
