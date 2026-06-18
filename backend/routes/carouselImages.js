const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CarouselImage = require('../models/CarouselImage'); // 确保 CarouselImage 模型文件路径正确
const authenticateToken = require('../middleware/authenticateToken'); // 假设您的认证中间件放在这里，或者调整路径

// Multer 配置：将图片存储到 backend/public/uploads/carousel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 从 routes 文件夹出发，../ 指向 backend, 然后进入 public/uploads/carousel
    cb(null, path.join(__dirname, '../public/uploads/carousel'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); // 替换文件名中的空格，避免潜在问题
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 限制文件大小为 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// 检查文件类型函数
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// POST /api/carousel - 上传新的轮播图片 (需要认证)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('--- /api/carousel POST request received ---'); // 添加日志
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }
  try {
    const newCarouselImage = new CarouselImage({
      filename: req.file.filename,
      path: '/public/uploads/carousel/' + req.file.filename, // 存储相对路径，用于前端访问
      originalname: req.file.originalname
    });
    await newCarouselImage.save();
    res.status(201).json({
      message: 'Carousel image uploaded successfully!',
      image: newCarouselImage
    });
  } catch (error) {
    console.error('Error uploading carousel image:', error);
    res.status(500).json({ message: 'Server error while uploading image.' });
  }
});

// GET /api/carousel - 获取所有轮播图片 (可选，公共访问或需要认证)
router.get('/', async (req, res) => {
  try {
    const images = await CarouselImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error while fetching images.' });
  }
});

// DELETE /api/carousel/:id - 删除指定的轮播图片 (需要认证)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const image = await CarouselImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: '找不到指定的图片' });
    }

    // 从数据库中删除图片记录
    await CarouselImage.findByIdAndDelete(req.params.id);

    // 返回成功响应
    res.json({ message: '图片删除成功' });
  } catch (error) {
    console.error('删除轮播图片时出错:', error);
    res.status(500).json({ message: '删除图片时发生服务器错误' });
  }
});

module.exports = router;