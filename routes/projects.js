var express = require('express');
var router = express.Router();
var client = require('../services/contentfulClient').client;

router.get('/', function(req, res, next) {
    // Check if request was made by our own server
    if(req.headers.referer !== undefined && req.headers.referer.includes(req.headers.host)) {
        client.getEntries({
            'content_type': 'project'
        })
        .then(function (entries) {
            //res.render('pages/projects', { projects: entries.items });
            res.send({projects: entries.items});
        });
    }
    // If not, redirect to main page
    else {
        res.redirect(req.headers.host)
    }
});

router.param('slug', function (req, res, next, slug) {
    var query = {
        'content_type' : 'project',
        'fields.slug' : slug
    }

    client.getEntries(query).then(function(project) {
        req.project = project.items[0];
        next();
    }).catch(function(error) {
        console.log(error);
    });
})

router.get('/:slug', function(req, res, next) {
    res.send({project: req.project});
});

module.exports = router;