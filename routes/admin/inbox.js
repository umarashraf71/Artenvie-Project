const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../helpers/auth');
const { Inbox, Contact, ChatInboxRoom } = require('../../controllers/Inbox');

router.all('/*', authenticateUser, (req, res, next) => {
	req.app.set('layout', 'layouts/admin');
	next();
});

router.get('/', Inbox);

router.get('/:id/:username', Contact);

router.get('/chat/:id/:reciever', ChatInboxRoom);

module.exports = router;
