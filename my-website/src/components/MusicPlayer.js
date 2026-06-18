import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import '../styles/MusicPlayer.css';  
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  QueueMusic as QueueMusicIcon,
  Repeat as RepeatIcon,
  RepeatOne as RepeatOneIcon,
  Shuffle as ShuffleIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
} from '@mui/icons-material';
import musicList from '../data/musicList';

function MusicPlayer() {
  const navigate = useNavigate();
  const [songs] = useState(musicList);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaylistOpen, setPlaylistOpen] = useState(false);
  const [playMode, setPlayMode] = useState('sequence');
  const playerRef = useRef(null);

  useEffect(() => {
    if (!currentSong && songs.length > 0) {
      setCurrentSong(songs[0]);
    }
  }, [songs, currentSong]);

  // 处理播放模式改变
  const handlePlayModeChange = (event, newMode) => {
    if (newMode !== null) {
      setPlayMode(newMode);
    }
  };

  // 处理歌曲结束
  const handleSongEnd = () => {
    if (playMode === 'single' && playerRef.current) {
      playerRef.current.audio.current.play();
      return;
    }

    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    let nextIndex;
    
    if (playMode === 'random') {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }

    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);
  };

  // 处理歌曲选择
  const handleSongSelect = (song) => {
    setCurrentSong(song);
    setPlaylistOpen(false);
    navigate(`/blog/${song.id}`);
  };

  // 处理上一首
  const handlePrevious = (e) => {
    e.preventDefault(); // 阻止默认导航行为
    if (!currentSong) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    let prevIndex;
    
    if (playMode === 'random') {
      prevIndex = Math.floor(Math.random() * songs.length);
    } else {
      prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    }

    const prevSong = songs[prevIndex];
    setCurrentSong(prevSong);
  };

  // 处理下一首
  const handleNext = (e) => {
    e.preventDefault(); // 阻止默认导航行为
    if (!currentSong) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    let nextIndex;
    
    if (playMode === 'random') {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }

    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: '380px',
          zIndex: 1000,
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            backgroundImage: 'url("/image/2308af810165e3df94c3bab9277b3cf3_XTbLZ4M3vFxy3WFHB66Ja9qL.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            p: 2,
            borderRadius: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)', // 添加半透明遮罩
              borderRadius: 'inherit',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ 
                mb: 1,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)' // 添加文字阴影提高可读性
              }}>
                {currentSong ? currentSong.title : '没有正在播放的音乐'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => setPlaylistOpen(true)}
                    sx={{ color: 'white' }}
                  >
                    <QueueMusicIcon />
                  </IconButton>
                </motion.div>
                <ToggleButtonGroup
                  value={playMode}
                  exclusive
                  onChange={handlePlayModeChange}
                  size="small"
                  sx={{ 
                    '& .MuiToggleButton-root': { 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '4px',
                      '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }
                    }
                  }}
                >
                  <ToggleButton value="sequence" aria-label="顺序播放">
                    <RepeatIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="single" aria-label="单曲循环">
                    <RepeatOneIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="random" aria-label="随机播放">
                    <ShuffleIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            {currentSong && (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.25)',  // 更透明的背景
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  '& .rhap_container': {  // 修改播放器容器样式
                    background: 'transparent',
                    boxShadow: 'none'
                  }
                }}
              >
                <AudioPlayer
                  ref={playerRef}
                  src={currentSong.url}
                  autoPlay
                  showSkipControls={true}
                  showJumpControls={false}
                  onClickPrevious={handlePrevious}
                  onClickNext={handleNext}
                  onEnded={handleSongEnd}
                  autoPlayAfterSrcChange={true}
                  loop={playMode === 'single'}
                  layout="stacked"
                  showFilledVolume={true}
                  customControlsSection={[
                    'MAIN_CONTROLS',
                    'VOLUME_CONTROLS'
                  ]}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>
      <Drawer
        anchor="right"
        open={isPlaylistOpen}
        onClose={() => setPlaylistOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            播放列表
          </Typography>
          <List>
            {songs.map((song) => (
              <ListItem
                key={song.id}
                disablePadding
                sx={{
                  bgcolor: currentSong?.id === song.id ? 'action.selected' : 'transparent'
                }}
              >
                <ListItemButton onClick={() => handleSongSelect(song)}>
                  <ListItemText 
                    primary={song.title}
                    secondary={song.artist}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default MusicPlayer;
