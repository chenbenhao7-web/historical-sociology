import React, { useState, useEffect, useRef } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { 
  Paper, 
  Typography, 
  Container, 
  Box, 
  Fade,
  AppBar,
  Toolbar,
  Button,
  Fab,
  Zoom
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Public as PublicIcon,
  Brush as BrushIcon,
  Church as ChurchIcon,
  Factory as FactoryIcon,
  ElectricBolt as ElectricIcon,
  Computer as ComputerIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  BoltOutlined,
  ElectricMeter,
  ElectricBoltOutlined,
  Electrical,
  ElectricalServices,
  Power,
  FlashOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const timelineData = [
  {
    period: '萌芽简单协作时期（14-16 世纪）',
    color: "#c41e3a",
    icon: <PublicIcon />,
    image: '/image/mengyaqi.png', // <--- 修改这里
    events: [
      {
        title: "新航路开辟",
        content: "15 世纪末到 16 世纪初，迪亚士、哥伦布、达・伽马、麦哲伦等航海家开辟了新航路，使世界开始连成一个整体，世界市场初步形成。"
      },
      {
        title: "早期殖民扩张",
        content: "葡萄牙、西班牙等国率先进行殖民扩张，掠夺大量财富，为资本主义发展积累了原始资本。"
      },
      {
        title: "文艺复兴",
        content: "14 到 16 世纪，从意大利开始的文艺复兴运动，促进了人们思想的解放，推动了欧洲文化思想领域的繁荣。"
      },
      {
        title: "宗教改革",
        content: "16 世纪，马丁・路德、加尔文等发起的宗教改革运动，打破了天主教会的精神束缚。"
      }
    ]
  },
  {
    period: "兴起工场手工业时期（17-19 世纪初期）",
    color: "#1e88e5",
    icon: <BrushIcon />,
    image: '/image/gongchangshougongye.png', // <--- 修改这里
    events: [
      {
        title: "早期资产阶级革命",
        content: "17 世纪中期的英国资产阶级革命，18 世纪的美国独立战争，18 世纪末的法国大革命等重大革命事件。"
      },
      {
        title: "资产阶级政治体制",
        content: "18 世纪末的法国大革命，摧毁了法国的君主统治，传播了资产阶级自由民主思想。"
      },
      {
        title: "欧洲封建国家改革",
        content: "普鲁士腓特烈二世改革、俄国彼得一世改革等，增强了国家实力。"
      },
      {
        title: "启蒙运动",
        content: "17-18 世纪，欧洲的启蒙运动，为资产阶级革命提供了思想武器和理论指导。"
      }
    ]
  },
  {
    period: "发展蒸汽时代（19 世纪初 - 1870 年）",
    color: "#43a047",
    icon: <FactoryIcon />,
    image: '/image/steamtime.png',
    events: [
      {
        title: "工业革命",
        content: '18 世纪 60 年代从英国开始，使人类进入"蒸汽时代"，资本主义经济迅速发展。'
      },
      {
        title: "资产阶级革命与改革运动",
        content: '19 世纪 60 年代，美国内战维护了国家统一，废除了奴隶制，为美国资本主义发展扫清了障碍；俄国 1861 年农奴制改革和日本明治维新，使两国走上了资本主义发展道路；意大利和德国通过王朝战争等方式实现了统一，促进了资本主义的发展。'
      },
      {
        title: "社会主义运动",
        content: '1848 年《共产党宣言》的发表，1864 年第一国际成立；1871 年巴黎公社革命。'
      },
      {
        title: "民族解放运动",
        content: "亚洲革命风暴兴起，如印度民族大起义等，沉重打击了西方殖民统治。"
      }
    ]
  },
  {
    period: "成熟电气化时代前期（1870 年 - 1917 年）",
    color: "#fb8c00",
    icon: <FlashOn />,
    image: '/image/Etimeqianqi.png',
    events: [
      {
        title: "第二次工业革命",
        content: '19 世纪 70 年代开始的第二次工业革命，使人类进入 "电气时代"，推动主要资本主义国家向垄断资本主义过渡。'
      },
      {
        title: "垄断组织产生",
        content: '生产和资本高度集中，产生了垄断组织，如美国的托拉斯、德国的卡特尔等，资本主义由自由竞争阶段进入垄断阶段。'
      },
      {
        title: "列强瓜分世界",
        content: '主要资本主义国家加紧对外侵略扩张，掀起瓜分世界的高潮，世界被瓜分殆尽，资本主义世界市场最终形成。'
      },
      {
        title: "一战爆发",
        content: "1914-1918 年，资本主义经济政治发展不平衡加剧，导致第一次世界大战爆发。"
      }
    ]
  },
  {
    period: "发展电气化时代后期（1918 年 - 1945 年）",
    color: "#A52A2A",
    icon: <ElectricIcon />,
    image: '/image/Etimehouqi.png',
    events: [
      {
        title: "战后初期",
        content: '1918-1923 年，一战给欧洲资本主义国家造成严重破坏，美国开始取代英国掌握世界经济霸权。'
      },
      {
        title: "美德崛起",
        content: '1923-1929 年，资本主义经济复苏，相对稳定繁荣，美国掌握资本主义世界经济霸权，德国经济重新崛起。'
      },
      {
        title: "大萧条时期",
        content: '1929-1939 年，1929-1933 年爆发世界经济大危机，各国纷纷采取措施应对，美国实行罗斯福新政，德、日等国走上法西斯道路，对外侵略扩张。'
      },
      {
        title: "二战时期",
        content: "1939-1945 年，二战爆发，法西斯与反法西斯的矛盾成为世界主要矛盾。"
      }
    ]
  },
  {
    period: "进一步发展信息时代、知识经济时代（1945 年 - 至今）",
    color: "#8e24aa",
    icon: <ComputerIcon />,
    image: '/image/infortime.png',
    events: [
      {
        title: "战后初期",
        content: "1945-1950 年，西欧、日本经济快速复苏并达到战前水平，美国掌握世界经济霸权。"
      },
      {
        title: "美日欧三足",
        content: "1950-1955 年，主要资本主义国家经济高速增长，经济发展不平衡加强，西德、日本经济崛起，经济格局由美国独霸发展为美日欧三足鼎立。"
      },
      {
        title: '"滞胀"阶段',
        content: '1973-80 年代初：经济停滞与通货膨胀相互交织，进入"滞胀"阶段。'
      },
      {
        title: "克林顿时期",
        content: "1980-90 年代初：经济回升并增长。"
      },
      {
        title: "数字革命",
        content: "90 年代后，经济全球化和区域经济集团化趋势加强，知识经济兴起。。"
      }
    ]
  }
];

function Timeline() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [timelineLeft, setTimelineLeft] = useState(0);
  const timelineRef = useRef(null);
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    const updateTimelinePosition = () => {
      if (timelineRef.current) {
        const timelineIcon = timelineRef.current.querySelector('.vertical-timeline-element-icon');
        if (timelineIcon) {
          const rect = timelineIcon.getBoundingClientRect();
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          setTimelineLeft(rect.left + scrollLeft);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateTimelinePosition);
    
    // 初始化时获取位置
    setTimeout(updateTimelinePosition, 100); // 给时间线组件一点时间来渲染

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateTimelinePosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      backgroundImage: 'url("/image/萌芽期.png")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      position: 'relative'
    }} ref={timelineRef}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        zIndex: 1
      }} />
      <Navbar 
        title="历史时间线" 
        icon={ArrowBackIcon} 
        buttonText="返回首页"
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ pt: 4, pb: 8 }}>
          <Fade in={true} timeout={1000}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ 
                mb: 6,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
               资本主义发展时间线
            </Typography>
          </Fade>

          <VerticalTimeline>
            {timelineData.map((period, index) => (
              <VerticalTimelineElement
                key={index}
                className="vertical-timeline-element--work"
                contentStyle={{ 
                  background: '#fff',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                  borderRadius: '15px'
                }}
                contentArrowStyle={{ borderRight: `7px solid #fff` }}
                date={
                  <Button
                    variant="contained"
                    onMouseEnter={() => setHoveredPeriod(index)}
                    onMouseLeave={() => setHoveredPeriod(null)}
                    sx={{
                      backgroundColor: period.color,
                      color: '#fff',
                      boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .12)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '2px solid white',
                      marginTop: '-10px',
                      '@media (max-width: 1169px)': {
                        marginTop: '5px'
                      },
                      '&:hover': {
                        backgroundColor: period.color,
                        opacity: 0.9,
                        transform: 'scale(1.02)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                    disableRipple
                  >
                    {period.period}
                  </Button>
                }
                iconStyle={{ background: period.color, color: '#fff' }}
                icon={period.icon}
              >
                <Paper elevation={0} sx={{ p: 2 }}>
                  {period.events.map((event, eventIndex) => (
                    <Box key={eventIndex} sx={{ mb: eventIndex !== period.events.length - 1 ? 3 : 0 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          color: period.color,
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {event.content}
                      </Typography>
                    </Box>
                  ))}
                </Paper>

                <Box
                  sx={{
                    position: 'absolute',
                    ...(index % 2 === 0 ? {
                      right: 'calc(-100% - 50px)',
                    } : {
                      left: 'calc(-100% - 50px)',
                    }),
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '400px',
                    height: '400px',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    opacity: hoveredPeriod === index ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 10
                  }}
                >
                  <img
                    src={period.image}
                    alt={period.period}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: hoveredPeriod === index ? 'scale(1)' : 'scale(1.1)',
                      transition: 'transform 0.3s ease-in-out',
                    }}
                  />
                </Box>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </Box>
      </Container>

      <Zoom in={showScrollTop}>
        <Fab 
          color="primary" 
          size="large"
          onClick={scrollToTop}
          sx={{ 
            position: 'fixed',
            bottom: 20,
            left: timelineLeft,
            transform: 'none',
            zIndex: 1002,
            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
            transition: 'all 0.3s ease-in-out',
            width: 62,
            height: 62,
            minHeight: 'auto',
            border: '4px solid white',
            backgroundColor: '#3f51b5',
            '& .MuiSvgIcon-root': {
              fontSize: 60
            },
            '&:hover': {
              backgroundColor: '#303f9f',
              border: '4px solid white',
            }
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </div>
  );
}

export default Timeline;
