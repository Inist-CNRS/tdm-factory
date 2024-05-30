import react from '@vitejs/plugin-react';
import md5 from 'md5';
import gzipPlugin from 'rollup-plugin-gzip';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
import tsconfigPaths from 'vite-tsconfig-paths';

import { promisify } from 'node:util';
import { brotliCompress } from 'node:zlib';

const brotliPromise = promisify(brotliCompress);

const regex = /(.*node_modules\/)([^/]+)(.*)/;

const linter =
    process.env.VITE_ENV === 'prod'
        ? []
        : [
              eslint({
                  failOnError: false,
              }),
              stylelint(),
          ];

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        gzipPlugin({
            customCompression: (content) => brotliPromise(Buffer.from(content)),
            fileName: '.br',
            minSize: 1000,
            gzipOptions: {
                level: 9,
            },
        }),
        gzipPlugin({
            minSize: 1000,
            gzipOptions: {
                level: 9,
            },
        }),
        ...linter,
    ],
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
