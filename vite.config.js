import { defineConfig, loadEnv } from 'vite';
import createVuePlugin  from '@vitejs/plugin-vue';
import commonjs from 'vite-plugin-commonjs';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.NODE_ENV === 'production' ? '/eperusteet-ylops-service/ui' : '/',
    plugins: [
      createVuePlugin({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        },
      }),
      commonjs(),
    ],
    define: {
      'process.env.BUILD': JSON.stringify(env.BUILD), // Define the BUILD environment variable
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['legacy-js-api', 'import'],
        },
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('./eperusteet-frontend-utils/vue/src', import.meta.url)),
        '@assets': fileURLToPath(new URL('./eperusteet-frontend-utils/vue/public', import.meta.url)),
        '&': fileURLToPath(new URL('./tests', import.meta.url)),
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
        vue: '@vue/compat',
      },
    },
    server: {
      port: 9040,
      proxy: {
        '/eperusteet-service': {
          target: 'http://localhost:8080',
          secure: false,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet');
            });
          },
        },
        '/eperusteet-ylops-service': {
          target: 'http://localhost:8081',
          secure: false,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet-ylops');
            });
          },
        },
      },
    },
  };
});
