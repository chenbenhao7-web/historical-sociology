require('dotenv').config();
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const carouselRoutes = require('../routes/carouselImages');
    const blogPostsRouter = require('../routes/blogPosts');
    const path = require('path');
    const app = express();

    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    app.set('jwt-secret', JWT_SECRET);

    app.use(cors());
    app.use(express.json());
    app.use('/api/carousel', carouselRoutes);
    app.use('/api/posts', blogPostsRouter);
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // 生产环境：前端使用React build
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../../my-website/build')));
    }

    mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log('MongoDB连接成功');
    }).catch((err) => {
      console.error('MongoDB连接失败:', err);
    });
    
    // 用户模型
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // 注册路由
    app.post('/api/register', async (req, res) => {
      try {
        const { username, password } = req.body;
        
        // 检查用户是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: '用户名已存在' });
        }
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建新用户
        const user = new User({
          username,
          password: hashedPassword
        });
        
        await user.save();
        res.status(201).json({ message: '注册成功' });
      } catch (error) {
        res.status(500).json({ message: '服务器错误' });
      }
    });
    
    // 登录路由
    app.post('/api/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        console.log('--- Login Attempt ---'); // 新增日志
        console.log('Received username:', username); // 新增日志
        console.log('Received password:', password); // 新增日志
        
        // 查找用户
        const user = await User.findOne({ username });
        console.log('User found in DB:', user); // 新增日志
        if (!user) {
          console.log('Login failed: User not found'); // 新增日志
          return res.status(401).json({ message: '用户名或密码错误' });
        }
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password comparison result (isValidPassword):', isValidPassword); // 新增日志
        if (!isValidPassword) {
          console.log('Login failed: Invalid password'); // 新增日志
          return res.status(401).json({ message: '用户名或密码错误' });
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
          { userId: user._id },
          'your_jwt_secret', // 在生产环境中应该使用环境变量
          { expiresIn: '24h' }
        );
        
        res.json({
          message: '登录成功',
          token,
          user: {
            id: user._id,
            username: user.username
          }
        });
      } catch (error) {
        res.status(500).json({ message: '服务器错误' });
      }
    });
    
    // 验证中间件 (这个 authenticateToken 中间件可以考虑移到专门的 middleware 文件中，或者确保 blogPosts.js 中的版本是最新的)
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
      }
      
      jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
          return res.status(403).json({ message: '令牌无效' });
        }
        req.user = user;
        next();
      });
    };
    
    // 根路径处理
    app.get('/', (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../../my-website/build/index.html'));
      } else {
        res.json({ message: '欢迎访问API服务器' });
      }
    });

    // 生产环境：SPA路由回退
    if (process.env.NODE_ENV === 'production') {
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../my-website/build/index.html'));
      });
    }
    
    // 受保护的路由示例
    app.get('/api/protected', authenticateToken, (req, res) => {
      res.json({ message: '这是受保护的资源' });
    });
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
