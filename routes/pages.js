var express = require('express');
var router = express.Router();
var client = require('../services/contentfulClient').client;

router.get('/', function(req, res, next) {
    // Check if request was made by our own server
    if(req.headers.referer !== undefined && req.headers.referer.includes(req.headers.host)) {
        client.getEntries({
            'content_type': 'page'
        })
        .then(function (entries) {
            res.send({pages: entries.items});
        });
    }
    // If not, redirect to main page
    else {
        res.redirect('http://' + req.headers.host)
    }
});

router.param('slug', function (req, res, next, slug) {
    var query = {
        'content_type' : 'page',
        'fields.slug' : slug
    }

    client.getEntries(query).then(function(page) {
        req.page = page.items[0];
        next();
    }).catch(function(error) {
        console.log(error);
    });
})

router.get('/:slug', function(req, res, next) {
    res.send({page: req.page});
});

module.exports = router;