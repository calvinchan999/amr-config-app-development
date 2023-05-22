const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Proxy requests to the first backend
  app.use(
    "/node",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      pathRewrite: {
        "^/node": "",
      },
    })
  );
};
