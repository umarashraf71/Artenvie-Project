const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
const USER_DEFAULT_IMAGE = 'user.jpg';

const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'please add a name'],
		trim: true,
		match: [/^[a-zA-Z0-9]+([_\s\-]?[a-zA-Z0-9])*$/, 'Please add a valid Name'],
	},
	username: {
		type: String,
		required: [true, 'please add a username'],
		trim: true,
		match: [/^[a-zA-Z0-9]+([_\-]?[a-zA-Z0-9])*$/, 'Please add a valid username'],
	},
	googleId: {
		type: String,
		default: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
	},
	password: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: USER_DEFAULT_IMAGE,
	},
	roles: {
		type: [String],
		enum: ['admin', 'user'],
		default: 'user',
	},
	userType: {
		type: String,
	},
	online: {
		type: Boolean,
		default: false,
	},
	status: {
		type: String,
		default: 'Enabled',
	},
	wishlist: [
		{
			type: Schema.Types.ObjectId,
			ref: 'artworks',
		},
	],
	skills: {
		type: String,
		default: '',
		trim: true,
	},
	description: {
		type: String,
		default: '',
		trim: true,
	},
	languages: {
		type: String,
		trim: true,
		default: '',
	},
	location: {
		type: String,
		default: '',
		trim: true,
	},
	secretToken: {
		type: String,
	},
	active: {
		type: Boolean,
	},
	slug: {
		type: String,
		trim: true,
	},
	loginAttempts: {
		type: Number,
		default: 0,
	},
	blockTime: {
		type: Date,
		trim: true,
	},
	joinDate: {
		type: Date,
		default: Date.now(),
	},
	bids: [
		{
			type: Schema.Types.ObjectId,
			ref: 'artworks',
		},
	],
	credit: {
		type: Number,
		default: 0,
	},
	autofill: {
		type: Boolean,
		default: false,
	},
	warnings: {
		type: Array,
		default: [],
	},
});

userSchema.pre('save', function (next) {
	this.slug = slugify(this.username, { lower: true, replacement: '_' });
	next();
});

module.exports = mongoose.model('users', userSchema);
