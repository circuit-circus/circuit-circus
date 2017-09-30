var express = require('express');
var router = express.Router();
var client = require('../services/contentfulClient').client;

router.get('/', function(req, res, next) {
    client.getEntries({
        'content_type': 'project'
    })
    .then(function (entries) {
        //res.render('pages/projects', { projects: entries.items });
        res.send({projects: entries.items});
    });
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
    res.render('pages/projects-single', {project: req.project});
});

module.exports = router;