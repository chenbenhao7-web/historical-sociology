const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  author: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Comment', commentSchema);