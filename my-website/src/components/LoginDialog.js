import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  styled
} from '@mui/material';
import { motion } from 'framer-motion';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    margin: 0;
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 1);
    }

    &.Mui-focused {
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
  }
`;

const StyledButton = styled(Button)`
  border-radius: 8px;
  padding: 8px 24px;
  text-transform: none;
  font-size: 16px;
  transition: all 0.3s ease;

  &.MuiButton-contained {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    
    &:hover {
      background: linear-gradient(135deg, #2980b9 0%, #2472a4 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(41, 128, 185, 0.3);
    }
  }
`;

const MotionBox = motion(Box);

function LoginDialog({ open, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 保存token到localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 触发自定义事件通知登录状态变化
      window.dispatchEvent(new Event('loginStatusChanged'));

      // 重置表单
      setUsername('');
      setPassword('');
      
      // 最后关闭对话框
      onClose(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={() => onClose(false)}
      TransitionComponent={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <MotionBox
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 500,
          color: '#2c3e50',
          pb: 1
        }}>
          用户登录
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3 }}>
            {error && (
              <MotionBox
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              </MotionBox>
            )}
            <StyledTextField
              autoFocus
              margin="dense"
              label="用户名"
              type="text"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <StyledTextField
              margin="dense"
              label="密码"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
            <StyledButton 
              onClick={() => onClose(false)} 
              disabled={loading}
              variant="outlined"
              sx={{ minWidth: '120px' }}
            >
              取消
            </StyledButton>
            <StyledButton 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ minWidth: '120px' }}
            >
              {loading ? (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                </MotionBox>
              ) : '登录'}
            </StyledButton>
          </DialogActions>
        </form>
      </MotionBox>
    </StyledDialog>
  );
}

export default LoginDialog;