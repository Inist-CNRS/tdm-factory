import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '~/app/App';
import ThemeProvider from '~/app/provider/ThemeProvider';

const container = document.getElementById('root') as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);
const queryClient = new QueryClient();

root.render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ThemeProvider>
            <ReactQueryDevtools />
        </QueryClientProvider>
    </StrictMode>,
);
