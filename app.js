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

// Contentful setup
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'oewqprhhhtof',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'a75e18bbc503ef3471d464e9648bfef6cefc1c3ac76338e1fec42d02ba6e718c'
});


// Routes
app.route('/').get(function(req, res) {
    res.render('index');
});

app.route('/projects').get(function(req, res) {
    client.getEntries({
        'content_type': 'project'
    })
    .then(function (entries) {
        res.render('projects', { projects: entries.items });
    });
});

app.route('/workshops').get(function(req, res) {
    client.getEntries({
        'content_type': 'workshop'
    })
    .then(function (entries) {
        res.render('workshops', { workshops: entries.items });
    });
});

// general error handling
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
