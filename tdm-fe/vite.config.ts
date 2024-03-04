import react from '@vitejs/plugin-react';
import md5 from 'md5';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
import tsconfigPaths from 'vite-tsconfig-paths';

const regex = /(.*node_modules\/)([^\/]+)(.*)/;

const linter = process.env.VITE_ENV === 'prod' ? [] : [eslint(), stylelint()];

export default defineConfig({
    plugins: [react(), tsconfigPaths(), ...linter],
    css: {
        devSourcemap: process.env.VITE_SOURCE_MAP === 'true',
    },
    build: {
        sourcemap: process.env.VITE_SOURCE_MAP === 'true',
        rollupOptions: {
            output: {
                manualChunks: (id, meta) => {
                    if (id.includes('node_modules') && meta.getModuleInfo(id).isIncluded) {
                        const hash = md5(regex.exec(id)[2].replace('@', ''));
                        return `vendor/${hash.slice(0, 8)}`;
                    }
                },
            },
        },
        minify: 'terser',
        terserOptions: {
            sourceMap: process.env.VITE_SOURCE_MAP === 'true',
            ecma: 2018,
            compress: {
                ecma: 2018,
            },
            format: {
                ecma: 2018,
            },
        },
    },
});
