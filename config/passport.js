const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const randomString = require('randomstring');

module.exports = (passport) => {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: '/home/user/auth/google/callback',
			},
			async (accessToken, refreshToken, profile, done) => {
				const newUser = {
					name: profile.displayName,
					username: profile.name.givenName,
					googleId: profile.id,
					email: 'email@gmail.com',
					password: randomString.generate(8),
					image: profile.photos[0].value,
				};

				try {
					let user = await User.findOne({ googleId: profile.id });

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
};
