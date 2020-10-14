module.exports = function Cart(oldCart) {
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.add = function (item, id) {
		let storedItem = this.items[id];

		if (!storedItem) {
			storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
		}

		storedItem.qty++;

		if (storedItem.item.buyingFormat === 'Discount') {
			storedItem.price = storedItem.item.discountPrice * storedItem.qty;
			this.totalPrice += storedItem.item.discountPrice;
		} else {
			storedItem.price = storedItem.item.price * storedItem.qty;
			this.totalPrice += storedItem.item.price;
		}

		this.totalQty++;
	};

	this.remove = function (id, flag = false) {
		let storedItem = this.items[id];

		if (flag) {
			this.totalQty -= storedItem.qty;

			if (storedItem.item.buyingFormat === 'Discount') {
				this.totalPrice -= storedItem.item.discountPrice * storedItem.qty;
			} else {
				this.totalPrice -= storedItem.item.price * storedItem.qty;
			}

			return delete this.items[id];
		}

		if (storedItem && storedItem.qty > 1) {
			storedItem.qty--;
			if (storedItem.item.buyingFormat === 'Discount') {
				storedItem.price = storedItem.item.discountPrice * storedItem.qty;
				this.totalPrice -= storedItem.item.discountPrice;
			} else {
				storedItem.price = storedItem.item.price * storedItem.qty;
				this.totalPrice -= storedItem.item.price;
			}

			this.totalQty--;
		}
	};

	this.generateAray = function () {
		const arr = [];

		for (let id in this.items) {
			arr.push(this.items[id]);
		}

		return arr;
	};
};
