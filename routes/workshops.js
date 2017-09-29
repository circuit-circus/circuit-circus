var express = require('express');
var router = express.Router();
var client = require('../services/contentfulClient').client;

router.get('/', function(req, res, next) {
    client.getEntries({
        'content_type': 'workshop'
    })
    .then(function (entries) {
        res.render('pages/workshops', { workshops: entries.items });
    });
});

router.param('slug', function (req, res, next, slug) {
    var query = {
        'content_type' : 'workshop',
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
    res.render('pages/workshops-single', {workshop: req.project});
});

module.exports = router;