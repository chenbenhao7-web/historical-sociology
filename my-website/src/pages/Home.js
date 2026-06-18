import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Box,
  Fade,
  Zoom,
  Link,
  Paper,
  Typography
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  VideoLibrary as VideoIcon,
  Book as BookIcon,
  MusicNote as MusicIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
  Cases as CasesIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import ImageCarousel from '../components/ImageCarousel';
import '../styles/Home.css';
import Navbar from '../components/Navbar';

import ImageUploader from '../components/ImageUploader';

function Home() {

  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const response = await fetch('/api/carousel');
        if (!response.ok) {
          throw new Error('获取轮播图片失败');
        }
        const images = await response.json();
        // 在这里添加一个 console.log 打印原始的 images 数据，以便确认字段名
        console.log('Raw images from backend:', images);
        const processedImages = images.map(image => {
          let path = image.path || '';
          // 检查 path 是否以 /public 开头
          if (path.startsWith('/public')) {
            // 如果是，则直接使用，但要确保前面只有一个 / (如果 path 是 /public/uploads...)
            // 或者如果 path 是 public/uploads... (没有开头的 /)，则补上
            path = path.startsWith('/') ? path : '/' + path;
            return {
              ...image,
              url: `${path}`
            };
          } else {
            // 如果不是，则添加 /public，并确保 path 以 / 开头
            path = path.startsWith('/') ? path : '/' + path;
            return {
              ...image,
              url: `/public${path}`
            };
          }
        });
        setCarouselImages(processedImages);
        console.log('Processed Carousel Images:', processedImages); // <--- 新增的 console.log
      } catch (error) {
        console.error('获取轮播图片时出错:', error);
      }
    };
  
    fetchCarouselImages();
  }, []);

  const handleAddImage = (newImage) => {
    setCarouselImages([...carouselImages, newImage]);
  };

  const handleDeleteImage = async (index) => {
    try {
      const imageToDelete = carouselImages[index];
      const imageId = imageToDelete._id;
      console.log('Deleting image with ID:', imageId); // <--- 新增的 console.log

      const response = await fetch(`/api/carousel/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('删除图片失败');
      }

      const newImages = carouselImages.filter((_, i) => i !== index);
      setCarouselImages(newImages);
    } catch (error) {
      console.error('删除图片时出错:', error);
      alert('删除图片失败，请重试');
    }
  };

  const features = [
    {
      title: '历史时间线',
      description: '探索历史事件的发展脉络，了解历史社会学的重要时刻。',
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      path: '/timeline',
      delay: 0
    },
    {
      title: '教学视频',
      description: '观看历史社会学相关的教学视频和讲座。',
      icon: <VideoIcon sx={{ fontSize: 40 }} />,
      path: '/teaching-video',
      delay: 100
    },
    {
      title: '学术博客',
      description: '阅读和分享历史社会学研究的见解与观点。',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      path: '/blog',
      delay: 200
    },
    {
      title: '量化案例',
      description: '专注可视化量化演示，体验科学内涵。',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/quantitative',
      delay: 300
    }
  ];

  return (
    <div>
      <Navbar 
        title="历史社会学教学网站，本皓演示" 
        icon={PersonIcon} 
        buttonText="首页"
      />

      <ImageCarousel images={carouselImages} />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* 欢迎区域 */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              className="fade-in-up"
              sx={{ fontWeight: 'bold' }}
            >
              欢迎来到历史社会学
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              paragraph
              className="fade-in-up"
              sx={{ animation: 'fadeInUp 0.6s ease-out 0.3s forwards' }}
            >
              探索历史与社会的深层联系，理解人类社会的发展规律
            </Typography>
          </Box>
        </Fade>

        {/* 功能卡片区域 */}
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Zoom in={true} style={{ transitionDelay: `${feature.delay}ms` }}>
                <Card 
                  className="feature-card"
                  onClick={() => window.location.href = feature.path}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      transition: 'transform 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2" 
                      align="center"
                      className="feature-title"
                    >
                      {feature.title}
                    </Typography>
                    <Typography align="center">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      <ImageUploader
        onAddImage={handleAddImage}
        images={carouselImages}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}

export default Home;
