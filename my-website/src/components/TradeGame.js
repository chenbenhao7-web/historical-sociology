import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';

const GRID_SIZE = 50;
const CELL_SIZE = 12;
const MAX_WEALTH = 1000; // 最大财富值

function TradeGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [grid, setGrid] = useState([]);
  const gameLoopRef = useRef(null);

  // 初始化网格
  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => ({
        wealth: Math.floor(Math.random() * 100) + 50 // 初始财富50-150
      }))
    );
    setGrid(newGrid);
    setGeneration(0);
  }, []);

  // 获取单元格颜色 - 使用热力图颜色
  const getCellColor = (wealth) => {
    const ratio = wealth / MAX_WEALTH;
    if (ratio < 0.2) {
      // 从黑色到红色
      const r = Math.floor((ratio / 0.2) * 255);
      return `rgb(${r}, 0, 0)`;
    } else if (ratio < 0.6) {
      // 从红色到黄色
      const g = Math.floor(((ratio - 0.2) / 0.4) * 255);
      return `rgb(255, ${g}, 0)`;
    } else {
      // 从黄色到白色
      const b = Math.floor(((ratio - 0.6) / 0.4) * 255);
      return `rgb(255, 255, ${b})`;
    }
  };

  // 处理交易
  const handleTrade = (cell1, cell2) => {
    const tradeAmount = cell1.wealth * 0.1; // 交易10%的财富
    if (Math.random() < 0.5) {
      cell1.wealth -= tradeAmount;
      cell2.wealth += tradeAmount;
    } else {
      cell1.wealth += tradeAmount;
      cell2.wealth -= tradeAmount;
    }
    // 确保财富不会小于0
    cell1.wealth = Math.max(0, cell1.wealth);
    cell2.wealth = Math.max(0, cell2.wealth);
  };

  // 计算财富分配统计
  const getWealthStats = useCallback(() => {
    const allWealth = grid.flat().map(cell => cell.wealth).sort((a, b) => b - a);
    const totalWealth = allWealth.reduce((sum, w) => sum + w, 0);
    const totalCells = allWealth.length;

    // 计算不同百分比的财富占比
    const top1Count = Math.floor(totalCells * 0.01);
    const top10Count = Math.floor(totalCells * 0.1);
    const top50Count = Math.floor(totalCells * 0.5);

    const top1Wealth = allWealth.slice(0, top1Count).reduce((sum, w) => sum + w, 0);
    const top10Wealth = allWealth.slice(0, top10Count).reduce((sum, w) => sum + w, 0);
    const top50Wealth = allWealth.slice(0, top50Count).reduce((sum, w) => sum + w, 0);

    // 计算基尼系数
    let gini = 0;
    for (let i = 0; i < totalCells; i++) {
      for (let j = 0; j < totalCells; j++) {
        gini += Math.abs(allWealth[i] - allWealth[j]);
      }
    }
    gini = gini / (2 * totalCells * totalWealth);

    return {
      top1Percent: (top1Wealth / totalWealth * 100).toFixed(1),
      top10Percent: (top10Wealth / totalWealth * 100).toFixed(1),
      top50Percent: (top50Wealth / totalWealth * 100).toFixed(1),
      gini: gini.toFixed(3),
      maxWealth: Math.max(...allWealth).toFixed(0),
      avgWealth: (totalWealth / totalCells).toFixed(0)
    };
  }, [grid]);

  // 游戏主循环
  const gameLoop = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({...cell})));
      
      // 每个格子都进行一次交易
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          // 随机选择一个邻居方向
          const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
          ].filter(([dx, dy]) => 
            y + dy >= 0 && y + dy < GRID_SIZE && 
            x + dx >= 0 && x + dx < GRID_SIZE
          );

          if (directions.length > 0) {
            const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
            handleTrade(newGrid[y][x], newGrid[y + dy][x + dx]);
          }
        }
      }
      return newGrid;
    });

    setGeneration(g => g + 1);
  }, []);

  // 开始/暂停游戏
  const toggleGame = () => {
    if (isRunning) {
      clearInterval(gameLoopRef.current);
    } else {
      gameLoopRef.current = setInterval(gameLoop, 100);
    }
    setIsRunning(!isRunning);
  };

  // 重置游戏
  const resetGame = () => {
    clearInterval(gameLoopRef.current);
    setIsRunning(false);
    initializeGrid();
  };

  // 初始化
  useEffect(() => {
    initializeGrid();
    return () => clearInterval(gameLoopRef.current);
  }, [initializeGrid]);

  const stats = getWealthStats();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        <Grid item>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={toggleGame}
                sx={{ 
                  mr: 1,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                {isRunning ? '暂停' : '开始'}
              </Button>
              <Button
                variant="contained"
                onClick={resetGame}
                color="secondary"
                sx={{ 
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'secondary.dark'
                  }
                }}
              >
                重置
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                backgroundColor: '#000',
                padding: '10px',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              {grid.map((row, y) => 
                row.map((cell, x) => (
                  <Box
                    key={`${x}-${y}`}
                    sx={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: getCellColor(cell.wealth),
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper elevation={3} sx={{ p: 2, width: '280px' }}>
            <Typography 
              variant="h6"
              gutterBottom 
              sx={{ mb: 2 }}
            >
              财富分配统计
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1">
                代数: {generation}
              </Typography>
              <Typography variant="body1">
                最高财富: {stats.maxWealth}
              </Typography>
              <Typography variant="body1">
                平均财富: {stats.avgWealth}
              </Typography>
              <Typography variant="body1" sx={{ color: '#1976d2' }}>
                前1%人口占有财富: {stats.top1Percent}%
              </Typography>
              <Typography variant="body1" sx={{ color: '#1976d2' }}>
                前10%人口占有财富: {stats.top10Percent}%
              </Typography>
              <Typography variant="body1" sx={{ color: '#1976d2' }}>
                前50%人口占有财富: {stats.top50Percent}%
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#d32f2f', 
                fontWeight: 'bold' 
              }}>
                基尼系数: {stats.gini}
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 2, width: '280px' }}>
            <Typography 
              variant="h6"
              gutterBottom 
              sx={{ mb: 2 }}
            >
              游戏说明
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                每个方格代表一个经济个体，颜色深浅表示财富多少：
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.4, 
                  color: '#000',
                  backgroundColor: '#ffffff',
                  px: 1,
                  display: 'inline-block',
                  borderRadius: '4px',
                  mb: 0.5  // 添加一点底部间距
                }}>
                  • 黑色：财富接近零
                </Typography>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.4, 
                  color: '#ff0000',
                  backgroundColor: '#e8f4ff',  // 浅蓝色背景
                  px: 1,
                  display: 'inline-block',
                  borderRadius: '4px',
                  mb: 0.5
                }}>
                  • 红色：低财富水平
                </Typography>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.4, 
                  color: '#ffff00',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  px: 1,
                  display: 'inline-block',
                  borderRadius: '4px',
                  mb: 0.5
                }}>
                  • 黄色：中等财富
                </Typography>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.4, 
                  color: '#ffffff',
                  backgroundColor: '#333333',
                  px: 1,
                  display: 'inline-block',
                  borderRadius: '4px',
                  mb: 0.5
                }}>
                  • 白色：最高财富
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                交易规则：
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                每轮中，每个方格都会随机选择上下左右的邻居进行交易，给出或收取10%的财富。
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TradeGame; 