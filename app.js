// Application Modules
const express = require('express');
const colors = require('colors');
const ejs = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
//const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require('dotenv');
//const mongoose = require('mongoose');
const dbConnection = require('./config/db');
const errorHandler = require('./middlewares/error');
const expressMongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

module.exports.getIO = function () {
	return io;
};

// helper functions
const { generateDate, selectValue, datesDifference, paginate, bidDuration } = require('./helpers/helpers');

// Routes
const landingPage = require('./routes/home/index');
const home = require('./routes/home/home');
const admin = require('./routes/admin/index');
const users = require('./routes/admin/users');
const orders = require('./routes/order/order');
const posts = require('./routes/admin/post');
const categories = require('./routes/admin/category');
const inbox = require('./routes/admin/inbox');
const Category = require('./models/Category');

// provides form data
app.use(express.json()).use(express.urlencoded({ extended: false }));

// Load dotenv vars
dotenv.config({ path: './config/config.env' });

require('./config/passport')(passport);

// DB connection
dbConnection();

app.use(express.static(path.join(__dirname, 'public')));

app.use(ejs);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/front');

// provides uploaded files of the users
app.use(fileUpload());

// Sanitize Input date
app.use(expressMongoSanitize());

// set security headers
app.use(helmet());

// prevent cross-site scripting attacks
app.use(xss());

// rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10minutes
	max: 100,
	skipFailedRequests: true,
});

app.use(limiter);

// HTTP params pollution
app.use(hpp());

// resolves cross origin problems
app.use(cors());

// show Error messages to users
app.use(flash());

// site cookies
app.use(cookieParser());

// stores and provides session values
app.use(
	session({
		secret: 'zee421',
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 120 * 60 * 1000, // session expires after 120 minutes
		},
		/* 	store: new MongoStore({
			mongooseConnection: mongoose.connection,
		}),
		 */
	})
);

// User Authentication
app.use(passport.initialize()).use(passport.session());

// overrides the defined form method
app.use(methodOverride('_method'));

// middlware to store variables gloabally
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');

	res.locals.route = req.url;
	res.locals.session = req.session;

	res.locals.generateDate = generateDate;
	res.locals.selected = selectValue;
	res.locals.timer = bidDuration;
	res.locals.bidStatus = datesDifference;
	res.locals.paginate = paginate;

	res.locals.user = undefined;
	if (req.user) {
		res.locals.user = req.user;
	} else res.locals.user = undefined;

	next();
});

// Routes for application
app
	.use('/', landingPage)
	.use('/home', home)
	.use('/home/user', require('./routes/user/user'))
	.use('/home/order', orders)
	.use('/admin', admin)
	.use('/admin/users', users)
	.use('/admin/posts', posts)
	.use('/admin/categories', categories)
	.use('/admin/inbox', inbox);

// custome middleware to handle errors
app.use(errorHandler);

process.on('unhandledRejection', err => {
	console.log(err);
	process.exit(1);
});

// app running on local port
server.listen(port, () => {
	console.log(`Server is running on port ${port}`.black.bgWhite.bold);
});
