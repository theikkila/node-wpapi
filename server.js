var restify = require('restify');

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : process.env.USER || 'lanttu',
  database		    : 'lanttudb',
  password        : process.env.PASS
});


var controllers = require('./controllers')(pool);

var server = restify.createServer();

server.get('/api/v0/', controllers.all);
server.get('/api/v0/menu', controllers.menu);
server.get('/api/v0/posts', controllers.posts);
server.get('/api/v0/posts/:post', controllers.post);
server.get('/api/v0/pages', controllers.pages);
server.get('/api/v0/sponsors', controllers.sponsors);
server.get('/api/v0/pages/:page', controllers.page);

server.listen(process.env.PORT || 8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
