const router = require('express').Router();
const { addToCart, removeFromCart, manageCartItems, shoppingCart, showOrderInfo, placeOrder, payCharges, cart } = require('../../controllers/order');
const { authenticateUser } = require('../../helpers/auth');

router.all('/*', (req, res, next) => {
	req.app.set('layout', 'layouts/home');
	next();
});

// add items o cart
router.get('/cart/add/:id', authenticateUser, addToCart);

// remove items from cart
router.get('/cart/delete/:id/:url?', authenticateUser, removeFromCart);

// see shopping cart
router.get('/shoppingcart', authenticateUser, shoppingCart);

// manage cart items quantity
router.get('/cartItem/quantity/:id/:quantity', authenticateUser, manageCartItems);

// customer's details
router.get('/placeorder/:id?', authenticateUser, showOrderInfo);

// cash on delivery method
router.post('/checkout/completeorder', authenticateUser, placeOrder);

// online payment method
router.post('/paycharges', authenticateUser, payCharges);

//router.post('/cart/:id', cart);

module.exports = router;
