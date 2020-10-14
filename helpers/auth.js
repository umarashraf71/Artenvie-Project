module.exports = {
	authenticateUser: (req, res, next) => {
		if (req.isAuthenticated()) return next();

		req.session.redirectLink = req.originalUrl;
		res.redirect('/home/login');
	},

	adminAccessOnly: (req, res, next) => {
		if (req.user.roles.includes('admin')) {
			return next();
		}

		res.redirect('/admin');
	},

	artistAccessOnly: (req, res, next) => {
		if (req.user.userType === 'Artist') {
			return next();
		}

		res.redirect('/admin');
	},
};
