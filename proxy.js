const http = require('http');

const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8082'
    });
});

server.listen(8082)