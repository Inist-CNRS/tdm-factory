import App from '~/app/App';
import AuthProvider from '~/app/components/provider/AuthProvider';

import { StyledEngineProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';

const container = document.getElementById('root') as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);
const queryClient = new QueryClient();

root.render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <StyledEngineProvider injectFirst>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </StyledEngineProvider>
            <ReactQueryDevtools />
        </QueryClientProvider>
    </StrictMode>,
);
