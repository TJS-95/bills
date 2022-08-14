import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  // proxy: {
  //   '/api': {
  //     'target': 'http://localhost:3000/api',
  //     // 'logLevel': 'debug',
  //     'changeOrigin': true,
  //     'pathRewrite': { '^/api' : '' },
  //   },
  // },
})
