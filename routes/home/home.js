const router = require('express').Router();
const {
	showHomePage,
	showArtists,
	showBiddingRoom,
	placeBidPage,
	showProductInfo,
	searchData,
	aboutUs,
	contactUs,
	signUpPage,
	logInPage,
	logOut,
	showGalleryArtworks,
	roomArtworks,
	filterByPrice,
	queries,
} = require('../../controllers/home');

const { adminAccessPage, adminAccess } = require('../../controllers/admin');

router.all('/*', (req, res, next) => {
	req.app.set('layout', 'layouts/home');
	next();
});

router.get('/', showHomePage);

router.get('/artists/:page?', showArtists);

router.get('/categories/:page?/:category?', showGalleryArtworks);

router.get('/rooms/:room/:page?', roomArtworks);

router.get('/about', aboutUs);

router.get('/contact', contactUs);

router.post('/sendquery', queries);

router.get('/productpage/:slug', showProductInfo);

router.post('/search/:query', searchData);

router.get('/biddingroom', showBiddingRoom);

router.get('/biddingroom/placebid/:id', placeBidPage);

router.get('/register', signUpPage);

router.get('/login', logInPage);

router.get('/logout', logOut);

router.post('/categories/filter', filterByPrice);

router.route('/user-Roles').get(adminAccessPage).post(adminAccess);

module.exports = router;
