const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost'); // 确保路径正确
const Comment = require('../models/Comment');   // 确保路径正确
const authenticateToken = require('../middleware/authenticateToken'); // 确保路径正确

// 获取所有博客文章 (支持分页)
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3; // 与前端 postsPerPage 一致或设为默认值
    const skipIndex = (page - 1) * limit;

    try {
        const totalPosts = await BlogPost.countDocuments();
        const posts = await BlogPost.find()
            .populate('author', 'username')
            .sort({ date: -1 })
            .limit(limit)
            .skip(skipIndex);

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts
        });
    } catch (err) {
        console.error('Error fetching posts with pagination:', err);
        res.status(500).json({ message: err.message });
    }
});

// 创建新博客文章 (示例，需要认证)
router.post('/', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const post = new BlogPost({
        title,
        content,
        author: req.user.userId // 从 authenticateToken 中间件获取
    });
    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 获取单篇博客文章
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'username');
    if (post == null) {
      return res.status(404).json({ message: 'Cannot find post' });
    }
    res.json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// 获取某篇文章的所有评论
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).sort({ date: -1 }).populate('author', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 为某篇文章创建新评论
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  const userId = req.user.userId; // 从 authenticateToken 中间件获取

  // 增加日志记录，检查接收到的数据
  console.log(`Attempting to create comment for post ${postId} by user ${userId}`);
  console.log(`Comment content: ${content}`);

  if (!content) {
    console.error('Comment content is missing');
    return res.status(400).json({ message: '评论内容不能为空' });
  }

  if (!userId) {
    // 此情况理论上会被 authenticateToken 拦截，但作为额外检查
    console.error('User ID is missing after authentication');
    return res.status(401).json({ message: '用户未授权或认证失败' });
  }

  const comment = new Comment({
    content,
    post: postId, // 修改这里，将 postId 赋值给 post 字段
    author: userId 
  });

  try {
    const newComment = await comment.save();
    console.log('Comment saved successfully:', newComment);
    // 填充作者信息再返回
    const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
    res.status(201).json(populatedComment);
  } catch (err) {
    // 增加更详细的错误日志
    console.error('Error saving comment:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.errors) {
        console.error('Validation errors:', err.errors);
    }
    res.status(400).json({ message: '创建评论失败，请检查提交的数据或联系管理员。', error: err.message });
  }
});

// 更新博客文章
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;

    // 查找文章
    let post = await BlogPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: '找不到指定的文章' });
    }

    // 可选：检查用户是否有权限编辑这篇文章
    // 例如，如果只有文章作者可以编辑
    // if (post.author.toString() !== req.user.userId) {
    //   return res.status(403).json({ message: '您没有权限编辑这篇文章' });
    // }

    // 更新文章内容
    post.title = title;
    post.content = content;
    // 如果有其他字段需要更新，也在这里设置
    // post.lastModified = Date.now(); // 例如，更新最后修改时间

    const updatedPost = await post.save();
    
    // 返回更新后的文章数据，前端会用这个数据进行跳转和更新列表
    res.json(updatedPost);

  } catch (err) {
    console.error('更新文章时发生错误:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: '更新失败，请检查输入内容。', errors: err.errors });
    }
    res.status(500).json({ message: '服务器错误，更新文章失败' });
  }
});

// 删除博客文章
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '找不到指定的文章' });
    }

    // 可选：检查用户是否有权限删除这篇文章
    // 例如，如果只有文章作者可以删除
    // if (post.author.toString() !== req.user.userId) {
    //   return res.status(403).json({ message: '您没有权限删除这篇文章' });
    // }

    await BlogPost.findByIdAndDelete(req.params.id);
    // 或者使用 post.remove() 如果你的 Mongoose 版本支持且你更倾向于实例方法
    // await post.remove();

    // 删除成功后，也需要删除与该文章相关的评论
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: '文章及相关评论已成功删除' });
  } catch (err) {
    console.error('删除文章时发生错误:', err);
    res.status(500).json({ message: '服务器错误，删除文章失败' });
  }
});

module.exports = router;