// proxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
    // INVENTORY APP
    app.use(
        "/inventory",
        createProxyMiddleware({
            target: "http://inventory-app:8080",
            changeOrigin: true,
            pathRewrite: { "^/inventory": "" },
        })
    );

    // BILLING APP
    app.use(
        "/billing",
        createProxyMiddleware({
            target: "http://billing-app:8080",
            changeOrigin: true,
            pathRewrite: { "^/billing": "" },
        })
    );

    // RABBITMQ MGMT (optional)
    app.use(
        "/rabbit",
        createProxyMiddleware({
            target: "http://rabbitmq:15672",
            changeOrigin: true,
            pathRewrite: { "^/rabbit": "" },
        })
    );
};