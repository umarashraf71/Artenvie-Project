const Category = require('../models/Category');
const Artwork = require('../models/Artwork');
const fs = require('fs');

module.exports = {
  fetchAllPosts: (req, res) => {
    if (req.user.userType == 'Artist') {
      Artwork.find({ artist: req.user.username })
        .sort({ date: -1 })
        .then((posts) => {
          res.render('admin/posts/index', {
            posts: posts,
            buyingFormat: 'All',
            title: 'Manage All Artworks',
          });
        });
    } else {
      Artwork.find()
        .sort({ date: -1 })
        .then((posts) => {
          res.render('admin/posts/index', {
            posts: posts,
            buyingFormat: 'All',
            title: 'Manage All Artworks',
          });
        });
    }
  },

  showArtworks: async (req, res, next) => {
    try {
      let posts = [];

      posts = await Artwork.find({
        buyingFormat: req.params.format,
      }).sort({ date: -1 });

      res.render('admin/posts/index', {
        posts,
        buyingFormat: req.params.format,
        title: req.params.format,
      });
    } catch (error) {
      next(error);
    }
  },

  uploadArtworkPage: async (req, res, next) => {
    try {
      const categories = await Category.find({});
      let page = 'admin/posts/';
      if (req.params.format == 'auction') page += 'auctionupload';
      else page += 'uploadArtwork';

      res.render(page, {
        categories,
        title: req.params.format + ' Upload',
        buyingFormat: req.params.format,
        name: req.params.format,
      });
    } catch (error) {
      next(error);
    }
  },

  uploadArtwork: async (req, res) => {
    const {
      title,
      category,
      width,
      height,
      buyingFormat,
      price,
      currency,
      discountPrice,
      discountCurrency,
      condition,
      medium,
      description,
      allowComments,
    } = req.body;

    const artwork = new Artwork();

    artwork.user = req.user.id;
    artwork.title = title;
    artwork.artist = req.user.slug;
    artwork.category = category;
    artwork.size = `${width} * ${height}`;
    artwork.price = price;
    artwork.currency = currency;
    artwork.condition = condition;
    artwork.medium = medium;
    artwork.buyingFormat = buyingFormat;
    artwork.description = description;
    artwork.date = new Date();
    artwork.allowComments = allowComments == 'on' ? true : false;

    if (buyingFormat == 'Discount') {
      artwork.discountPrice = discountPrice;
      artwork.discountCurrency = discountCurrency;
    }

    if (req.files) {
      if (buyingFormat == 'Special Offer') {
        const files = req.files.file;

        if (files.length > 4) {
          req.flash('error_msg', 'You can upload Maximum 4 files!');
          return res.redirect('/admin/posts/uploadArtwork/specialOffer');
        } else {
          for (let i = 0; i < files.length; i++) {
            let fileName = Date.now() + '-' + files[i].name;

            files[i].mv('./public/uploads/' + fileName, (err) => {
              if (err) throw err;
            });

            artwork.file.push(fileName);
          }
        }
      } else {
        const file = req.files.file;
        let fileName = Date.now() + '-' + file.name;

        file.mv('./public/uploads/' + fileName, (err) => {
          if (err) throw err;
        });

        artwork.file.push(fileName);
      }
    }

    await artwork.save((savedArtwork) => {
      req.flash('success_msg', `${artwork.title} created successfully.`);
      res.redirect('/admin/posts');
    });
  },

  uploadInAuction: async (req, res, next) => {
    try {
      const {
        title,
        category,
        width,
        height,
        price,
        buyingFormat,
        startDate,
        endDate,
        condition,
        medium,
        description,
      } = req.body;

      var d = new Date();
      d = d.toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
      console.log(d);

      const auction = new Artwork({
        user: req.user.id,
        title,
        artist: req.user.slug,
        category,
        size: `${width} * ${height}`,
        price,
        condition,
        buyingFormat,
        medium,
        description,
        startDate,
        endDate,
        date: d,
      });

      if (req.files) {
        const file = req.files.file;
        let fileName = Date.now() + '-' + file.name;

        file.mv('./public/uploads/' + fileName, (err) => {
          if (err) throw err;
        });

        auction.file.push(fileName);
      }

      await auction.save();

      req.flash('success_msg', 'Bid placed successfully.');
      res.redirect('/admin/posts');
    } catch (error) {
      next(error);
    }
  },

  userPosts: async (req, res, next) => {
    try {
      let posts = [];
      if (req.params.format) {
        posts = await Artwork.find({
          user: req.user.id,
          buyingFormat: req.params.format,
        }).sort({ date: -1 });
      } else {
        posts = await Artwork.find({
          user: req.user.id,
        }).sort({ date: -1 });
      }

      res.render('admin/posts/my-posts', {
        posts,
        buyingFormat: req.params.format,
        title: `${req.user.name}'s Posts`,
      });
    } catch (error) {
      next(error);
    }
  },

  editPost: async (req, res, next) => {
    try {
      const post = await Artwork.findById(req.params.id);
      const ctgs = await Category.find({});

      res.render('admin/posts/edit', {
        post: post,
        title: 'Edit Post',
        categories: ctgs,
      });
    } catch (error) {
      next(error);
    }
  },

  updatePost: (req, res) => {
    Artwork.findById(req.params.id, (err, artwork) => {
      if (err) throw err;

      const {
        title,
        artistName,
        category,
        width,
        height,
        buyingFormat,
        price,
        discountPrice,
        endDate,
        /*hours,
        		minutes,
        		session, */
        condition,
        medium,
        description,
        allowComments,
      } = req.body;

      artwork.user = req.user.id;
      artwork.title = title;
      artwork.artist = artistName;
      artwork.category = category;
      artwork.size = `${width} * ${height}`;
      artwork.price = price;
      artwork.condition = condition;
      artwork.medium = medium;
      artwork.buyingFormat = buyingFormat;
      artwork.description = description;

      artwork.allowComments = allowComments == 'on' ? true : false;

      if (buyingFormat == 'Discount') {
        artwork.discountPrice = discountPrice;
        // artwork.discountCurrency = discountCurrency;
      }

      /*if (buyingFormat == 'Auction') {
				artwork.endDate = endDate;
				artwork.endDate = endDate;
				artwork.startDate = startDate;
				artwork.hours = hours;
				artwork.minutes = minutes;
				artwork.session = session;
		    }*/

      if (req.files) {
        artwork.file = [];

        if (buyingFormat == 'Special Offer') {
          const files = req.files.file;

          for (let i = 0; i < files.length; i++) {
            let fileName = Date.now() + '-' + files[i].name;

            files[i].mv('./public/uploads/' + fileName, (err) => {
              if (err) throw err;
            });

            artwork.file.push(fileName);
          }
        } else {
          const file = req.files.file;
          let fileName = Date.now() + '-' + file.name;

          file.mv('./public/uploads/' + fileName, (err) => {
            if (err) throw err;
          });

          artwork.file.push(fileName);
        }
      }

      artwork.save((savedArtwork) => {
        req.flash('success_msg', `${artwork.title} updated successfully.`);
        res.redirect('/admin/posts');
      });
    });
  },

  deletePost: async (req, res, next) => {
    try {
      const post = await Artwork.findById(req.params.id);

      if (fs.existsSync('./public/uploads/' + post.file)) {
        fs.unlink('./public/uploads/' + post.file, (err) => {
          if (err) throw err;
        });
      }

      await post.deleteOne();

      req.flash('success_msg', `Post ${post.title} removed successfully.`);
      res.redirect('/admin/posts');
    } catch (error) {
      next(error);
    }
  },

  searchArtwork: async (req, res, next) => {
    try {
      const seachString = req.body.search;
      const re = new RegExp(seachString, 'gi');

      const posts = await Artwork.find({
        $or: [
          { artist: re },
          { title: re },
          { category: re },
          { buyingFormat: re },
        ],
      });

      res.render('admin/posts/index', {
        title: 'Search Results - Artworks',
        posts,
      });
    } catch (error) {
      next(error);
    }
  },
};
