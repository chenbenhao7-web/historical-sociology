import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 15, y: 15 },
  { x: 15, y: 16 },
  { x: 15, y: 17 }
];

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const HIGH_SCORES_KEY = 'snakeGameHighScores';

const manhattanDistance = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

const getNeighbors = (pos, snake, gridSize) => {
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 }   // 右
  ];

  return directions
    .map(dir => ({ x: pos.x + dir.x, y: pos.y + dir.y }))
    .filter(newPos => {
      // 检查是否在网格内
      if (newPos.x < 0 || newPos.x >= gridSize || newPos.y < 0 || newPos.y >= gridSize) {
        return false;
      }
      // 检查是否会撞到蛇身
      return !snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    });
};

function SnakeGame({ onClose }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(DIRECTIONS.UP);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const gameLoopRef = useRef();

  // 添加高分状态
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem(HIGH_SCORES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 在组件内添加一个记录最近移动的数组
  const [recentMoves, setRecentMoves] = useState([]);
  const MOVES_TO_CHECK = 8; // 检查最近8步移动

  // 修改更新高分的函数
  const updateHighScores = useCallback((newScore) => {
    // 获取当前日期和时间
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // 创建新的分数记录
    const newScoreRecord = {
      score: newScore,
      date: dateStr,
      time: timeStr
    };

    // 合并现有分数和新分数
    const allScores = [...highScores];
    
    // 检查是否已经存在相同分数
    const existingIndex = allScores.findIndex(s => s.score === newScore);
    if (existingIndex === -1) {
      // 如果是新分数，添加到数组中
      allScores.push(newScoreRecord);
    } else {
      // 如果分数已存在，只在新分数时间更晚时更新
      if (newScoreRecord.time > allScores[existingIndex].time) {
        allScores[existingIndex] = newScoreRecord;
      }
    }

    // 按分数降序排序，相同分数按时间降序
    const newHighScores = allScores
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // 首先按分数降序
        }
        // 如果分数相同，按时间降序
        return new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`);
      })
      .slice(0, 10); // 只保留前10名
    
    setHighScores(newHighScores);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(newHighScores));
  }, [highScores]);

  // 在游戏结束时更新高分
  useEffect(() => {
    if (gameOver && score > 0) {
      updateHighScores(score);
    }
  }, [gameOver, score, updateHighScores]);

  // 生成随机食物位置
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    // 确保食物不会出现在蛇身上
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);
  // 检查碰撞
  const checkCollision = (head) => {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // 检查自身碰撞
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  };
  // 移动蛇
  const moveSnake = useCallback(() => {
    const newSnake = [...snake];
    const head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y
    };

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 1);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, generateFood]);

  // 自动寻路
  const findPath = useCallback(() => {
    if (!snake.length || !food) return;

    const head = snake[0];
    const queue = [head];
    const visited = new Set();
    const previous = new Map();

    visited.add(`${head.x},${head.y}`);

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.x === food.x && current.y === food.y) {
        // 找到路径
        const path = [];
        let pos = current;
        while (pos && (pos.x !== head.x || pos.y !== head.y)) {
          path.unshift(pos);
          pos = previous.get(`${pos.x},${pos.y}`);
        }
        if (path.length > 0) {
          const nextMove = path[0];
          const dx = nextMove.x - head.x;
          const dy = nextMove.y - head.y;
          setDirection({ x: dx, y: dy });
        }
        return;
      }

      const neighbors = getNeighbors(current, snake, GRID_SIZE);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          previous.set(key, current);
          queue.push(neighbor);
        }
      }
    }
  }, [snake, food]);

  // 自动模式下的游戏循环
  useEffect(() => {
    if (isAutoPlay && isPlaying && !gameOver) {
      findPath();
    }
  }, [isAutoPlay, isPlaying, gameOver, findPath]);

  // 游戏主循环
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 100);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [isPlaying, gameOver, moveSnake]);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isAutoPlay) {
        switch (e.key) {
          case 'ArrowUp':
            setDirection(DIRECTIONS.UP);
            break;
          case 'ArrowDown':
            setDirection(DIRECTIONS.DOWN);
            break;
          case 'ArrowLeft':
            setDirection(DIRECTIONS.LEFT);
            break;
          case 'ArrowRight':
            setDirection(DIRECTIONS.RIGHT);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoPlay]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsPlaying(!isPlaying)}
                sx={{ mr: 1 }}
              >
                {isPlaying ? '暂停' : '开始'}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setIsAutoPlay(!isAutoPlay);
                  if (!isAutoPlay) setIsPlaying(true);
                }}
                color="secondary"
                sx={{ mr: 1 }}
              >
                {isAutoPlay ? '手动模式' : '自动模式'}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSnake(INITIAL_SNAKE);
                  setFood(generateFood());
                  setDirection(DIRECTIONS.UP);
                  setGameOver(false);
                  setScore(0);
                  setIsPlaying(false);
                  setIsAutoPlay(false);
                }}
                color="error"
              >
                重置
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                gap: '1px',
                backgroundColor: '#ccc',
                padding: '10px',
                border: '1px solid #999'
              }}
            >
              {Array(GRID_SIZE).fill().map((_, y) =>
                Array(GRID_SIZE).fill().map((_, x) => {
                  const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                  const isHead = snake[0]?.x === x && snake[0]?.y === y;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <Box
                      key={`${x}-${y}`}
                      sx={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: isHead ? '#2196f3' :
                          isSnake ? '#4caf50' :
                          isFood ? '#f44336' : '#fff',
                        transition: 'background-color 0.2s'
                      }}
                    />
                  );
                })
              )}
            </Box>

            {gameOver && (
              <Typography variant="h5" sx={{ mt: 2, color: 'error.main' }}>
                游戏结束！
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              得分: {score}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              历史最高分
            </Typography>
            <Box sx={{ mt: 1 }}>
              {highScores.map((score, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  #{index + 1}: {score.score} ({score.date})
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SnakeGame;
