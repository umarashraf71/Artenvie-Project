const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	review: {
		type: String,
		required: true,
		trim: true,
	},
	rating: {
		type: Number,
		required: true,
	},
	customerName: {
		type: String,
		required: true,
		trim: true,
	},
	artistName: {
		type: String,
		required: true,
		trim: true,
	},
	customerImage: {
		type: String,
		required: true,
		trim: true,
	},
});

module.exports = mongoose.model('Review', reviewSchema);
