import React, { useState, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function ImageUploader({ onAddImage, images, onDeleteImage }) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('token') !== null);
    };

    // 监听storage变化
    window.addEventListener('storage', checkLoginStatus);
    // 添加自定义事件监听器
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('token') !== null);
    };

    // 监听storage变化
    window.addEventListener('storage', checkLoginStatus);
    // 添加自定义事件监听器
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async () => {
    if (!isLoggedIn) {
      return;
    }
  
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', imageTitle || '新增图片');
        formData.append('description', imageDescription || '自定义描述');

        const response = await fetch('/api/carousel', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '上传失败');
        }

        const savedImage = await response.json();
        // 构造正确的图片对象格式
        const newImage = {
          url: `${savedImage.url}`,
          title: savedImage.title,
          description: savedImage.description
        };
        onAddImage(newImage);
        setOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
        setImageTitle('');
        setImageDescription('');
      } catch (error) {
        console.error('上传图片失败:', error);
        alert(error.message || '上传图片失败，请重试');
      }
    }
  };
  
  // 如果用户未登录，不显示上传按钮
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
  
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogTitle>上传轮播图片</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span">
                选择图片
              </Button>
            </label>
          </Box>
          
          {previewUrl && (
            <>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  预览：
                </Typography>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
              </Box>
  
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="图片标题"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="请输入图片标题"
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  label="图片描述"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="请输入图片描述"
                />
              </Box>
            </>
          )}
  
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              当前轮播图片：
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {images.map((image, index) => (
                <Box 
                  key={index}
                  sx={{ position: 'relative' }}
                >
                  <img 
                    src={image.url} 
                    alt={`Carousel ${index}`} 
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'error.dark'
                      }
                    }}
                    onClick={() => onDeleteImage(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {image.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!selectedFile}
          >
            上传
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ImageUploader;