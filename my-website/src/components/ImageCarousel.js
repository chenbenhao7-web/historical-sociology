import React, { useState, useEffect } from 'react';
import { Paper, Box, MobileStepper, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

function ImageCarousel({ images }) {
  console.log('Images received in ImageCarousel:', images); // <--- 新增的 console.log
  const [activeStep, setActiveStep] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const maxSteps = images.length;

  useEffect(() => {
    // 重置图片加载状态
    setImagesLoaded({});
    // 预加载所有图片
    images.forEach((item, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [index]: true }));
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${item.url}`);
        setImagesLoaded(prev => ({ ...prev, [index]: false }));
      };
      img.src = item.url;
    });
  }, [images]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
  };

  // 自动轮播
  useEffect(() => {
    if (maxSteps <= 1) return; // 只有一张或没有图片时不需要轮播

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [maxSteps]);

  if (maxSteps === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: '400px', position: 'relative', bgcolor: 'background.paper' }}>
      <Paper
        square
        elevation={0}
        sx={{
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.5s ease-in-out'
        }}
      >
        {images.map((item, index) => (
          <Box
            key={index}
            sx={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              opacity: index === activeStep ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }}
          >
            {imagesLoaded[index] && (
              <>
                <img src={item.url} alt={item.title} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    textAlign: 'center',
                    color: 'white'
                  }}
                >
                  <h2 style={{ margin: '10px 0' }}>{item.title}</h2>
                  <p style={{ margin: '0 0 10px 0' }}>{item.description}</p>
                </Box>
              </>
            )}
          </Box>
        ))}
      </Paper>

      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          background: 'transparent'
        }}
        nextButton={(
          <Button
            size="small"
            onClick={handleNext}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <KeyboardArrowRight />
          </Button>
        )}
        backButton={(
          <Button
            size="small"
            onClick={handleBack}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <KeyboardArrowLeft />
          </Button>
        )}
      />
    </Box>
  );
}

export default ImageCarousel;
// ...existing code ...
