const Routes = {
    root: '/',
    createProcessing: '/new',
    processingStatus: '/status',
} as const;

export const RouteRoot = Routes.root;
export const RouteCreateProcessing = Routes.createProcessing;
export const RouteProcessingStatus = Routes.processingStatus;
