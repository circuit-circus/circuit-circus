var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
		res.redirect('/');
});

module.exports = router;