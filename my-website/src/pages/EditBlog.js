import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Send as SendIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/EditBlog.css';

function EditBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // 获取文章列表
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('获取文章列表时出错:', error);
      }
    };

    fetchArticles();
  }, []);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请填写文章标题和内容');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('发布文章失败');
      }

      const newArticle = await response.json();
      setArticles([newArticle, ...articles]);
      setTitle('');
      setContent('');
      alert('文章发布成功！');
    } catch (error) {
      console.error('发布文章时出错:', error);
      alert('发布文章失败，请重试');
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch(`/api/posts/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('删除文章失败');
      }

      setArticles(articles.filter(article => article._id !== articleId));
      alert('文章已删除');
    } catch (error) {
      console.error('删除文章时出错:', error);
      alert('删除文章失败，请重试');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            撰写新文章
          </Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handlePublish}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.25)',
              },
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.15)',
            }}
          >
            发布文章
          </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            autoComplete="new-password"
            inputProps={{
              autoComplete: 'new-password',
              form: {
                autoComplete: 'off',
              },
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            fullWidth
            label="文章内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            multiline
            rows={10}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>
      </Paper>

      {/* 已发布文章列表部分 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
          已发布的文章
        </Typography>
        {articles.map((article) => (
          <Box
            key={article._id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="h6">
                {article.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                发布于: {new Date(article.date).toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(article._id)}
                >
                  删除
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default EditBlog;