const router = require('express').Router();
const { authenticateUser, adminAccessOnly } = require('../../helpers/auth');
const Notification = require('../../models/Notification');
const {
	dashboard,
	fetchAllUsers,
	fetchOrders,
	fetchComments,
	filterOrders,
	approveComment,
	deleteComment,
	deleteUser,
	updateArtworkStatus,
	updateUserStatus,
	cancelOrder,
	sendWarningMessagePage,
	sendWarningMessage,
	userQueries,
	manageOrders,
	showUserRoles,
	updateRoles,
	searchUser,
} = require('../../controllers/admin');

router.all('/*', authenticateUser, async (req, res, next) => {
	req.app.set('layout', 'layouts/admin');

	if (req.user.roles.includes('admin')) {
		res.locals.notifications = await Notification.find({
			username: 'admin',
			status: false,
		});
		next();
	} else {
		res.locals.notifications = await Notification.find({ username: req.user.username, status: false });
		next();
	}
});

// shows site analytics
router.get('/', dashboard);

router.get('/fetchUsers/:type?', adminAccessOnly, fetchAllUsers);

router.route('/account/role/:id').get(showUserRoles).post(updateRoles);

router.get('/account/updateStatus/:id/:status', adminAccessOnly, updateUserStatus);
router.get('/artwork/updateStatus/:id/:status', adminAccessOnly, updateArtworkStatus);

router.get('/comments', adminAccessOnly, fetchComments);
router.get('/comments/approveComment/:id', adminAccessOnly, approveComment);
router.get('/comments/remove/:id', adminAccessOnly, deleteComment);

router.get('/delete/:id/:userType', adminAccessOnly, deleteUser);

router.get('/Queries', adminAccessOnly, userQueries);

router.route('/sendWarning/:user?').get(sendWarningMessagePage).post(sendWarningMessage);

router.post('/search', adminAccessOnly, searchUser);

router.get('/manageOrders', adminAccessOnly, manageOrders);
router.get('/filterOrders/:status', adminAccessOnly, filterOrders);
router.get('/manageOrders/cancel/:id', adminAccessOnly, cancelOrder);

router.get('/allOrders', fetchOrders);

module.exports = router;
