const router = require('express').Router();
const passport = require('passport');
const {
	userProfile,
	artistProfile,
	artistArtworks,
	verifyUser,
	verifyUserResetCode,
	resetPassword,
	forgotPasswordPage,
	forgotPassword,
	placeBid,
	addToWishlist,
	signUp,
	logIn,
	postComment,
	googleSingUp,
} = require('../../controllers/users');
const { authenticateUser } = require('../../helpers/auth');

router.all('/*', (req, res, next) => {
	req.app.set('layout', 'layouts/home');
	next();
});

router.post('/register', signUp);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/home/login' }), (req, res) => {
	res.redirect('/home');
});

router.get('/verify/:token', verifyUser);

router.post('/resetPassword', verifyUserResetCode);

router.post('/setPassword/:id', resetPassword);

router.post('/login', logIn);

router.get('/profile/:slug', userProfile);

router.get('/artist/profile/:slug', artistProfile);

router.post('/biddingroom/updatebid/:id', authenticateUser, placeBid);

router.get('/wishlist/:slug', authenticateUser, addToWishlist);

router.route('/forgotPassword').get(forgotPasswordPage).post(forgotPassword);

router.post('/comment/:slug', postComment);

router.get('/artist/artworks/:artist', artistArtworks);
//router.post('/resetPassword', verifyUser);

module.exports = router;
