import react from '@vitejs/plugin-react';
import md5 from 'md5';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

const regex = /(.*node_modules\/)([^\/]+)(.*)/;

const linter =
    process.env.VITE_ENV === 'prod'
        ? []
        : [
              eslint({
                  failOnError: false,
              }),
          ];

export default defineConfig({
    plugins: [react(), tsconfigPaths(), ...linter],
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['legacy-js-api'],
            },
        },
    },
    build: {
        sourcemap: true,
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
            sourceMap: true,
            ecma: 2020,
            compress: {
                ecma: 2020,
            },
            format: {
                ecma: 2020,
            },
        },
    },
});
