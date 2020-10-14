const router = require('express').Router();
const { authenticateUser, artistAccessOnly } = require('../../helpers/auth');

const { fetchAllPosts, showArtworks, uploadArtworkPage, uploadArtwork, uploadInAuction, userPosts, editPost, updatePost, deletePost, searchArtwork } = require('../../controllers/posts');

router.all('/*', authenticateUser, (req, res, next) => {
	req.app.set('layout', 'layouts/admin');
	next();
});

router.get('/', fetchAllPosts);

//ADMIN ARTWORKS
router.get('/:format', showArtworks);

router.get('/uploadArtwork/:format', artistAccessOnly, uploadArtworkPage).post('/uploadArtwork', uploadArtwork);

router.post('/auctionupload', artistAccessOnly, uploadInAuction);

router.get('/my-posts/:format?', artistAccessOnly, userPosts);

router.route('/edit/:id').get(editPost).put(updatePost);

router.delete('/delete/:id', artistAccessOnly, deletePost);

router.post('/search', searchArtwork);

module.exports = router;
