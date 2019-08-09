var express = require('express');
var router = express.Router();
var client = require('../services/contentfulClient').client;

router.get('/', function(req, res, next) {
    // Check if request was made by our own server
    if(req.headers.referer !== undefined && req.headers.referer.includes(req.headers.host)) {
        client.getEntries({
            'content_type': 'activity'
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

module.exports = router;