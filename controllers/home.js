const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Query = require('../models/Query');
const sendEmail = require('../helpers/email');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const asyncHandler = require('../middlewares/async');

module.exports = {
	showHomePage: asyncHandler(async (req, res, next) => {
		let artworks = [],
			categories = [];

		if (mongoose.connection._readyState == 1) {
			artworks = await Artwork.find().sort({ date: -1 }).limit(3);
			categories = await Category.find();
		}

		res.render('home/index', {
			title: 'Home Page',
			artworks,
			categories,
		});
	}),

	showArtists: asyncHandler(async (req, res, next) => {
		try {
			const perPage = 6;
			const page = req.params.page || 1;
			let categories = [];

			categories = await Category.find();

			const artists = await User.find({ userType: 'Artist', status: 'Enabled' })
				.skip(perPage * page - perPage)
				.limit(perPage)
				.sort({ name: 1 });

			res.render('home/artists', {
				artists: artists,
				title: 'Our Artists',
				current: parseInt(page),
				pages: Math.ceil(artists.length / perPage),
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	showBiddingRoom: asyncHandler(async (req, res, next) => {
		try {
			const posts = await Artwork.find({ buyingFormat: 'Auction' });
			let categories = [];
			categories = await Category.find();

			res.render('home/auction-room', {
				title: 'Auction Room',
				posts,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	placeBidPage: asyncHandler(async (req, res, next) => {
		try {
			const artwork = await Artwork.findById(req.params.id).populate('user');
			const currentDate = new Date().getTime();
			const endDate = new Date(artwork.endDate).getTime();
			const startDate = new Date(artwork.startDate).getTime();
			let categories = [];
			categories = await Category.find();

			if (artwork.auctionStatus) {
				if (currentDate > endDate) {
					if (Object.keys(artwork.bidInfo).length == 0) {
						artwork.bidInfo = {
							amount: 0,
							status: 'Auction Ended',
							bidder: '',
						};

						artwork.auctionStatus = false;
						await artwork.save();

						sendEmail(
							process.env.EMAIL,
							artwork.user.email,
							'Auction Ended',
							`
              <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
                <p style="margin-top:10px; margin-bottom:20px; 
                          margin-left:-10px; color:#dfbd24; 
                          font-size:80px;letter-spacing:1px;">
                  Artenvie
                </p>

                <p style="color:white;  font-size:25px;" >
                Dear User ${artwork.user.username},<br>Your artwork with title ${artwork.title} that was placed in auction ended up with no bids. You can remove it from your dashboard or can post it again<br>
                </p>

              </div> `
						);
					} else {
						const { amount, status, bidder } = artwork.bidInfo;
						artwork.bidInfo = {
							amount,
							status: 'Auction Ended',
							bidder,
						};

						artwork.auctionStatus = false;
						await artwork.save();

						const customer = await User.findOne({
							username: artwork.bidInfo.bidder,
						});

						sendEmail(
							process.env.EMAIL,
							artwork.user.email,
							'Auction Ended',
							`
              <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
                <p style="margin-top:10px; margin-bottom:20px; 
                          margin-left:-10px; color:#dfbd24; 
                          font-size:80px;letter-spacing:1px;">
                  Artenvie
                </p>

                <p style="color:white;  font-size:25px;" >
                Dear User ${artwork.user.username},<br>Your artwork 
                named as ${artwork.title} in auction is ended with the 
                last highest bidder named as ${customer.username} <br>
                </p>

              </div> `
						);

						sendEmail(
							process.env.EMAIL,
							customer.email,
							'Auction Ended',
							`
              <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
                <p style="margin-top:10px; margin-bottom:20px; 
                          margin-left:-10px; color:#dfbd24; 
                          font-size:80px;letter-spacing:1px;">
                  Artenvie
                </p>

                <p style="color:white;  font-size:25px;" >
                  Dear User ${customer.username},<br>You are the last 
                  highest bidder of the artwork in auction named as 
                  ${artwork.title} with artist named as ${artwork.user.username}. 
                  Kindly login to Artenvie and place order on this artwork. <br>
                </p>

              </div> `
						);
					}
				}
			}

			res.render('home/painting-bid-page', {
				title: 'Bidding Page',
				post: artwork,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	showProductInfo: asyncHandler(async (req, res, next) => {
		try {
			const artwork = await Artwork.findOne({ slug: req.params.slug }).populate('comments');
			artwork.views++;
			await artwork.save();

			let categories = [];
			categories = await Category.find();

			req.session.redirectLink = req.originalUrl;

			const artworks = await Artwork.find({
				buyingFormat: artwork.buyingFormat,
				status: 'Enabled',
			})
				.limit(3)
				.sort({ date: -1 });

			res.render('home/product', {
				title: artwork.title || 'Artwork Info',
				post: artwork,
				artworks: artworks,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	aboutUs: async (req, res) => {
		let categories = [];
		categories = await Category.find();

		res.render('home/about', {
			title: 'About Us',
			categories,
		});
	},

	contactUs: async (req, res) => {
		let categories = [];
		categories = await Category.find();

		res.render('home/contact', {
			title: 'Contact Us',
			categories,
		});
	},

	queries: asyncHandler(async (req, res, next) => {
		try {
			const { name, email, subject, query } = req.body;
			const newQuery = new Query();

			newQuery.query = query;
			newQuery.subject = subject;

			if (req.user) {
				newQuery.name = req.user.name;
				newQuery.username = req.user.username;
				newQuery.email = req.user.email;
				newQuery.userType = req.user.userType;
			} else {
				newQuery.name = name;
				newQuery.email = email;
			}

			await newQuery.save();

			req.flash('success_msg', 'Your message has been sent to the admin. Thanks');
			res.redirect('/home/contact');
		} catch (error) {
			next(error);
		}
	}),

	signUpPage: async (req, res) => {
		let categories = [];
		categories = await Category.find();

		res.render('home/signup', {
			title: 'Register here',
			categories,
		});
	},

	logInPage: async (req, res) => {
		let categories = [];
		categories = await Category.find();

		res.render('home/login', {
			title: 'Log in',
			categories,
		});
	},

	logOut: asyncHandler(async (req, res) => {
		try {
			//req.user = null;
			//req.session = null;
			req.session.cart = undefined;
			res.locals.session = undefined;
			res.locals.user = undefined;
			req.session.artist = undefined;
			delete req.session.redirectLink;

			await req.logout();
			res.redirect('/home/login');
		} catch (error) {
			console.log(error);
		}
	}),

	showGalleryArtworks: asyncHandler(async (req, res, next) => {
		try {
			const perPage = 9;
			const page = req.params.page || 1;
			let categories = [];
			categories = await Category.find();

			const category = req.params.category ? { category: req.params.category, status: 'Enabled' } : {};
			let postsCount = 0;

			const posts = await Artwork.find(category)
				.populate('user')
				.skip(perPage * page - perPage)
				.limit(perPage)
				.sort({ date: -1 });

			const artworks = await Artwork.find(category);

			postsCount = Object.keys(category).length == 0 ? await Artwork.countDocuments() : artworks.length;

			let flag = req.originalUrl.includes(req.params.category) ? true : false;

			res.render('home/categories', {
				title: 'Art Gallery',
				posts,
				current: page,
				pages: Math.ceil(postsCount / perPage),
				flag,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	roomArtworks: asyncHandler(async (req, res, next) => {
		try {
			const perPage = 9;
			const page = req.params.page || 1;
			let format = { buyingFormat: req.params.room, status: 'Enabled' };

			let categories = [];
			categories = await Category.find();

			const posts = await Artwork.find(format)
				.populate('user')
				.skip(perPage * page - perPage)
				.limit(perPage)
				.sort({ date: -1 });

			const postsCount = await Artwork.find(format);

			res.render('home/room', {
				title: format.buyingFormat + ' Room',
				posts,
				current: page,
				pages: Math.ceil(postsCount.length / perPage),
				buyingFormat: req.params.room,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),

	searchData: asyncHandler(async (req, res) => {
		const seachString = req.body.search;
		const re = new RegExp(seachString, 'gi');
		const perPage = 6;
		const page = req.params.page || 1;
		let categories = [];
		categories = await Category.find();

		if (req.params.query == 'artworks') {
			const posts = await Artwork.find({
				status: 'Enabled',
				$or: [{ artist: re }, { title: re }, { category: re }, { buyingFormat: re }],
			})
				.populate('user')
				.skip(perPage * page - perPage)
				.limit(perPage);

			const postsCount = await Artwork.find({
				status: 'Enabled',
				$or: [{ artist: re }, { title: re }, { category: re }, { buyingFormat: re }],
			});

			res.render('home/categories/index', {
				title: 'Search Results - Gallery',
				posts,
				current: page,
				pages: Math.ceil(postsCount.length / perPage),
				flag: true,
				categories,
			});
		} else {
			const artists = await User.find({
				status: 'Enabled',
				$and: [{ $or: [{ name: re }, { username: re }] }, { $or: [{ userType: 'Artist' }] }],
			})
				.skip(perPage * page - perPage)
				.limit(perPage);

			const artistsCount = await User.find({
				status: 'Enabled',
				$and: [{ $or: [{ name: re }, { username: re }] }, { $or: [{ userType: 'Artist' }] }],
			});

			res.render('home/artists', {
				title: 'Search Results - Artists',
				artists,
				current: page,
				pages: Math.ceil(artistsCount.length / perPage),
				categories,
			});
		}
	}),

	filterByPrice: asyncHandler(async (req, res, next) => {
		try {
			const perPage = 9;
			const page = req.params.page || 1;
			const { minimum, maximum } = req.body;
			let categories = [];
			categories = await Category.find();

			const artworks = await Artwork.find({
				status: 'Enabled',
				$and: [
					{
						price: {
							$gte: minimum,
						},
					},
					{
						price: {
							$lte: maximum,
						},
					},
				],
			})
				.populate('user')
				.skip(perPage * page - perPage)
				.limit(perPage);

			const artworkCount = await Artwork.find({
				status: 'Enabled',
				$and: [
					{
						price: {
							$gte: minimum,
						},
					},
					{
						price: {
							$lte: maximum,
						},
					},
				],
			});

			res.render('home/categories/index', {
				title: 'Search results',
				posts: artworks,
				current: page,
				pages: Math.ceil(artworkCount.length / perPage),
				flag: false,
				categories,
			});
		} catch (error) {
			next(error);
		}
	}),
};
