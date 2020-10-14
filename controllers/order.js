const Artwork = require('../models/Artwork');
const Cart = require('./cart');
const Order = require('../models/Order');
const Category = require('../models/Category');
const User = require('../models/User');
const sendEmail = require('../helpers/email');

module.exports = {
  addToCart: async (req, res, next) => {
    try {
      const artwork = await Artwork.findById(req.params.id);
      let cart = new Cart(req.session.cart ? req.session.cart : { items: {} });

      req.session.cart = cart;
      req.session.artist = req.session.artist || artwork.artist;

      if (req.session.cart && req.session.artist == artwork.artist) {
        cart.add(artwork, artwork.id);
        req.session.cart = cart;

        req.flash(
          'success_msg',
          'Your item has been added to the cart. keep shopping.'
        );
        res.redirect('/home/productpage/' + artwork.slug);
      } else {
        req.flash(
          'error_msg',
          `One order can only contain artworks of one artist( ${req.session.artist} ).`
        );
        res.redirect('/home/productpage/' + artwork.slug);
      }
    } catch (error) {
      next(error);
    }
  },

  removeFromCart: async (req, res, next) => {
    try {
      Artwork.findById(req.params.id).then((artwork) => {
        const cart = new Cart(
          req.session.cart ? req.session.cart : { items: {} }
        );

        cart.remove(artwork.id, true);
        req.session.cart = cart;
        req.session.artist = undefined;

        if (req.params.url == 'cart')
          return res.redirect('/home/order/shoppingcart');
        else {
          req.flash('success_msg', 'Item has been removed from the cart.');
          res.redirect(`/home/productpage/${artwork.slug}`);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  manageCartItems: async (req, res, next) => {
    let cart = new Cart(req.session.cart ? req.session.cart : { items: {} });

    Artwork.findById(req.params.id, (err, artwork) => {
      if (err) throw err;

      if (req.params.quantity == 'more') cart.add(artwork, artwork.id);
      else {
        cart.remove(artwork.id);
      }

      req.session.cart = cart;
      res.redirect('/home/order/shoppingcart');
    });
  },

  shoppingCart: async (req, res, next) => {
    try {
      let categories = [];
      categories = await Category.find();

      res.render('home/cart', {
        title: 'Shopping Cart',
        categories,
      });
    } catch (error) {
      return next(error);
    }
  },

  showOrderInfo: async (req, res, next) => {
    try {
      let categories = [];
      categories = await Category.find();

      if (req.params.id) {
        const artwork = await Artwork.findById(req.params.id);
        let cart = new Cart({ items: {} });

        cart.add(artwork, artwork.id);
        req.session.cart = cart;
        req.session.artist = artwork.artist;
      }

      let order = [];
      if (req.user.autofill) {
        order = await Order.findOne({ customer: req.user.username });
      }

      res.render('home/checkout', {
        title: 'Checkout Here',
        order,
        categories,
      });
    } catch (error) {
      next(error);
    }
  },

  placeOrder: async (req, res, next) => {
    try {
      let categories = [];
      categories = await Category.find();

      const {
        firstName,
        lastName,
        email,
        phoneNo,
        address,
        paymentMethod,
        notes,
        autofill,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNo ||
        !address ||
        !paymentMethod
      ) {
        req.flash('error_msg', 'Please fill in all required fields.');
        return res.redirect('/home/order/placeorder');
      }

      const keys = Object.keys(req.session.cart.items);
      const item = req.session.cart.items[keys[0]].item;

      if (
        item.buyingFormat == 'Auction' &&
        item.bidInfo.status == 'Auction Ended'
      ) {
        const artwork = await Artwork.findById(item._id);
        const { amount, status, bidder } = artwork.bidInfo;
        artwork.bidInfo = {
          amount,
          status: 'Sold',
          bidder,
        };

        await artwork.save();
      }

      const order = new Order({
        orderID: Math.floor(Math.random() * 9999999),
        customer: req.user.username,
        customerId: req.user.id,
        artist: req.session.artist,
        cart: req.session.cart,
        firstName,
        lastName,
        email,
        phoneNo,
        address,
        paymentMethod,
        notes,
      });

      const artist = await User.findOne({ username: order.artist });

      if (autofill) {
        const user = await User.findById(req.user.id);
        user.autofill = autofill == 'on' ? true : false;
        await user.save();
      }

      await order.save();
      req.session.order = order;

      if (paymentMethod == 'cash') {
        sendEmail(
          process.env.EMAIL,
          artist.email,
          `Order Placed`,
          `
        	<div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        	<p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          	Artenvie
        	</p>

       		 <p style="color:white;  font-size:25px;" >
        	  Dear User ${artist.username} ,<br> An order 
          	with order no ${order.orderID} has been placed on your artwork/s. 
          	You can check it from orders in your dashboard.<br>
       	 	</p>
        </div> `
        );
        req.session.cart = req.session.order = req.session.artist = undefined;

        res.render('home/invoice', {
          title: 'Order Invoice',
          order: order,
          categories,
        });
      } else if (paymentMethod == 'online') {
        res.render('home/payment', {
          title: 'Payment Here',
          order: order,
          categories,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  payCharges: async (req, res, next) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const amount = req.session.cart.totalPrice || 0;

      let categories = [];
      categories = await Category.find();

      const customer = await stripe.customers.create({
          email: req.body.stripeEmail,
          source: req.body.stripeToken,
        }),
        charge = await stripe.charges.create({
          amount: amount * 100,
          description: 'ArtEnvie Order System',
          currency: 'usd',
          customer: customer.id,
        });

      const order = req.session.order;
      const artist = await User.findOne({ username: order.artist });

      sendEmail(
        process.env.EMAIL,
        artist.email,
        `Order Placed`,
        `
        	<div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        	<p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
       	  	Artenvie
       		</p>

       		<p style="color:white;  font-size:25px;" >
          	Dear User ${req.user.username} ,<br> An order 
          	with order no ${order.orderID} has been placed on your artwork/s. 
          	You can check it from orders in your dashboard.<br>
        	</p>
        	</div>`
      );

      req.session.cart = req.session.order = req.session.artist = undefined;

      await res.render('home/invoice', {
        title: 'Order Invoice',
        order: order,
        customerID: charge.id,
        categories,
      });
    } catch (error) {
      return next(error);
    }
  },

  cart: async (req, res, next) => {
    try {
      req.session.redirectLink = req.originalUrl;

      if (req.user !== undefined) {
        const artwork = await Artwork.findById(req.params.id);
        let cart = new Cart(
          req.session.cart ? req.session.cart : { items: {} }
        );

        req.session.cart = cart;
        req.session.artist = req.session.artist || artwork.artist;

        if (req.session.cart && req.session.artist == artwork.artist) {
          cart.add(artwork, artwork.id);
          req.session.cart = cart;

          /* req.flash('success_msg', 'Your item has been added to the cart. keep shopping.'); */

          res.json({
            success: true,
            count: Object.keys(req.session.cart.items).length,
            msg: 'Your item has been added to the cart. keep shopping.',
          });
        } else {
          /* req.flash('error_msg', `One order can only contain artworks of one artist( ${req.session.artist} ).`); */

          res.json({
            success: false,
            msg: `One order can only contain artworks of one artist( ${req.session.artist} ).`,
          });
        }
      } else {
        res.json({
          success: false,
          msg: 'Please log in to add items in the cart.',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
