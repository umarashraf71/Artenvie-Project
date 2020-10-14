const mongoose = require('mongoose');
const { Schema } = mongoose;

const querySchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	email: {
		type: String,
		trim: true,
		required: true,
	},
	username: {
		type: String,
		trim: true,
	},
	subject: {
		type: String,
		trim: true,
		required: true,
	},
	query: {
		type: String,
		trim: true,
		required: true,
	},
	userType: {
		type: String,
		default: 'Visitor',
		required: true,
		trim: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('queries', querySchema);
