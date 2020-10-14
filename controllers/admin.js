const User = require('../models/User'),
  Artwork = require('../models/Artwork'),
  Order = require('../models/Order'),
  Comment = require('../models/Comment'),
  Query = require('../models/Query'),
  sendEmail = require('../helpers/email'),
  Notification = require('../models/Notification'),
  Category = require('../models/Category'),
  Review = require('../models/Review');

module.exports = {
  dashboard: async (req, res) => {
    const promises = [
      User.countDocuments().exec(),
      Artwork.countDocuments().exec(),
      Category.countDocuments().exec(),
      Comment.countDocuments().exec(),
      Query.countDocuments().exec(),
      Review.countDocuments().exec(),
      Order.countDocuments().exec(),
    ];

    const [
      userCount,
      artworkCount,
      categoryCount,
      commentCount,
      queryCount,
      reviewCount,
      orderCount,
    ] = await Promise.all(promises);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      userCount,
      artworkCount,
      categoryCount,
      commentCount,
      queryCount,
      reviewCount,
      orderCount,
    });
  },

  fetchAllUsers: async (req, res, next) => {
    try {
      const users = await User.find(
        req.params.type ? { userType: req.params.type } : {}
      );

      res.render('admin/users', {
        title: req.params.type ? `Manage ${req.params.type}s` : 'Manage Users',
        users,
      });
    } catch (error) {
      next(error);
    }
  },

  showUserRoles: (req, res) => {
    User.findOne({ _id: req.params.id }).then((user) => {
      res.render('admin/users/userRole', {
        title: 'User role',
        User: user,
      });
    });
  },
  updateRoles: (req, res) => {
    User.findOne({ _id: req.params.id }).then((user) => {
      const { firstName, lastName, email, Admin, User } = req.body;

      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;

      Admin && !user.roles.includes('admin') ? user.roles.push('admin') : false;
      User && !user.roles.includes('user') ? user.roles.push('user') : false;

      !Admin && user.roles.includes('admin')
        ? user.roles.splice(user.roles.indexOf('admin'), 1)
        : false;

      !User && user.roles.includes('user')
        ? user.roles.splice(user.roles.indexOf('user'), 1)
        : false;

      user.save().then((savedUser) => {
        res.redirect('/admin/fetchUsers');
      });
    });
  },

  fetchComments: async (req, res, next) => {
    try {
      const comments = await Comment.find({})
        .populate('user')
        .populate('artwork');

      res.render('admin/comments/comments', {
        title: 'Comments',
        comments,
      });
    } catch (error) {
      next(error);
    }
  },
  approveComment: async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id);
      comment.approveComment = !comment.approveComment;
      await comment.save();

      req.flash('success_msg', 'Comment status updated successfully.');
      res.redirect('/admin/comments');
    } catch (error) {
      next(error);
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      await Comment.deleteOne({ _id: req.params.id });

      req.flash('success_msg', 'Comment removed successfully.');
      res.redirect('/admin/comments');
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      await user.remove();

      req.flash('success_msg', 'User has been removed successfully.');
      res.redirect('/admin/fetchUsers/' + req.params.userType);
    } catch (error) {
      next(error);
    }
  },

  updateUserStatus: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      let url = '/admin/fetchUsers/';

      if (req.params.status == 'enable') user.status = 'Enabled';
      else if (req.params.status == 'disable') user.status = 'Disabled';

      user.userType == 'Artist' ? (url += 'Artist') : (url += 'Customer');
      await user.save();

      req.flash('success_msg', 'Status updated successfully.');
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  },
  updateArtworkStatus: async (req, res, next) => {
    try {
      const artwork = await Artwork.findById(req.params.id);
      req.params.status == 'enable'
        ? (artwork.status = 'Enabled')
        : (artwork.status = 'Disabled');

      await artwork.save();

      req.flash('success_msg', 'Status updated successfully.');
      res.redirect('/admin/posts');
    } catch (error) {
      next(error);
    }
  },

  fetchOrders: async (req, res, next) => {
    try {
      let orders = [];

      if (req.user.userType == 'Artist') {
        orders = await Order.find({
          artist: req.user.username,
        }).sort({ date: -1 });
      } else if (req.user.userType == 'Customer') {
        orders = await Order.find({
          customer: req.user.username,
        }).sort({ date: -1 });
      }

      await res.render('admin/orders/order', {
        title: 'All Orders',
        status: 'All Orders',
        orders,
      });
    } catch (error) {
      next(error);
    }
  },
  showOrders: async (req, res) => {
    let status = '';
    if (req.params.status == 'progress') status = 'In Progress';
    else if (req.params.status == 'delivered') status = 'Delivered';
    else if (req.params.status == 'completed') status = 'Completed';
    else if (req.params.status == 'cancelled') status = 'Cancelled';
    else if (req.params.status == 'cancelRequest') status = 'Cancel Requested';

    let orders = [];
    if (req.user.userType == 'Artist') {
      orders = await Order.find({
        $and: [
          {
            $or: [{ status }],
          },
          { $or: [{ artist: req.user.username }] },
        ],
      }).sort({ date: -1 });
    } else {
      orders = await Order.find({
        $and: [
          { $or: [{ status }] },
          { $or: [{ customer: req.user.username }] },
        ],
      }).sort({ date: -1 });
    }

    res.render('admin/orders/order', {
      title: status + ' Orders',
      status: status,
      orders,
    });
  },
  orderDetails: async (req, res, next) => {
    try {
      const order = await Order.findOne({
        orderID: req.params.id,
      });

      res.render('admin/orders/orderItems', {
        title: 'Order Details',
        order,
      });
    } catch (error) {
      next(error);
    }
  },
  deliverOrder: async (req, res) => {
    const orderID = req.params.orderID;

    const order = await Order.findOne({ orderID });

    await Order.updateOne(
      { orderID },
      {
        $set: {
          status: 'Delivered',
        },
      }
    );

    sendEmail(
      process.env.EMAIL,
      order.email,
      `Ordered Delivered`,
      `
      <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        <p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          Artenvie
        </p>

        <p style="color:white;  font-size:25px;" >
        Dear User ${order.customer},<br>Your order 
        no ${order.orderID} has been delivered. Kindly 
        mark it as complete after Receiving<br>
        </p>

      </div>`
    );

    req.flash('success_msg', 'Order delivered successfully.');
    res.redirect('/admin/users/orders/details/' + orderID);
  },
  completeOrder: async (req, res) => {
    const id = req.params.orderID;
    const order = await Order.findOne({
      orderID: id,
    });

    order.status = 'Completed';

    const artist = await User.findOne({ username: order.artist });
    if (order.paymentMethod == 'online') {
      artist.credit += order.cart.totalPrice;

      await artist.save();
    }

    await order.save();
    sendEmail(
      process.env.EMAIL,
      artist.email,
      `Ordered Completed`,
      `
      <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        <p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          Artenvie
        </p>

        <p style="color:white;  font-size:25px;" >
        Dear User ${artist.username},<br>Your order 
        no ${order.orderID} has been successfully Completed by customer ${order.customer}<br>
        </p>

      </div> `
    );

    req.flash('success_msg', `Order with id:${id} completed.`);
    res.render('admin/orders/review-artist', {
      title: 'Review Artist',
      artist: artist.username,
    });
  },

  giveReview: (req, res) => {
    res.render('admin/orders/review-artist', {
      title: 'Review Artist',
      artist: req.params.artistName,
    });
  },

  orderCancellationReason: async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderID);
      order.reason = req.body.reason;
      order.status = 'Cancel Requested';

      await order.save();
      req.flash(
        'success_msg',
        'Your order cancellation request will be examined by the admin before cancellation. Thanks!'
      );

      sendEmail(
        process.env.EMAIL,
        process.env.AdminEmail,
        `Ordered Cancellation Request`,
        `
        <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        <p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          Artenvie
        </p>

        <p style="color:white;  font-size:25px;" >
          Dear Admin ,<br> A cancellation request on order 
          no ${order.orderID} has been requested. Please 
          examine the request !<br>
        </p>

      </div> `
      );

      res.redirect('/admin/users/orders/cancelRequest');
    } catch (error) {
      next(error);
    }
  },
  orderCancellationRequest: (req, res) => {
    res.render('admin/orders/artistRequestCancel', {
      title: 'Request Cancel',
      orderId: req.params.orderID,
    });
  },

  contactCustomer: async (req, res, next) => {
    try {
      const contactCustomer = await User.findOne({ _id: req.params.id });

      res.render('admin/orders/contactCustomer', {
        title: 'Contact Customer',
        contactCustomer,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (req, res) => {
    const order = await Order.findById(req.params.id);
    let url = '/admin/manageOrders';

    if (req.user.userType == 'Artist') url = '/admin/users/allOrders';

    await order.remove();

    req.flash(
      'success_msg',
      `Order with id-${order._id} has been removed successfully.`
    );
    res.redirect(url);
  },

  adminAccessPage: (req, res) => {
    User.find().then((users) => {
      res.render('admin/userRoles', {
        title: 'User Roles',
        users,
      });
    });
  },
  adminAccess: (req, res) => {
    User.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          user.roles = [];
          user.roles.push(req.body.role);

          user.save().then((savedUser) => {
            req.flash('success_msg', 'Role updated successfully.');
            res.redirect('/home/user-Roles');
          });
        }
      })
      .catch((err) => console.log(err));
  },

  manageContent: async (req, res, next) => {
    try {
      res.render(`admin/content/${req.params.section}`, {
        title: `Manage ${req.params.section}`,
      });
    } catch (error) {
      next(error);
    }
  },

  cancelOrder: async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      order.status = 'Cancelled';

      await order.save();

      const customer = await User.findOne({ username: order.customer });
      const artist = await User.findOne({ username: order.artist });

      sendEmail(
        process.env.EMAIL,
        customer.email,
        `Ordered Cancelled`,
        `
        <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        <p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          Artenvie
        </p>

        <p style="color:white;  font-size:25px;" >
          Dear User ${customer.username} ,<br> Your order 
          no ${order.orderID} has been cancelled upon your request<br>
        </p>
        </div> `
      );

      sendEmail(
        process.env.EMAIL,
        artist.email,
        `Ordered Cancelled`,
        `
        <div style="min-height:250px; width:62%;margin:0 auto; background-color:black; text-align:center; padding:25px; border-radius: 5px"> 
        <p style="margin-top:10px; margin-bottom:20px; 
                  margin-left:-10px; color:#dfbd24; 
                  font-size:80px;letter-spacing:1px;">
          Artenvie
        </p>

        <p style="color:white;  font-size:25px;" >
          Dear User ${artist.username} ,<br> Your order 
          no ${order.orderID} has been cancelled upon your request<br>
        </p>
        </div> `
      );

      req.flash('success_msg', 'Order has been cancelled successfully.');
      res.redirect('/admin/manageOrders');
    } catch (error) {
      next(error);
    }
  },
  manageOrders: async (req, res, next) => {
    try {
      const orders = await Order.find({});

      res.render('admin/orders/manageOrders', {
        title: 'All Orders',
        status: orders.status,
        orders,
      });
    } catch (error) {
      next(error);
    }
  },
  filterOrders: async (req, res, next) => {
    try {
      const orders = await Order.find({ status: req.params.status });

      res.render('admin/orders/manageOrders', {
        title: req.params.status + ' Orders',
        status: req.params.status,
        orders,
      });
    } catch (error) {
      next(error);
    }
  },

  userQueries: async (req, res, next) => {
    try {
      const queries = await Query.find({}).sort({
        date: -1,
      });

      res.render('admin/users/user-queries', {
        title: 'User Queries',
        queries,
      });
    } catch (error) {
      next(error);
    }
  },

  sendWarningMessagePage: async (req, res, next) => {
    try {
      const users = await User.find({ userType: req.params.user });

      res.render('admin/users/sendAdminWarning', {
        title: req.params.user == 'Artist' ? 'Artist' : 'Customer',
        type: req.params.user,
        users,
      });
    } catch (error) {
      next(error);
    }
  },
  sendWarningMessage: async (req, res, next) => {
    try {
      const { username, warningMessage } = req.body;
      const user = await User.findOne({ username });
      user.warnings.push(warningMessage);

      const notify = new Notification({
        text: warningMessage,
        username,
        sender: 'Admin',
        date: new Date(),
      });

      await notify.save();
      await user.save();

      req.flash(
        'success_msg',
        'Warning message delived to user with username ' + username
      );
      res.redirect('/admin/sendWarning/' + user.userType);
    } catch (error) {
      next(error);
    }
  },

  searchUser: async (req, res, next) => {
    const seachString = req.body.search;
    const re = new RegExp(seachString, 'gi');

    const users = await User.find({
      $or: [{ name: re }, { username: re }],
    });

    res.render('admin/users/index', {
      title: 'Search Results - Users',
      users,
    });
  },
};
