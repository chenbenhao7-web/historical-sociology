import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Button, Typography, Grid, Paper, ButtonGroup } from '@mui/material';

const GRID_SIZE = 31;
const CELL_SIZE = 18;

const ALGORITHMS = {
  DIJKSTRA: 'Dijkstra',
  ASTAR: 'A*',
  BFS: 'BFS'
};

function MazeGame() {
  const [maze, setMaze] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(ALGORITHMS.DIJKSTRA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [path, setPath] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);

  // 添加动画延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 添加取消标志的 ref
  const cancelCurrentSearch = useRef(false);

  // 添加一个标记当前运行算法的 ref
  const currentAlgorithmRef = useRef(null);

  // 初始化迷宫
  const initializeMaze = useCallback(() => {
    const newMaze = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill(1) // 1表示墙壁
    );
    setMaze(newMaze);
    setStart(null);
    setEnd(null);
    setPath([]);
    setVisitedCells([]);
  }, []);

  // 生成迷宫（使用DFS生成算法）
  const generateMaze = useCallback(() => {
    setIsGenerating(true);
    // 初始化全是墙的迷宫
    const newMaze = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(1));
    
    // DFS生成迷宫
    const dfs = (x, y) => {
      newMaze[y][x] = 0; // 把当前位置设为路

      // 四个方向：上、右、下、左
      const directions = [
        [0, -2], [2, 0], [0, 2], [-2, 0]
      ];
      
      // 随机打乱方向
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }

      // 向四个方向探索
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        // 检查是否在边界内且是墙
        if (newX > 0 && newX < GRID_SIZE - 1 && 
            newY > 0 && newY < GRID_SIZE - 1 && 
            newMaze[newY][newX] === 1) {
          // 把中间的墙打通
          newMaze[y + dy/2][x + dx/2] = 0;
          dfs(newX, newY);
        }
      }
    };

    // 从左上角开始生成迷宫
    dfs(1, 1);

    // 确保起点和终点是通路
    newMaze[1][1] = 0;  // 起点
    newMaze[GRID_SIZE-2][GRID_SIZE-2] = 0;  // 终点
    
    // 确保起点和终点周围有路可走
    newMaze[1][2] = 0;
    newMaze[2][1] = 0;
    newMaze[GRID_SIZE-2][GRID_SIZE-3] = 0;
    newMaze[GRID_SIZE-3][GRID_SIZE-2] = 0;

    setMaze(newMaze);
    setStart({ x: 1, y: 1 });
    setEnd({ x: GRID_SIZE-2, y: GRID_SIZE-2 });
    setIsGenerating(false);
  }, []);

  // 修改算法切换处理
  const handleAlgorithmChange = (newAlgorithm) => {
    // 如果有搜索正在进行，取消它
    if (isSearching) {
      cancelCurrentSearch.current = true;
      currentAlgorithmRef.current = null;
    }
    setCurrentAlgorithm(newAlgorithm);
    setPath([]);
    setVisitedCells([]);
    setIsSearching(false);
  };

  // 修改 Dijkstra 算法
  const dijkstra = useCallback(async () => {
    if (!start || !end) return;
    
    // 设置当前运行的算法
    currentAlgorithmRef.current = 'dijkstra';
    const thisAlgorithmId = 'dijkstra';
    
    setIsSearching(true);
    setPath([]);
    setVisitedCells([]);
    cancelCurrentSearch.current = false;

    try {
      const visited = new Set();
      const distances = new Map();
      const previous = new Map();
      const queue = [];
      
      // 初始化距离
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const key = `${x},${y}`;
          distances.set(key, Infinity);
          queue.push({ x, y });
        }
      }
      distances.set(`${start.x},${start.y}`, 0);

      // 搜索过程动画
      while (queue.length > 0) {
        // 如果当前算法已经不是 Dijkstra 或被取消，立即停止
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        // 找到距离最小的节点
        queue.sort((a, b) => {
          return distances.get(`${a.x},${a.y}`) - distances.get(`${b.x},${b.y}`);
        });
        const current = queue.shift();
        const currentKey = `${current.x},${current.y}`;
        
        if (current.x === end.x && current.y === end.y) break;
        if (visited.has(currentKey)) continue;
        
        visited.add(currentKey);
        
        // 添加访问动画
        setVisitedCells(prev => [...prev, current]);
        await delay(20);
        
        // 再次检查是否需要停止
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        // 检查相邻节点
        const neighbors = [
          { x: current.x - 1, y: current.y },
          { x: current.x + 1, y: current.y },
          { x: current.x, y: current.y - 1 },
          { x: current.x, y: current.y + 1 }
        ];

        for (const neighbor of neighbors) {
          if (cancelCurrentSearch.current) break;
          if (neighbor.x < 0 || neighbor.x >= GRID_SIZE || 
              neighbor.y < 0 || neighbor.y >= GRID_SIZE ||
              maze[neighbor.y][neighbor.x] === 1) continue;

          const neighborKey = `${neighbor.x},${neighbor.y}`;
          const distance = distances.get(currentKey) + 1;

          if (distance < distances.get(neighborKey)) {
            distances.set(neighborKey, distance);
            previous.set(neighborKey, current);
          }
        }
      }

      // 路径回溯动画
      const finalPath = [];
      let current = end;
      while (current) {
        // 检查是否需要停止
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        finalPath.unshift(current);
        const currentKey = `${current.x},${current.y}`;
        current = previous.get(currentKey);
        
        setPath([...finalPath]);
        await delay(50);
      }
    } finally {
      // 只有当这个算法实例仍然是当前运行的算法时，才重置状态
      if (currentAlgorithmRef.current === thisAlgorithmId) {
        setIsSearching(false);
        currentAlgorithmRef.current = null;
      }
    }
  }, [start, end, maze]);

  // A*算法
  const astar = useCallback(async () => {
    if (!start || !end) return;
    
    // 设置当前运行的算法
    currentAlgorithmRef.current = 'astar';
    const thisAlgorithmId = 'astar';
    
    setIsSearching(true);
    setPath([]);
    setVisitedCells([]);
    cancelCurrentSearch.current = false;

    try {
      // 启发式函数：曼哈顿距离
      const heuristic = (pos) => {
        return Math.abs(pos.x - end.x) + Math.abs(pos.y - end.y);
      };

      const openSet = [start];
      const closedSet = new Set();
      const gScore = new Map();
      const fScore = new Map();
      const previous = new Map();
      
      gScore.set(`${start.x},${start.y}`, 0);
      fScore.set(`${start.x},${start.y}`, heuristic(start));

      while (openSet.length > 0) {
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        // 找到 f 值最小的节点
        openSet.sort((a, b) => {
          return fScore.get(`${a.x},${a.y}`) - fScore.get(`${b.x},${b.y}`);
        });
        
        const current = openSet.shift();
        const currentKey = `${current.x},${current.y}`;

        if (current.x === end.x && current.y === end.y) break;

        closedSet.add(currentKey);
        setVisitedCells(prev => [...prev, current]);
        await delay(20);

        // 检查相邻节点
        const neighbors = [
          { x: current.x - 1, y: current.y },
          { x: current.x + 1, y: current.y },
          { x: current.x, y: current.y - 1 },
          { x: current.x, y: current.y + 1 }
        ];

        for (const neighbor of neighbors) {
          if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
            return;
          }

          if (neighbor.x < 0 || neighbor.x >= GRID_SIZE || 
              neighbor.y < 0 || neighbor.y >= GRID_SIZE ||
              maze[neighbor.y][neighbor.x] === 1) continue;

          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (closedSet.has(neighborKey)) continue;

          const tentativeGScore = gScore.get(currentKey) + 1;

          if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
            openSet.push(neighbor);
          } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
            continue;
          }

          previous.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor));
        }
      }

      // 路径回溯动画
      const finalPath = [];
      let current = end;
      while (current) {
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        finalPath.unshift(current);
        const currentKey = `${current.x},${current.y}`;
        current = previous.get(currentKey);
        
        setPath([...finalPath]);
        await delay(50);
      }
    } finally {
      if (currentAlgorithmRef.current === thisAlgorithmId) {
        setIsSearching(false);
        currentAlgorithmRef.current = null;
      }
    }
  }, [start, end, maze]);

  // BFS算法
  const bfs = useCallback(async () => {
    if (!start || !end) return;
    
    // 设置当前运行的算法
    currentAlgorithmRef.current = 'bfs';
    const thisAlgorithmId = 'bfs';
    
    setIsSearching(true);
    setPath([]);
    setVisitedCells([]);
    cancelCurrentSearch.current = false;

    try {
      const queue = [start];
      const visited = new Set();
      const previous = new Map();
      
      visited.add(`${start.x},${start.y}`);

      while (queue.length > 0) {
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        const current = queue.shift();
        setVisitedCells(prev => [...prev, current]);
        await delay(20);

        if (current.x === end.x && current.y === end.y) break;

        // 检查相邻节点（按照上、右、下、左的顺序，使路径更美观）
        const neighbors = [
          { x: current.x, y: current.y - 1 },
          { x: current.x + 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x - 1, y: current.y }
        ];

        for (const neighbor of neighbors) {
          if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
            return;
          }

          if (neighbor.x < 0 || neighbor.x >= GRID_SIZE || 
              neighbor.y < 0 || neighbor.y >= GRID_SIZE ||
              maze[neighbor.y][neighbor.x] === 1) continue;

          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (visited.has(neighborKey)) continue;

          visited.add(neighborKey);
          previous.set(neighborKey, current);
          queue.push(neighbor);
        }
      }

      // 路径回溯动画
      const finalPath = [];
      let current = end;
      while (current) {
        if (currentAlgorithmRef.current !== thisAlgorithmId || cancelCurrentSearch.current) {
          return;
        }

        finalPath.unshift(current);
        const currentKey = `${current.x},${current.y}`;
        current = previous.get(currentKey);
        
        setPath([...finalPath]);
        await delay(50);
      }
    } finally {
      if (currentAlgorithmRef.current === thisAlgorithmId) {
        setIsSearching(false);
        currentAlgorithmRef.current = null;
      }
    }
  }, [start, end, maze]);

  // 修改 runAlgorithm 函数
  const runAlgorithm = useCallback(() => {
    // 如果有算法正在运行，先取消它
    if (currentAlgorithmRef.current) {
      cancelCurrentSearch.current = true;
      currentAlgorithmRef.current = null;
    }

    switch (currentAlgorithm) {
      case ALGORITHMS.DIJKSTRA:
        dijkstra();
        break;
      case ALGORITHMS.ASTAR:
        astar();
        break;
      case ALGORITHMS.BFS:
        bfs();
        break;
      default:
        break;
    }
  }, [currentAlgorithm, dijkstra, astar, bfs]);

  // 初始化
  useEffect(() => {
    initializeMaze();
  }, [initializeMaze]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <ButtonGroup variant="contained" sx={{ mb: 2 }}>
                {Object.values(ALGORITHMS).map(algo => (
                  <Button
                    key={algo}
                    onClick={() => handleAlgorithmChange(algo)}
                    variant={currentAlgorithm === algo ? "contained" : "outlined"}
                    disabled={isGenerating}
                    sx={{ 
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        backgroundColor: currentAlgorithm === algo ? 'primary.dark' : 'transparent'
                      }
                    }}
                  >
                    {algo}
                  </Button>
                ))}
              </ButtonGroup>
              <Button
                variant="contained"
                onClick={generateMaze}
                disabled={isGenerating || isSearching}
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
                生成新迷宫
              </Button>
              <Button
                variant="contained"
                onClick={runAlgorithm}
                disabled={!start || !end || isGenerating || isSearching}
                sx={{ 
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                开始寻路
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                backgroundColor: 'transparent',
                padding: '10px',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              {maze.map((row, y) => 
                row.map((cell, x) => {
                  const isStart = start && start.x === x && start.y === y;
                  const isEnd = end && end.x === x && end.y === y;
                  const isPath = path.some(p => p.x === x && p.y === y);
                  const isVisited = visitedCells.some(p => p.x === x && p.y === y);

                  return (
                    <Box
                      key={`${x}-${y}`}
                      sx={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: 
                          isStart ? 'rgba(76, 175, 80, 0.9)' :
                          isEnd ? 'rgba(244, 67, 54, 0.9)' :
                          cell === 1 ? 'rgba(51, 51, 51, 0.8)' :
                          isPath ? 'rgba(33, 150, 243, 0.9)' :
                          isVisited ? 'rgba(33, 150, 243, 0.2)' :
                          'transparent',
                        transition: 'all 0.3s ease-in-out',
                        transform: isPath ? 'scale(1.1)' : 'scale(1)',
                        zIndex: isPath ? 2 : 1,
                        position: 'relative',
                        '&::after': isPath ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.4) 0%, transparent 70%)',
                          animation: 'pulse 1s infinite'
                        } : {}
                      }}
                    />
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item>
          <Paper elevation={3} sx={{ p: 3, width: '300px' }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ mb: 3 }}
            >
              算法说明
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentAlgorithm === ALGORITHMS.DIJKSTRA && (
                <Typography variant="h6" sx={{ lineHeight: 1.6 }}>
                  Dijkstra算法通过计算从起点到每个节点的最短距离来找到最短路径。
                </Typography>
              )}
              {currentAlgorithm === ALGORITHMS.ASTAR && (
                <Typography variant="h6" sx={{ lineHeight: 1.6 }}>
                  A*算法使用启发式函数来优化搜索方向，通常比Dijkstra更快找到目标。
                </Typography>
              )}
              {currentAlgorithm === ALGORITHMS.BFS && (
                <Typography variant="h6" sx={{ lineHeight: 1.6 }}>
                  广度优先搜索(BFS)按层级扩展搜索范围，保证找到的第一条路径是最短的。
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 添加动画关键帧 */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.4;
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </Box>
  );
}

export default MazeGame; 