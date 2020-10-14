const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
	text: {
		type: String,
		required: true,
		trim: true,
	},
	status: {
		type: Boolean,
		default: false,
	},
	date: {
		type: Date,
	},
	username: {
		type: String,
		trim: true,
		required: true,
	},
	sender: {
		type: String,
		trim: true,
	},
	roomId: {
		type: String,
		trim: true,
	},
});

module.exports = mongoose.model('notifications', notificationSchema);
