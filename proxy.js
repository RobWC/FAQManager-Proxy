var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
} else {
	var fs = require('fs'),
		https = require('https'),
		httpProxy = require('http-proxy');
	
	var options = {
	  https: {
		key: fs.readFileSync('/root/ninjafaq.key', 'utf8'),
		cert: fs.readFileSync('/root/ninjafaq.com.crt', 'utf8'),
		ca: fs.readFileSync('/root/sf_bundle.crt','utf8')
	  }
	};
	
	//
	// Create your proxy server
	var proxy = new httpProxy.RoutingProxy();
	https.createServer(options.https, function(req,res) {
	  proxy.proxyRequest(req,res, {
		host: 'localhost',
		port: 5984
	  })
	}).listen(443);
	
	http.createServer(function(req,res) {
	  res.writeHead(302, {
		'Location': 'https://www.ninjafaq.com'
	  });
	  res.end();
	}).listen(80);
};
