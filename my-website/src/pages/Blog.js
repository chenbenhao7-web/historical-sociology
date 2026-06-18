import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  Grid,
  AppBar,
  Toolbar,
  Pagination,
  CircularProgress
} from '@mui/material';
import { Timeline as TimelineIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import Navbar from '../components/Navbar';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Cancel as CancelIcon } from '@mui/icons-material';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }, { 'align': [] }],
    ['link', 'image', 'video', 'formula'],
    ['clean']
  ]
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'link', 'image', 'video', 'formula'
];

// 添加新的样式组件
const StyledPublishButton = styled('button')`
  position: relative;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  width: 150px;
  height: 40px;

  .button-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2c3e50;
    border-radius: 5px;
    transition: all .3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-elem {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    transition: all .3s ease;
  }

  .button-text {
    font-size: 16px;
  }

  &:hover .button-box {
    transform: translate(-4px, -4px);
    background: #3498db;
    box-shadow: 4px 4px 0 #2c3e50;
  }

  &:active .button-box {
    transform: translate(0);
    box-shadow: none;
  }
`;

const StyledButton = styled(Button)`
  position: relative;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  width: 150px;
  height: 40px;

  .button-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2c3e50;
    border-radius: 5px;
    transition: all .3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-elem {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    transition: all .3s ease;
  }

  .button-text {
    font-size: 16px;
  }

  &:hover .button-box {
    transform: translate(-4px, -4px);
    background: #3498db;
    box-shadow: 4px 4px 0 #2c3e50;
  }

  &:active .button-box {
    transform: translate(0);
    box-shadow: none;
  }
`;

const postsPerPage = 3; // 每页显示的文章数量

function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (postId) => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '删除文章失败');
      }

      setPosts(posts.filter(post => post._id !== postId));
      alert('文章已成功删除');
    } catch (error) {
      console.error('删除文章时出错:', error);
      alert(error.message || '删除文章失败，请重试');
    }
  };

  // 获取文章列表
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=${postsPerPage}`);
      if (!response.ok) {
        // 你可以根据后端返回的错误信息来定制这里的错误提示
        const errorData = await response.text(); // 尝试获取文本，因为可能不是JSON
        console.error('获取文章API响应错误:', response.status, errorData);
        throw new Error(`获取文章失败: ${response.status}`);
      }
      const data = await response.json();
      // 确保 data.posts 是一个数组，如果不是，则使用空数组
      setPosts(Array.isArray(data.posts) ? data.posts : []); // <--- 这里期望 data.posts
      setCurrentPage(data.currentPage || 1); // <--- 这里期望 data.currentPage
      setTotalPages(data.totalPages || 0); // <--- 这里期望 data.totalPages
      setTotalPosts(data.totalPosts || 0); // <--- 这里期望 data.totalPosts
    } catch (error) {
      console.error('获取文章时出错:', error);
      setPosts([]); // 发生任何错误时，都将 posts 设置为空数组以避免渲染错误
      // 你可能还想设置其他状态，比如 totalPages 和 totalPosts 为 0
      setCurrentPage(1);
      setTotalPages(0);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  // 处理页码变化
  const handlePageChange = (event, value) => {
    fetchPosts(value);
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (id) {
      const element = document.getElementById(`post-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [id]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2
      }
    }
  };

  const handleSubmit = async () => {
    if (title.trim() && content.trim()) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('请先登录');
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        if (editingPost) {
          const response = await fetch(`/api/posts/${editingPost._id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ title, content }),
          });

          if (!response.ok) {
            throw new Error('更新文章失败');
          }

          const updatedPost = await response.json();
          setPosts(posts.map(post => 
            post._id === editingPost._id ? updatedPost : post
          ));
          setEditingPost(null);
          navigate(`/blog/${updatedPost._id}`);
        } else {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ title, content }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '创建文章失败');
          }

          const newPost = await response.json();
          setPosts([newPost, ...posts]);
          setTitle('');
          setContent('');
          navigate(`/blog/${newPost._id}`);
        }
      } catch (error) {
        console.error('保存文章时出错:', error);
        const errorMessage = error.message || '保存文章失败，请重试';
        alert(errorMessage);
        // 在控制台输出更详细的错误信息
        console.log('错误详情:', {
          message: error.message,
          stack: error.stack,
          token: localStorage.getItem('token') ? '令牌存在' : '令牌不存在'
        });
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          zIndex: 1
        }}
      />

      <Navbar 
        title="学术博客" 
        icon={TimelineIcon} 
        buttonText="返回首页"
      />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            {/* 编辑区域 */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    {editingPost ? '编辑文章' : '撰写新文章'}
                  </Typography>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TextField
                      fullWidth
                      label="文章标题"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{ mb: 3 }}
                      autoComplete="off"
                      inputProps={{
                        autoComplete: 'off',
                        form: {
                          autoComplete: 'off',
                        },
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      formats={formats}
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </motion.div>
                  <Box sx={{ mt: 8, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {editingPost && (
                      <StyledButton 
                        onClick={() => {
                          setEditingPost(null);
                          setTitle('');
                          setContent('');
                        }}
                        aria-label="取消编辑"
                        sx={{
                          '& .button-box': {
                            background: '#e74c3c',
                          },
                          '&:hover .button-box': {
                            background: '#c0392b',
                          }
                        }}
                      >
                        <div className="button-box">
                          <span className="button-elem">
                            <CancelIcon sx={{ fontSize: 20 }} />
                            <span className="button-text">取消编辑</span>
                          </span>
                        </div>
                      </StyledButton>
                    )}
                    <StyledPublishButton 
                      onClick={handleSubmit}
                      aria-label="发布文章"
                    >
                      <div className="button-box">
                        <span className="button-elem">
                          <SendIcon sx={{ fontSize: 20 }} />
                          <span className="button-text">发布文章</span>
                        </span>
                      </div>
                    </StyledPublishButton>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* 文章列表 */}
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  已发布的文章
                </Typography>
                <AnimatePresence> {/* <--- 移除 mode="wait" 或使用 mode="popLayout" */}
                  {!loading && posts && posts.map((post, index) => (
                    <motion.div
                      key={post._id} // 每个 motion.div 都是一个子元素
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card id={`post-${post._id}`} sx={{ mb: 2, display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {post.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            发布于 {format(new Date(post.date), 'yyyy-MM-dd HH:mm:ss')}
                            {post.lastEdited && (
                              <span> · 最后编辑于 {format(new Date(post.lastEdited), 'yyyy-MM-dd HH:mm:ss')}</span>
                            )}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box 
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'break-word',
                              lineHeight: '1.5em',
                              height: '3em',
                              mb: 1,
                              '& p': {
                                margin: 0,
                                padding: 0,
                                lineHeight: 'inherit',
                                fontSize: 'inherit'
                              },
                              '& *': { 
                                lineHeight: 'inherit',
                                fontSize: 'inherit'
                              }
                            }}
                          >
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: post.content
                              }} 
                              style={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            />
                          </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/blog/${post._id}`)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              阅读
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(post)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              编辑
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(post._id)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                }
                              }}
                            >
                              删除
                            </Button>
                          </motion.div>
                        </CardActions>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!loading && posts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography>
                        还没有发布任何文章
                      </Typography>
                    </Paper>
                  </motion.div>
                )}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                      count={totalPages} 
                      page={currentPage} 
                      onChange={handlePageChange} 
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </motion.div>
            </Grid>
          </Grid>

        </motion.div>
      </Container>
      <MusicPlayer />
    </div>
  );
}

export default Blog;
