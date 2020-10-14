const router = require('express').Router();
const { authenticateUser } = require('../../helpers/auth');
const {
	fetchAllcategories,
	editCategory,
	createCategory,
	deleteCategory,
	updateCategory
} = require('../../controllers/categories');

router.all('/*', authenticateUser, (req, res, next) => {
	req.app.set('layout', 'layouts/admin');
	next();
});

// read categories from database
router.get('/', fetchAllcategories);

// edit & update category
router
	.route('/edit/:id')
	.get(editCategory)
	.put(updateCategory);

// create category
router.post('/create', createCategory);

// delete category
router.delete('/delete/:id', deleteCategory);

module.exports = router;
