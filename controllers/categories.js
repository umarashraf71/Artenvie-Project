const Category = require('../models/Category');
const ErrorResponse = require('../helpers/errorResponse');

module.exports = {
	fetchAllcategories: async (req, res, next) => {
		try {
			const categories = await Category.find();
			res.render('admin/categories/index', {
				categories: categories,
				title: 'Categories'
			});
		} catch (error) {
			next(error);
		}
	},

	editCategory: async (req, res, next) => {
		try {
			const category = await Category.findById(req.params.id);
			res.render('admin/categories/edit', {
				category: category,
				title: 'Edit Category'
			});
		} catch (error) {
			next(
				new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
			);
		}
	},

	updateCategory: async (req, res, next) => {
		try {
			const category = await Category.findByIdAndUpdate(
				req.params.id,
				req.body,
				{
					new: true
				}
			);
			req.flash('success_msg', `${category.name} updated successfully.`);
			res.redirect('/admin/categories');
		} catch (error) {
			next(error);
		}
	},

	createCategory: async (req, res, next) => {
		try {
			const newCategory = await Category.create(req.body);
			req.flash('success_msg', `${newCategory.name} created successfully.`);
			res.redirect('/admin/categories');
		} catch (error) {
			next(error);
		}
	},

	deleteCategory: async (req, res, next) => {
		try {
			const category = await Category.findById(req.params.id);
			category.remove();
			req.flash('success_msg', `${category.name} removed successfully.`);
			res.redirect('/admin/categories');
		} catch (error) {
			next(
				new ErrorResponse(
					`Category with id ${req.params.id} couldn't be deleted.`,
					404
				)
			);
		}
	}
};
