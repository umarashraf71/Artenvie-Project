const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');

const artworkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    required: [true, 'please provide a post title'],
    trim: true,
  },
  artist: {
    type: String,
    required: [true, 'please provide a name'],
    trim: true,
  },
  category: {
    required: true,
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: 'Enabled',
    trim: true,
  },
  size: {
    type: String,
    required: [true, 'please enter size'],
  },
  price: {
    type: Number,
    required: [true, 'please enter price'],
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  discountCurrency: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    required: [true, 'please enter condition'],
    trim: true,
  },
  medium: {
    type: String,
    required: [true, 'please enter artwork medium'],
    trim: true,
  },
  buyingFormat: {
    type: String,
    required: [true, 'please specify buying format'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  file: {
    type: Array,
    default: [],
    required: true,
  },
  date: {
    type: Date,
  },
  bidInfo: {
    type: Object,
    default: {},
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  hours: {
    type: Number,
    default: 0,
  },
  minutes: {
    type: Number,
    default: 0,
  },
  session: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comments',
    },
  ],
  allowComments: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  auctionStatus: {
    type: Boolean,
    default: true,
  },
});

artworkSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true, replacement: '_' });
  next();
});

module.exports = mongoose.model('artworks', artworkSchema);
