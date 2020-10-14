const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
	orderID: {
		type: Number,
		required: true,
	},
	customerId: {
		type: String,
		required: true,
	},
	customer: {
		type: String,
		trim: true,
	},
	artist: {
		type: String,
		trim: true,
	},
	cart: {
		type: Object,
		required: true,
	},
	firstName: {
		type: String,
		required: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
	},
	phoneNo: {
		type: String,
		required: true,
		trim: true,
	},
	address: {
		type: String,
		required: true,
		trim: true,
	},
	paymentMethod: {
		type: String,
		required: true,
		trim: true,
	},
	notes: {
		type: String,
		default: '',
		trim: true,
	},
	status: {
		type: String,
		trim: true,
		default: 'In Progress',
	},
	date: {
		type: Date,
		default: Date.now,
	},
	reason: {
		type: String,
		default: '',
		trim: true,
	},
});

module.exports = mongoose.model('orders', orderSchema);
