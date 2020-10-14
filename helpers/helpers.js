const moment = require('moment');
const Category = require('../models/Category');

module.exports = {
  generateDate: (date, format) => moment(date).format(format),

  selectValue: (postStatus, value) =>
    postStatus === value ? 'selected' : false,

  datesDifference: (sd, ed, id) => {
    const startDate = new Date(sd);
    const endDate = new Date(ed);
    const currentDate = new Date();

    if (currentDate.getTime() < startDate.getTime()) {
      return `<h4 class="text-center text-success">Starting Soon</h4>`;
    } else if (
      currentDate.getTime() > startDate.getTime() &&
      currentDate.getTime() < endDate.getTime()
    ) {
      return `<form
					action="/home/user/biddingroom/updatebid/${id}"
					method="POST"
				>
					<div class="form-group">
						<input
							required
							type="text"
							name="bid_amount"
							id="bid-amount"
							class="form-control"
							placeholder="Enter Bid Amount"
						/>

					</div>
					<small class="text-dark float-left" style="font-size:14px !important; margin-top:-8px !important">
						Enter Bid more than starting price !
					</small>
					<div class="clearfix"></div>
						<button type="submit" class="btn btn-secondary float-right btn-bid mt-2">
							Place Bid
						</button>
						<div class="clearfix"></div>
				</form>`;
    }
  },

  paginate: (current, pages, url) => {
    let output = '';

    if (current === 1) {
      output += `<li class="page-item disabled"><a class="page-link">First</a></li>`;
    } else {
      output += `<li class="page-item"><a href="?${url}/1" class="page-link">First</a></li>`;
    }

    let i = Number(current) > 6 ? Number(current) - 5 : 1;

    if (i !== 1) {
      output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
    }

    for (; i <= Number(current) + 5 && i <= pages; i++) {
      if (i === current) {
        output += `<li class="page-item active"><a class="page-link">${i}</a></li>`;
      } else {
        output += `<li class="page-item "><a href="${url}/${i}" class="page-link">${i}</a></li>`;
      }

      if (i === Number(current) + 5 && i < pages) {
        output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
      }
    }

    if (current === pages) {
      output += `<li class="page-item disabled"><a class="page-link">Last</a></li>`;
    } else {
      output += `<li class="page-item "><a href="${url}/${pages}" class="page-link">Last</a></li>`;
    }

    return output;
  },

  bidDuration: (sd, ed) => {
    if (
      new Date().getTime() > new Date(sd).getTime() &&
      new Date().getTime() < new Date(ed).getTime()
    ) {
      const countDownDate = new Date(ed).getTime();
      const now = new Date().getTime();
      let distance = countDownDate - now;
      distance = distance - 18000000;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        clearInterval(x);
        return 'Time end';
      }

      const time = days + 'd ' + hours + 'h ' + minutes + 'm ';
      return time;
    } else {
      return '0d 0h 0m';
    }
  },

  generateUsername: (name) => {
    const n = name.split(/[0-9 ]+/)[0];
    const suggestions = [];

    for (let i = 0; i < 3; i++) {
      const randName = n + Math.floor(Math.random() * 99999);
      suggestions.push(randName);
    }

    return suggestions;
  },
};
