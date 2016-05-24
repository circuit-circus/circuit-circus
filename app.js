
/**
 * Module dependencies.
 */

var express = require('express'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
methodOverride = require('method-override'),
session = require('express-session'),
errorHandler = require('errorhandler'),
http = require('http'),
path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon("public/images/punch.png"));

app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));

app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.route('/').get(function(req, res) {
	res.render('index');
});

// error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = [];
    err.message = 'Not found';
    err.status = 404;
    next(err);
});
// general error handling
app.use(function (err, req, res, next) {
	if (err.status == 404) {
		res.status(404).render('error', {error: err});
	} else {
		res.status(500).render('error', {error: err});
	}
});

var PORT = app.get('port');

app.listen(PORT, function() {
	console.log('Express server listening on port ' + PORT);
});
