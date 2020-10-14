const router = require('express').Router(),
	{ authenticateUser } = require('../../helpers/auth'),
	{
		showAccountInfo,
		accountEditPage,
		updateAccountInfo,
		changePasswordPage,
		matchCurrentPassword,
		updatePassword,
		forgotPasswordPage,
		forgotPassword,
		verifyUserAndResetPassword,
		wishlist,
		userInbox,
		showArtistReviews,
		contactAdminPage,
		contactAdmin,
		adminWarnings,
		customerReview,
		auctionArtworks,
		removeBid,
		readNotification,
		markAllAsReadNotification,
	} = require('../../controllers/users'),
	{ showOrders, orderDetails, deliverOrder, completeOrder, contactCustomer, orderCancellationRequest, orderCancellationReason, giveReview, deleteOrder } = require('../../controllers/admin');

// default route for all successive routes
router.all('/*', authenticateUser, (req, res, next) => {
	req.app.set('layout', 'layouts/admin');
	next();
});

router.get('/account', showAccountInfo);
router.get('/account/edit', accountEditPage);
router.put('/account/edit/:id', updateAccountInfo);
router.get('/account/password', changePasswordPage);
router.route('/account/password/:id').post(matchCurrentPassword).put(updatePassword);

router.get('/readNotification/:url/:id', readNotification);

router.get('/markAllRead', markAllAsReadNotification);

router.get('/reviews', showArtistReviews);

router.route('/contactAdmin').get(contactAdminPage).post(contactAdmin);

router.get('/adminWarnings', adminWarnings);

router.post('/customerReview/:artistName', customerReview);

router.get('/wishlist/:id', wishlist);

router.get('/auctions', auctionArtworks);

router.route('/inbox/:id?').get(userInbox);

router.get('/orders/:status', showOrders);

router.get('/orders/details/:id', orderDetails);

router.get('/orders/contactCustomer/:id', contactCustomer);

router.get('/orders/deliver/:id/:orderID', deliverOrder);
router.get('/orders/complete/:orderID/:artistName', completeOrder);

router.get('/deletebid/:id/:user', removeBid);

router.get('/orders/cancel/:orderID', orderCancellationRequest);
router.post('/orders/cancelReason/:orderID', orderCancellationReason);

router.get('/orders/giveReview/:artistName', giveReview);

//for both customer
router.get('/manageOrders/remove/:id', deleteOrder);

module.exports = router;
