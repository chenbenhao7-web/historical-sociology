import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Button,
  Fade,
  Paper
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  Map as MazeIcon,
  ShowChart as TradeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import SnakeGame from '../components/SnakeGame';
import MazeGame from '../components/MazeGame';
import TradeGame from '../components/TradeGame';

// 添加一个通用的按钮样式
const buttonStyle = {
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    backgroundColor: 'primary.dark'
  }
};

function Quantitative() {
  const [activeDemo, setActiveDemo] = useState(null);

  const demos = [
    {
      title: '贪吃蛇',
      subtitle: '游戏演示',
      description: '通过贪吃蛇游戏演示基础的人工智能算法，展示路径规划和决策制定过程。',
      icon: <GameIcon sx={{ fontSize: 40 }}/>,
      color: '#2196F3',
      component: <SnakeGame onClose={() => setActiveDemo(null)} />
    },
    {
      title: '自动迷宫',
      subtitle: '寻址演示',
      description: '展示不同寻路算法（如 A*、Dijkstra）在迷宫环境中的表现和效率对比。',
      icon: <MazeIcon sx={{ fontSize: 40 }}/>,
      color: '#4CAF50',
      component: <MazeGame onClose={() => setActiveDemo(null)} />
    },
    {
      title: '交易游戏',
      subtitle: 'ABM演示',
      description: '基于Agent的建模模拟，展示市场参与者之间的交互和市场动态变化过程。',
      icon: <TradeIcon sx={{ fontSize: 40 }}/>,
      color: '#FF9800',
      component: <TradeGame onClose={() => setActiveDemo(null)} />
    }
  ];

  return (
    <div style={{ 
      backgroundColor: '#ffffff',
      height: '100%',
      position: 'relative'
    }}>
      <Navbar 
        title="量化案例演示" 
        icon={ArrowBackIcon}
        buttonText="返回首页"
      />

      <Container maxWidth="lg" sx={{ 
        pt: 8,
        pb: 6,
      }}>
        <Fade in={true} timeout={1000}>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              mb: 6,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            量化案例演示
          </Typography>
        </Fade>

        <Grid container spacing={4}>
          {demos.map((demo, index) => (
            <Grid item xs={12} md={4} key={demo.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: demo.component ? 'pointer' : 'default',
                    opacity: demo.component ? 1 : 0.7
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, color: demo.color }}>
                      {demo.icon}
                    </Box>
                    <Typography variant="h5" component="div" gutterBottom>
                      {demo.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {demo.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {demo.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: demo.color,
                        ...buttonStyle,
                        '&:hover': {
                          ...buttonStyle['&:hover'],
                          bgcolor: demo.color
                        }
                      }}
                      onClick={() => setActiveDemo(demo.title)}
                      disabled={!demo.component}
                    >
                      开始演示
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* 演示区域 */}
        {activeDemo && (
          <Box sx={{ mt: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3,
                  backgroundColor: 'white',
                  borderRadius: 2
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {activeDemo} 演示
                </Typography>
                {demos.find(demo => demo.title === activeDemo)?.component}
              </Paper>
            </motion.div>
          </Box>
        )}
      </Container>
    </div>
  );
}

export default Quantitative; 