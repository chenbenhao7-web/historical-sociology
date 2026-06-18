import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { format } from 'date-fns';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Content-Type:', contentType);
          throw new Error('服务器返回了非JSON格式的数据');
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('JSON解析错误:', jsonError);
          throw new Error('无法解析服务器返回的数据');
        }

        if (!data) {
          throw new Error('未找到文章数据');
        }

        setPost(data);

        // 获取评论数据
        const commentsResponse = await fetch(`/api/posts/${id}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error('获取文章详情时出错:', error);
        setError(error.message || '获取文章失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    } else {
      setError('无效的文章ID');
      setLoading(false);
    }
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // 从 localStorage 获取 token
      if (!token) {
        alert('用户未登录，请先登录后再评论！');
        // 可以选择跳转到登录页面
        // navigate('/login'); 
        return;
      }

      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 添加 Authorization header
        },
        body: JSON.stringify({
          content: newComment,
          // author: '匿名用户' // 后端会从token中获取userId，所以author字段可以移除或保留（如果需要前端指定）
        })
      });

      if (!response.ok) {
        throw new Error('发表评论失败');
      }

      const newCommentData = await response.json();
      setComments([newCommentData, ...comments]);
      setNewComment(''); // 清空评论输入框
      alert('评论发表成功！');
    } catch (error) {
      console.error('发表评论时出错:', error);
      alert(error.message || '发表评论失败，请重试');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || '文章未找到'}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/blog')}
          startIcon={<ArrowBackIcon />}
        >
          返回博客列表
        </Button>
      </Container>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2000&q=80")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        zIndex: 1
      }} />

      <AppBar position="fixed" sx={{ zIndex: 1200, backgroundColor: '#2c3e50' }}>
        <Toolbar>
          <Button 
            color="inherit" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/blog')}
            sx={{ mr: 2 }}
          >
            返回
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            文章详情
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                {post.title}
              </Typography>
              
              <Box sx={{ mb: 3, color: 'text.secondary' }}>
                <Typography variant="body2">
                  发布于 {format(new Date(post.date), 'yyyy-MM-dd HH:mm:ss')}
                  {post.lastEdited && (
                    <span> · 最后编辑于 {format(new Date(post.lastEdited), 'yyyy-MM-dd HH:mm:ss')}</span>
                  )}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 88 }}>
              <Typography variant="h6" gutterBottom>
                评论区
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="写下你的评论..."
                  variant="outlined"
                  sx={{ mb: 2 }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSubmitComment}
                >
                  发表评论
                </Button>
              </Box>
              <List sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                {comments.map((comment) => (
                  <React.Fragment key={comment._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>{comment.author[0].toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.author}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mb: 1 }}
                            >
                              {comment.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(comment.date), 'yyyy-MM-dd HH:mm:ss')}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {comments.length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    暂无评论
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}


export default BlogPost;
