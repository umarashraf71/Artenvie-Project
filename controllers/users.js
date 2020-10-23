// NPM Modules
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Chat = require('../models/Chat');
const Review = require('../models/Review');
const Query = require('../models/Query');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const fs = require('fs');
const bcrypt = require('bcryptjs');
const randomString = require('randomstring');
const { Strategy } = require('passport-local');
const assert = require('assert');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Helper Functions
const { generateUsername } = require('../helpers/helpers');
const Category = require('../models/Category');
const sendEmail = require('../helpers/email');

module.exports = {
	signUp: async (req, res) => {
		try {
			let errors = [];
			let flag = false;
			let categories = [];
			categories = await Category.find();

			if (!req.body.name) {
				errors.push({
					message: 'Add fisrtName!',
				});
			}

			if (!req.body.email) {
				errors.push({
					message: 'Add an email!',
				});
			}

			if (!req.body.username) {
				errors.push({
					message: 'Add username!',
				});
			}

			await User.findOne({
				username: req.body.username,
			}).then((user) => {
				if (user != null) {
					errors.push({
						message: 'username already taken!',
					});

					flag = true;
				}
			});

			if (!req.body.password) {
				errors.push({
					message: 'Add password!',
				});
			}

			if (!req.body.confirmPassword) {
				errors.push({
					message: 'Add confirm Password!',
				});
			}

			if (req.body.password !== req.body.confirmPassword) {
				errors.push({
					message: "Passwords don't match!",
				});
			}

			if (errors.length > 0) {
				let userNames;

				if (flag) userNames = generateUsername(req.body.username);

				await res.render('home/signup', {
					errors: errors,
					name: req.body.name,
					email: req.body.email,
					userType: req.body.usertype,
					username: req.body.username,
					title: 'Register here',
					userNames,
					categories,
				});
			} else {
				const { name, email, username, password, usertype } = req.body;

				User.findOne({
					email: email,
				}).then((user) => {
					if (user) {
						errors.push({
							message: 'Email already exists. Please log in.',
						});
						res.render('home/signup', {
							errors: errors,
							name: name,
							username: username,
							email: email,
							userType: usertype,
							password: password,
							title: 'Register here',
							categories,
						});
					} else {
						const user = new User({
							name: name,
							username: username,
							email: email,
							userType: usertype,
							password: password,
						});

						bcrypt.genSalt(10, (err, salt) => {
							bcrypt.hash(user.password, salt, (err, hash) => {
								user.password = hash;
								const secretToken = randomString.generate();
								user.secretToken = secretToken;
								user.active = false;

								const html = `<div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
                <p style="margin-top:10px; margin-bottom:20px; margin-left:-10px; color:#dfbd24; font-size:80px;letter-spacing:1px;">Artenvie</p>

                <p style="color:white;  font-size:25px;" >
                Dear User ,<br>Thankyou for Registering!<br><br>Please verify your email by clicking the verify button below<br><br>
                <a style="background-color: #008CBA; 
                          border: none; border-radius:6px; 
                          color: white; padding: 12px 20px; 
                          text-align: center; font-size: 17px; 
                          cursor: pointer; text-decoration:none;" 
                          href="http://artenvie.herokuapp.com/home/user/verify/${secretToken}">Verify Email</a>
                <br>
                </p>
                </div>
                    `;

								sendEmail(process.env.EMAIL, req.body.email, 'Email Verification', html);

								user.save().then(async (savedUser) => {
									req.flash('success_msg', 'We have sent a confirmation link to your email. Please verify your email.');
									//   req.flash(
									//     'success_msg',
									//     "You're registered. Log in to continue."
									//   );
									res.redirect('/home/login');
								});
							});
						});
					}
				});
			}
		} catch (error) {
			console.log(error);
		}
	},

	googleSingUp: async (req, res) => {
		try {
			passport.use(
				new GoogleStrategy(
					{
						clientID: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
						callbackURL: '/auth/google/callback',
					},
					async (accessToken, refreshToken, profile, done) => {
						const newUser = {
							name: profile.displayName,
							username: profile.name.givenName,
							googleId: profile.id,
							email: 'gmail',
							password: randomString(8),
							image: profile.photos[0].value,
						};

						try {
							let user = await User.findOne({
								googleId: profile.id,
							});

							if (user) {
								done(null, user);
							} else {
								user = await User.create(newUser);
								done(null, user);
							}
						} catch (err) {
							console.error(err);
						}
					}
				)
			);

			passport.serializeUser((user, done) => {
				done(null, user.id);
			});

			passport.deserializeUser((id, done) => {
				User.findById(id, (err, user) => done(err, user));
			});
		} catch (error) {
			console.error(error);
		}
	},

	logIn: (req, res, next) => {
		try {
			if (!req.body.email || !req.body.password) {
				req.flash('error_msg', 'Please fill in all fields.');
				return res.redirect('/login');
			}

			// Authenticate new user
			passport.use(
				new Strategy(
					{
						usernameField: 'email',
					},
					(email, password, done) => {
						User.findOne(
							{
								email: email,
							},
							async (err, user) => {
								assert.strictEqual(null, err);

								if (!user) {
									return done(null, false, {
										message: 'User not found.',
									});
								}

								bcrypt.compare(password, user.password, async (err, matched) => {
									assert.strictEqual(null, err);

									if (user.blockTime && Math.floor((new Date().getTime() - user.blockTime) / 1000 < 300)) {
										return done(null, false, "You can't login for 5 minutes due to many failed login attempts.");
									}

									if (matched) {
										if (!user.active) {
											return done(null, false, {
												message: 'Sorry, you must confirm your email first',
											});
										}

										if (user.status == 'Disabled') {
											return done(null, false, {
												message: 'You are temporarily blocked due to some reason!',
											});
										}
										return done(null, user);
									} else {
										user.loginAttempts++;

										if (user.loginAttempts > 4) {
											user.blockTime = new Date().getTime();
											user.loginAttempts = 0;
										}

										await user.save();

										return done(null, false, {
											message: 'Incorrect password',
											user,
										});
									}
								});
							}
						);
					}
				)
			);

			passport.serializeUser((user, done) => {
				done(null, user.id);
			});

			passport.deserializeUser((id, done) => {
				User.findById(id, (err, user) => {
					done(err, user);
				});
			});

			passport.authenticate('local', {
				successRedirect: req.session.redirectLink || '/home',
				failureRedirect: '/home/login',
				failureFlash: true,
			})(req, res, next);
		} catch (error) {
			next(error);
		}
	},

	userProfile: (req, res) => {
		User.findOne({
			slug: req.params.slug,
		})
			.then((user) => {
				let categories = [];
				categories = Category.find();

				if (user)
					res.render('home/userprofile', {
						title: user.name + ' - Profile Page',
						bidUser: user,
						categories,
					});
			})
			.catch((err) => console.log(err));
	},
	artistProfile: async (req, res, next) => {
		try {
			const user = await User.findOne({
				slug: req.params.slug,
			});
			let categories = [];
			categories = await Category.find();

			if (user) {
				const artworks = await Artwork.find({
					user: user,
					status: 'Enabled',
					$or: [
						{
							buyingFormat: 'General',
						},
						{
							buyingFormat: 'Discount',
						},
						{
							buyingFormat: 'Special Offer',
						},
					],
				})
					.limit(3)
					.sort({
						date: -1,
					});

				const reviews = await Review.find({
					artistName: user.username,
				});

				res.render('home/artist-profile', {
					title: user.name + `'s - Profile Page`,
					artist: user,
					reviews,
					artworks,
					categories,
				});
			}
		} catch (error) {
			next(error);
		}
	},

	artistArtworks: async (req, res, next) => {
		const perPage = 6;
		const page = req.params.page || 1;

		let categories = [];
		categories = await Category.find();

		const posts = await Artwork.find({
			artist: req.params.artist,
			status: 'Enabled',
		})
			.populate('user')
			.skip(perPage * page - perPage)
			.limit(perPage)
			.sort({
				date: -1,
			});

		res.render('home/artistArtworks', {
			title: 'Artist Artworks',
			categories,
			posts,
			current: page,
			pages: Math.ceil(posts.length / perPage),
		});
	},

	showAccountInfo: (req, res) => {
		res.render('admin/users/account', {
			title: 'Account Info',
		});
	},
	accountEditPage: (req, res) => {
		res.render('admin/users/edit', {
			title: 'Edit Account Info',
		});
	},
	updateAccountInfo: async (req, res, next) => {
		try {
			const { firstName, email, skills, languages, description, location } = req.body;
			const user = await User.findById(req.user.id);

			user.name = firstName;
			user.email = email;

			if (req.user.userType == 'Artist') {
				user.skills = skills;
				user.languages = languages;
				user.description = description;
				user.location = location;
			}

			if (req.files) {
				if (user.image != 'user.jpg' && fs.existsSync(`./public/uploads/user/${user.image}`)) {
					fs.unlink(`./public/uploads/users/${user.image}`, (err) => {
						if (err) throw err;
					});
				}

				let file = req.files.file;
				user.image = file.name;

				file.mv('./public/uploads/users/' + file.name, (err) => {
					if (err) throw err;
				});
			}

			await user.save();

			req.flash('success_msg', 'Account info updated successfully.');
			res.redirect('/admin/users/account');
		} catch (error) {
			next(error);
		}
	},
	changePasswordPage: (req, res) => {
		res.render('admin/users/changePassword', {
			title: 'Change Password',
		});
	},
	matchCurrentPassword: async (req, res, next) => {
		try {
			if (!req.body.password) {
				req.flash('error_msg', 'Please fill in the required filed.');
				return res.redirect('/admin/users/account/password');
			}

			const user = await User.findById(req.user.id);
			const matched = await bcrypt.compare(req.body.password, user.password);

			if (matched)
				res.render('admin/users/userPassword', {
					title: 'New Password',
				});
			else {
				req.flash('error_msg', 'Invalid password!.');
				res.redirect('/admin/users/account/password');
			}
		} catch (error) {
			next(error);
		}
	},
	updatePassword: (req, res) => {
		User.findOne({
			_id: req.params.id,
		}).then((user) => {
			let errors = [];
			if (!req.body.password || !req.body.confirmPassword) {
				errors.push({
					message: 'please fill in all fields',
				});
			}

			if (req.body.password !== req.body.confirmPassword) {
				errors.push({
					message: "passwords don't match.",
				});
			}

			if (errors.length > 0) {
				res.render('admin/users/userPassword', {
					title: 'New Password',
					errors: errors,
				});
			} else {
				User.findOne({
					_id: req.params.id,
				}).then((user) => {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(req.body.password, salt, (err, hash) => {
							user.password = hash;
							user.save().then((savedUser) => {
								req.flash('success_msg', 'Your password has been changed succesfully.');

								res.redirect('/admin/users/account');
							});
						});
					});
				});
			}
		});
	},

	wishlist: async (req, res, next) => {
		try {
			const user = await User.findById(req.user.id).populate('wishlist');

			res.render('admin/users/wishlist', {
				title: user.name + `'s Wishlist`,
				posts: user.wishlist,
			});
		} catch (error) {
			next(error);
		}
	},

	userInbox: (req, res, next) => {
		User.findById(req.params.id).then((user) => {
			res.render('admin/users/inbox', {
				title: 'Inbox',
				chats: user.chat,
			});
		});
	},

	verifyUser: async (req, res, next) => {
		try {
			const secretToken = req.params.token;

			const user = await User.findOne({
				secretToken,
			});

			if (!user) {
				req.flash('error_msg', 'User not found');
				res.redirect('/home/user/verify/' + secretToken);
				return;
			}

			user.active = true;
			user.secretToken = '';
			await user.save();

			req.flash('success_msg', 'Thank you! Now you may login.');
			res.redirect('/home/login');
		} catch (error) {
			next(error);
		}
	},

	forgotPasswordPage: async (req, res, next) => {
		let categories = [];
		categories = await Category.find();

		res.render('admin/users/forgotPassword', {
			title: 'Forgot Password',
			categories,
		});
	},
	forgotPassword: async (req, res, next) => {
		try {
			let categories = [];
			categories = await Category.find();
			const secretToken = Math.floor(Math.random() * 9999999);

			const user = await User.findOne({
				email: req.body.email,
			});
			user.secretToken = secretToken;

			const html = `
				    <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        			<p style="margin-top:10px; margin-bottom:20px; 
                	margin-left:-10px; color:#dfbd24; 
                  	font-size:80px;letter-spacing:1px;">
          			Artenvie
      			  </p>

				<p style="color:white;  font-size:25px;" >
				Dear User ,<br>Please write the following code to reset your password<br><br>
				Password Reset Code : ${secretToken} 
				</p>
			    </div> `;

			sendEmail(process.env.EMAIL, req.body.email, 'Password Reset', html);

			await user.save();

			res.render('admin/users/passwordCode', {
				title: 'Password Reset Code',
				email: req.body.email,
				categories,
			});
		} catch (error) {
			next(error);
		}
	},
	verifyUserResetCode: async (req, res, next) => {
		try {
			let categories = [];
			categories = await Category.find();

			const { token, email } = req.body;
			const user = await User.findOne({
				secretToken: token,
			});

			if (!user) {
				/* req.flash('error_msg', 'User not found with entered email.');
				res.redirect('/home/user/forgotPassword');
				return; */

				console.log('not matched');

				res.render('admin/users/passwordCode', {
					title: 'Password Reset Code',
					email,
					token,
					errors: [
						{
							message: "Code didn't match! enter again.",
						},
					],
					categories,
				});
			} else {
				user.secretToken = '';
				await user.save();

				res.render('admin/users/newPassword', {
					title: 'New Password',
					id: user.id,
					categories,
				});
			}
		} catch (error) {
			next(error);
		}
	},
	resetPassword: async (req, res, next) => {
		let categories = [];
		categories = await Category.find();

		User.findById(req.params.id).then((user) => {
			let errors = [];
			if (!req.body.password || !req.body.confirmPassword) {
				errors.push({
					message: 'please fill in all fields',
				});
			}

			if (req.body.password !== req.body.confirmPassword) {
				errors.push({
					message: "passwords don't match.",
				});
			}

			if (errors.length > 0) {
				res.render('admin/users/newPassword', {
					title: 'New Password',
					errors,
					user,
					categories,
				});
			} else {
				User.findById(req.params.id).then((user) => {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(req.body.password, salt, (err, hash) => {
							user.password = hash;
							user.save().then((savedUser) => {
								req.flash('success_msg', 'Your password has been reset succesfully. Log in to continue');

								res.redirect('/home/login');
							});
						});
					});
				});
			}
		});
	},

	addToWishlist: async (req, res, next) => {
		User.findById(req.user.id)
			.then(async (user) => {
				const wishlist = user.wishlist;
				const slug = req.params.slug;

				const artwork = await Artwork.findById(slug);

				if (wishlist.includes(slug)) {
					wishlist.splice(wishlist.indexOf(slug), 1);
					req.flash('success_msg', 'Item removed from your wishlist.');
				} else {
					wishlist.push(slug);
					req.flash('success_msg', 'Item added to your wishlist.');
				}

				user.save((savedUser) => {
					if (req.originalUrl.includes('home')) {
						res.redirect('/home/productpage/' + artwork.slug);
					} else res.redirect('/admin/users/wishlist/' + req.user.id);
				});
			})
			.catch((err) => console.log(err));
	},

	placeBid: async (req, res, next) => {
		try {
			const post = await Artwork.findById(req.params.id);

			if (+req.body.bid_amount <= post.price || +req.body.bid_amount <= post.bidInfo.amount) {
				req.flash('error_msg', 'Please enter higher Bid Amount.');
				return res.redirect('/home/biddingroom/placebid/' + post.id);
			}

			post.bidInfo = {
				amount: req.body.bid_amount,
				status: 'In Auction',
				bidder: req.user.username,
			};

			const user = await User.findById(req.user.id);
			if (!user.bids.includes(post.id.toString())) {
				user.bids.push(post);
			}

			await user.save();
			await post.save();

			req.flash('success_msg', 'Your bid on artwork has been placed');

			res.redirect('/home/biddingroom/placebid/' + post.id);
		} catch (error) {
			next(error);
		}
	},
	removeBid: async (req, res, next) => {
		try {
			let user = {};
			if (req.params.user == 'bidder') {
				user = await User.findById(req.user.id);
				user.bids.splice(user.bids.indexOf(req.params.id.toString()), 1);
				await user.save();
			} else if (req.params.user == 'owner') {
				await Artwork.deleteOne({
					_id: req.params.id,
				});
			}

			req.flash('success_msg', 'Bid removed successfully.');
			res.redirect('/admin/users/auctions');
		} catch (error) {
			next(error);
		}
	},

	customerReview: async (req, res, next) => {
		try {
			const review = new Review({
				review: req.body.review,
				rating: req.body.rating,
				customerName: req.user.username,
				artistName: req.params.artistName,
				customerImage: req.user.image,
			});

			await review.save();

			const artist = await User.findOne({
				username: req.params.artistName,
			});

			sendEmail(
				process.env.EMAIL,
				artist.email,
				`Customer Feedback`,
				`
        	<div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
       		<p style="margin-top:10px; margin-bottom:20px; 
            margin-left:-10px; color:#dfbd24; 
            font-size:80px;letter-spacing:1px;">
          	Artenvie
       		</p>

			<p style="color:white;  font-size:25px;" >
			Dear User ${artist.username},<br>The 
			customer ${req.user.username} has given you 
			feedback on your order completion. Go and check 
			your customer feedback <br>
			</p>
        </div> 
		<h1 style="color:green;"> .
		</h1>`
			);

			req.flash('success_msg', 'Review placed succesfully.');
			res.redirect('/admin/');
		} catch (error) {
			next(error);
		}
	},

	auctionArtworks: async (req, res, next) => {
		try {
			const user = await User.findById(req.user.id).populate('bids');

			res.render('admin/users/auctions', {
				title: 'Auction Artworks',
				artworks: user.bids,
			});
		} catch (error) {
			next(error);
		}
	},

	postComment: async (req, res, next) => {
		try {
			const artwork = await Artwork.findOne({
				slug: req.params.slug,
			}).populate({
				path: 'comments',
				populate: {
					path: 'user',
					model: 'users',
				},
			});

			const comment = new Comment({
				user: req.user.id,
				username: req.user.username,
				image: req.user.image,
				body: req.body.body,
				artwork: artwork._id,
			});

			artwork.comments.push(comment);

			await artwork.save();
			await comment.save();

			req.flash('success_msg', 'Your comment will be approved by admin before posting. Thanks');
			res.redirect('/home/productpage/' + req.params.slug);
		} catch (error) {
			next(error);
		}
	},

	showArtistReviews: async (req, res, next) => {
		try {
			const reviews = await Review.find({
				artistName: req.user.username,
			});

			res.render('admin/users/artist-reviews', {
				title: 'Rating & reviews',
				reviews,
			});
		} catch (error) {
			next(error);
		}
	},

	contactAdminPage: (req, res) => {
		res.render('admin/users/contact-admin', {
			title: 'Contact Admin',
			username: req.user.username,
			userId: req.user.id,
		});
	},
	contactAdmin: async (req, res, next) => {
		try {
			const { name, email, subject, query } = req.body;
			const newQuery = new Query();
			const n = new Notification();

			n.text = query;
			n.date = new Date();
			n.username = 'admin';

			newQuery.query = query;
			newQuery.subject = subject;

			if (req.user) {
				newQuery.name = req.user.name;
				newQuery.username = req.user.username;
				newQuery.email = req.user.email;
				newQuery.userType = req.user.userType;
				n.sender = req.user.username;
			} else {
				newQuery.name = name;
				newQuery.email = email;
				r.sender = name;
			}

			await n.save();
			await newQuery.save();

			req.flash('success_msg', 'Your message has been sent to the admin. Thanks');
			res.redirect('/admin/users/contactAdmin');
		} catch (error) {
			next(error);
		}
	},

	adminWarnings: (req, res) => {
		res.render('admin/users/admin-warning', {
			title: 'Admin Warnings',
		});
	},

	userComments: (req, res) => {
		res.render('admin/users/comments', {
			title: 'User Comments',
		});
	},

	readNotification: async (req, res, next) => {
		try {
			const n = await Notification.findById(req.params.id);
			let url = '';
			url = req.params.url == 'Admin' ? '/admin/users/adminWarnings' : `/admin/inbox/chat/${n.roomId}/${n.username}`;

			if (req.user.roles.includes(n.username)) {
				url = '/admin/Queries';
			}

			n.status = true;
			await n.save();

			res.redirect(url);
		} catch (error) {
			next(error);
		}
	},

	markAllAsReadNotification: async (req, res, next) => {
		try {
			await Notification.updateMany(
				{ username: req.user.username },
				{
					$set: {
						status: true,
					},
				}
			);

			res.redirect('/admin');
		} catch (error) {
			next(error);
		}
	},
};
