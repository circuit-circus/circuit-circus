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

router.get('/concept/semeion', function(req, res, next) {
    res.render('pages/concept/semeion', { layout: 'concept-layout' });
});

router.get('/petri', function(req, res, next) {
    res.render('pages/concept/petri', { layout: 'barebones-layout' });
});

module.exports = router;