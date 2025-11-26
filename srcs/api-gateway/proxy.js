// proxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/movies',
    createProxyMiddleware({
      // From inside a VM, 10.0.2.2 reaches the host's forwarded ports
      target: process.env.INVENTORY_API_URL,
      changeOrigin: true,
      // Express strips the mount path, so re-prefix it when proxying
      pathRewrite: (path) => `/api/movies${path}`,
    })
  );
};