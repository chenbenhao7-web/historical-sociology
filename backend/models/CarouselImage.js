const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true }, // 存储图片的相对URL路径
  originalname: { type: String, required: true },
  caption: { type: String }, // 可选的图片标题
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CarouselImage', carouselImageSchema);