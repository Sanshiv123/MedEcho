/**
 * setupProxy.js
 * Development proxy configuration for Create React App.
 * Forwards specific route prefixes from the React dev server (port 3000)
 * to the Flask backend (port 5000), bypassing CORS restrictions in development.
 *
 * This file is automatically picked up by CRA — do not import it manually.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  // Forward all /api/* requests to Flask
  // e.g. /api/scan, /api/explain, /api/approve
  app.use('/api', createProxyMiddleware({
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  }));

  // Forward all /files/* requests to Flask
  // Used for any file serving endpoints
  app.use('/files', createProxyMiddleware({
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  }));


};