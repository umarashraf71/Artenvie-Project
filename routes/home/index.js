const router = require('express').Router();

router.all('/*', (req, res, next) => {
	req.app.set('layout', 'layouts/front');
	next();
});

router.get('/', (req, res) => {
	res.render('layouts/front');
});

module.exports = router;
