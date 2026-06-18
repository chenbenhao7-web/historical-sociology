import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import LoginDialog from './LoginDialog';

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

  .button-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #3498db;
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
    box-shadow: 4px 4px 0 #1d2b3a;
  }

  &:active .button-box {
    transform: translate(0);
    box-shadow: none;
  }
`;

function Navbar({ title, icon: Icon, buttonText }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const handleLoginStatusChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };

    window.addEventListener('loginStatusChanged', handleLoginStatusChange);
    window.addEventListener('storage', handleLoginStatusChange);

    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginStatusChange);
      window.removeEventListener('storage', handleLoginStatusChange);
    };
  }, []);

  const handleClick = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = (success) => {
    setLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // 触发自定义事件，通知其他组件用户已登出
    const event = new Event('loginStatusChanged');
    window.dispatchEvent(event);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ 
        zIndex: 2,
        backgroundColor: '#2c3e50'
      }}>
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            {location.pathname === '/' ? (
              user ? (
                <StyledButton 
                  onClick={handleLogout}
                  aria-label="退出登录"
                  sx={{
                    '& .button-box': {
                      background: '#3498db',
                    },
                    '&:hover .button-box': {
                      background: '#2980b9',
                    }
                  }}
                >
                  <div className="button-box">
                    <span className="button-elem">
                      <span className="button-text">{user.username} (登出)</span>
                    </span>
                  </div>
                </StyledButton>
              ) : (
                <StyledButton 
                  onClick={handleClick}
                  aria-label="登录"
                  sx={{
                    '& .button-box': {
                      background: '#3498db',
                    },
                    '&:hover .button-box': {
                      background: '#2980b9',
                    }
                  }}
                >
                  <div className="button-box">
                    <span className="button-elem">
                      <LoginIcon sx={{ fontSize: 20 }} />
                      <span className="button-text">登录</span>
                    </span>
                  </div>
                </StyledButton>
              )
            ) : (
              <StyledButton 
                onClick={() => navigate('/')}
                aria-label="返回首页"
                sx={{
                  '& .button-box': {
                    background: '#3498db',
                  },
                  '&:hover .button-box': {
                    background: '#2980b9',
                  }
                }}
              >
                <div className="button-box">
                  <span className="button-elem">
                    {Icon && <Icon sx={{ fontSize: 20 }} />}
                    <span className="button-text">{buttonText || '返回首页'}</span>
                  </span>
                </div>
              </StyledButton>
            )}
          </Toolbar>
        </motion.div>
      </AppBar>
      <LoginDialog open={loginOpen} onClose={handleLoginClose} />
    </>
  );
}

export default Navbar;