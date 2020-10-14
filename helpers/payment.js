const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = require('express')();

app.post('/charge', (req, res) => {
	const amount = 2500;

	stripe.customers
		.create({
			email: req.body.stripeEmail,
			source: req.body.stripeToken,
		})
		.then((customer) => {
			return stripe.invoiceItems.create({
				amount,
				description: 'Web Development Ebook',
				currency: 'usd',
				customer: customer.id,
			});
		})
		.then((invoiceItem) => {
			return stripe.invoices.create({
				//collection_method: 'send_invoice',
				customer: invoiceItem.customer,
			});
		})
		.then((invoice) => {
			// New invoice created on a new customer
			console.log(invoice);
			res.render('success');
		})
		.catch((err) => {
			console.log(err);
		});
	/* stripe.customers
		.create({
			email: req.body.stripeEmail,
			source: req.body.stripeToken
		})
		.then(customer =>
			stripe.charges.create({
				amount,
				description: 'Web Development Ebook',
				currency: 'usd',
				customer: customer.id
			})
		)
		.then(charge => res.render('success')); */
});
