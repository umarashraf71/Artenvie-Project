function myFunction(imgs) {
	const innerImgs = document.querySelectorAll('.sub > div img');

	var expandImg = document.getElementById('expandedImg');
	var imgText = document.getElementById('imgtext');
	expandImg.src = imgs.src;
	// imgText.innerHTML = imgs.alt;
	expandImg.parentElement.style.display = 'block';

	innerImgs.forEach((img) => (img === imgs ? (img.style.opacity = 1) : (img.style.opacity = 0.7)));
}

/* function magnify(imgID, zoom) {
	var img, glass, w, h, bw;
	img = document.getElementById(imgID);
	glass = document.createElement('DIV');
	glass.setAttribute('class', 'img-magnifier-glass');
	img.parentElement.insertBefore(glass, img);
	glass.style.backgroundImage = "url('" + img.src + "')";
	glass.style.backgroundRepeat = 'no-repeat';
	glass.style.backgroundSize = img.width * zoom + 'px ' + img.height * zoom + 'px';
	bw = 3;
	w = glass.offsetWidth / 2;
	h = glass.offsetHeight / 2;
	glass.addEventListener('mousemove', moveMagnifier);
	img.addEventListener('mousemove', moveMagnifier);
	glass.addEventListener('touchmove', moveMagnifier);
	img.addEventListener('touchmove', moveMagnifier);
	function moveMagnifier(e) {
		glass.style.display = 'block';
		var pos, x, y;
		e.preventDefault();
		pos = getCursorPos(e);
		x = pos.x;
		y = pos.y;
		if (x > img.width - w / zoom) {
			x = img.width - 35 - w / zoom;
		}
		if (x < w / zoom) {
			x = w + 25 / zoom;
		}
		if (y > img.height - h / zoom) {
			y = img.height - 80(h / zoom);
		}
		if (y < h / zoom) {
			y = h + 25 / zoom;
		}
		glass.style.left = x - w + 'px';
		glass.style.top = y - h + 'px';
		glass.style.backgroundPosition = '-' + (x * zoom - w + bw) + 'px -' + (y * zoom - h + bw) + 'px';
	}
	function getCursorPos(e) {
		var a,
			x = 0,
			y = 0;
		e = e || window.event;
		a = img.getBoundingClientRect();
		x = e.pageX - a.left;
		y = e.pageY - a.top;
		x = x - window.pageXOffset;
		y = y - window.pageYOffset;
		return {
			x: x,
			y: y,
		};
	}
} */

function magnify(imgID, zoom) {
	var img, glass, w, h, bw;
	img = document.getElementById(imgID);

	/* Create magnifier glass: */
	glass = document.createElement('DIV');
	glass.setAttribute('class', 'img-magnifier-glass');

	/* Insert magnifier glass: */
	img.parentElement.insertBefore(glass, img);

	/* Set background properties for the magnifier glass: */
	glass.style.backgroundImage = "url('" + img.src + "')";
	glass.style.backgroundRepeat = 'no-repeat';
	glass.style.backgroundSize = img.width * zoom + 'px ' + img.height * zoom + 'px';
	bw = 3;
	w = glass.offsetWidth / 2;
	h = glass.offsetHeight / 2;

	/* Execute a function when someone moves the magnifier glass over the image: */
	glass.addEventListener('mousemove', moveMagnifier);
	img.addEventListener('mousemove', moveMagnifier);

	/*and also for touch screens:*/
	glass.addEventListener('touchmove', moveMagnifier);
	img.addEventListener('touchmove', moveMagnifier);
	function moveMagnifier(e) {
		var pos, x, y;
		/* Prevent any other actions that may occur when moving over the image */
		e.preventDefault();
		/* Get the cursor's x and y positions: */
		pos = getCursorPos(e);
		x = pos.x;
		y = pos.y;
		/* Prevent the magnifier glass from being positioned outside the image: */
		if (x > img.width - w / zoom) {
			x = img.width - w / zoom;
		}
		if (x < w / zoom) {
			x = w / zoom;
		}
		if (y > img.height - h / zoom) {
			y = img.height - h / zoom;
		}
		if (y < h / zoom) {
			y = h / zoom;
		}
		/* Set the position of the magnifier glass: */
		glass.style.left = x - w + 'px';
		glass.style.top = y - h + 'px';
		/* Display what the magnifier glass "sees": */
		glass.style.backgroundPosition = '-' + (x * zoom - w + bw) + 'px -' + (y * zoom - h + bw) + 'px';
	}

	function getCursorPos(e) {
		var a,
			x = 0,
			y = 0;
		e = e || window.event;
		/* Get the x and y positions of the image: */
		a = img.getBoundingClientRect();
		/* Calculate the cursor's x and y coordinates, relative to the image: */
		x = e.pageX - a.left;
		y = e.pageY - a.top;
		/* Consider any page scrolling: */
		x = x - window.pageXOffset;
		y = y - window.pageYOffset;
		return { x: x, y: y };
	}
}

magnify('artImg', 3);

const id = '<%= post.id %>';

function cart(url) {
	if (typeof user == undefined) {
		window.location.assign('/home/login');
	} else {
		spinner.style.display = 'flex';
		window.location.assign(url);

		setTimeout(() => {
			spinner.style.display = 'none';
		}, 3000);
	}
}

/* $(document).ready(() => {
		$('.add-to-cart').click(e => {
			e.preventDefault()
			$.ajax({
				method: 'post',
				url: '/home/order/cart/' + id,
				success: (res) => {
					if (res.success) {
						cartBtn.innerHTML = 'Remove from cart'
						cartBtn.setAttribute('href', '/home/order/cart/delete/' + id)
						$('.cart-count').text(`Cart(${res.count})`)
					} else {
						alert(res.msg)
					}
				},
				error: (err) => console.log(err)
			})
		})
	}) */