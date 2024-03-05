/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface ImportMetaEnv {
    readonly VITE_TDM_FACTORY_HOST: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
