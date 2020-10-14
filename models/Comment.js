const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  username: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  approveComment: {
    type: Boolean,
    default: false,
  },
  artwork: {
    type: Schema.Types.ObjectId,
    ref: 'artworks',
  },
});

module.exports = mongoose.model('comments', commentSchema);
