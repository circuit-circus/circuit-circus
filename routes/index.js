var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('pages/index');
});

router.get('/about', function(req, res, next) {
    res.render('pages/about');
});

router.get('/contact', function(req, res, next) {
    res.render('pages/contact');
});

router.get('/museion', function(req, res, next) {
    res.redirect('https://docs.google.com/forms/d/1UKk4d0z7kVqUmaZPi32OOg-D4bbLRn2nsIsH2UNNqns');
});

module.exports = router;