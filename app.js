var express = require('express');
var app = express();
var ejsLayouts = require("express-ejs-layouts");
var favicon = require('serve-favicon');
var contentful = require('contentful');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(ejsLayouts);
app.use(favicon('favicon.png'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


var index = require('./routes/index.js');
var projects = require('./routes/projects.js');
//var workshops = require('./routes/workshops.js');

app.use('/', index);
app.use('/projects', projects);
//app.use('/workshops', workshops);


// General error handling
app.use(function (err, req, res, next) {
    console.log(err);
	if (err.status == 404) {
		res.status(404).render('error', {error: err});
	} else {
		res.status(500).render('error', {error: err});
	}
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});