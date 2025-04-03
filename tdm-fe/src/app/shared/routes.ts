const Routes = {
    root: '/',
    processing: '/process/:type',
    processingStatus: '/status',
} as const;

export const RouteRoot = Routes.root;
export const RouteProcessing = Routes.processing;
export const RouteProcessingStatus = Routes.processingStatus;
