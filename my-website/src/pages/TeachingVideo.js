import React, { useState } from 'react';
import { Box, Container, Typography, Paper, IconButton, Grid, List, ListItem, ListItemText, ListItemButton, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';

// 添加样式
const StyledButton = styled('button')`
  position: relative;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  width: 150px;
  height: 40px;
  margin-bottom: 24px;

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

// 在文件顶部的样式部分添加新的样式组件
const StyledListButton = styled(ListItemButton)`
  position: relative;
  margin: 4px;
  padding: 8px !important;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2c3e50;
    border-radius: 5px;
    transition: all .3s ease;
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
  }

  &:hover::before {
    transform: translate(-4px, -4px);
    background: #3498db;
    box-shadow: 4px 4px 0 #2c3e50;
  }

  &:active::before {
    transform: translate(0);
    box-shadow: none;
  }

  &.selected::before {
    background: #3498db;
    transform: translate(-4px, -4px);
    box-shadow: 4px 4px 0 #2c3e50;
  }
`;

function TeachingVideo() {
  const navigate = useNavigate();
  
  // 视频列表数据
  const videoList = [
    {
      id: 'BV1nL4y1u7wT',
      title: '什么是历史社会学？',
      description: '《历史社会学的逻辑》系列讲解（No.1）'
    },
    {
      id: 'BV1hR4y1p79c',
      title: '浅谈历史社会学',
      description: '社会理论青年第9讲-傅思颖'
    },
    {
      id: 'BV1AA411T795',
      title: '文科生如何快速入门研究领域',
      description: '历史学、政治学、社会学、美学入门指南'
    },
    {
      id: 'BV1k14y1e733',
      title: '西方社会学理论串讲',
      description: '古典时期：孔德/涂尔干/韦伯/齐美尔'
    },
    {
      id: 'BV1kA411v7Uv',
      title: '历史研究与社会学的想象力',
      description: '应星教授讲座'
    },
    {
      id: 'BV1w54y1k7A7',
      title: '现代转型史的多维视角',
      description: '历史学、社会学、人类学视野下的现代转型史'
    },
    {
      id: 'BV1ok4y1L7Kx',
      title: '精英的反叛',
      description: '研究中国的历史社会学路径'
    },
    {
      id: 'BV1pU4y1V7HF',
      title: '失败者社会学',
      description: '台大李明璁教授讲授 sociology of/for losers'
    }
  ];

  // 添加视频切换功能
  const [currentVideo, setCurrentVideo] = useState(videoList[0]);

  // 添加完整链接处理函数
  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    // 如果需要在新窗口打开完整B站页面，可以添加：
    // window.open(`https://www.bilibili.com/video/${video.id}`, '_blank');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5', // 浅灰色背景
      pt: 2 
    }}>
      <Navbar 
        title="教学视频" 
        icon={ArrowBackIcon} 
        buttonText="返回首页"
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ minHeight: '700px' }}>
          {/* 左侧视频播放区域 */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: '#2c3e50',
                  borderBottom: '2px solid #3498db',
                  pb: 2
                }}
              >
                历史社会学教学视频
              </Typography>
              
              {/* 视频播放器 */}
              <Box sx={{ 
                position: 'relative',
                paddingTop: '56.25%',
                width: '100%',
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  src={`https://player.bilibili.com/player.html?bvid=${currentVideo.id}&page=1`}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: '#2c3e50',
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  {currentVideo.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#34495e',
                    lineHeight: 1.6
                  }}
                >
                  {currentVideo.description}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* 右侧视频列表 */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#2c3e50',
                color: '#fff'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  课程目录
                </Typography>
              </Box>
              <List 
                sx={{ 
                  p: 1,
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 'calc(100% - 60px)'
                }}
              >
                {videoList.map((video, index) => (
                  <ListItem 
                    key={index} 
                    disablePadding
                    sx={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      mb: 0
                    }}
                  >
                    <StyledListButton 
                      onClick={() => handleVideoSelect(video)}
                      className={currentVideo.id === video.id ? 'selected' : ''}
                      sx={{
                        width: '100%',
                        height: '90%',
                        my: 0.5
                      }}
                    >
                      <div className="content-wrapper">
                        <PlayArrowIcon sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.95rem',
                              color: 'inherit',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {video.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.8rem',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {video.description}
                          </Typography>
                        </Box>
                      </div>
                    </StyledListButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default TeachingVideo;